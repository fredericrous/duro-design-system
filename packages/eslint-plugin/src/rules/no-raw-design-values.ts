import type {TSESLint, TSESTree} from '@typescript-eslint/utils'
import {
  BORDER_SHORTHAND_PROPERTIES,
  BORDER_TOKENS_BY_PX,
  BORDER_WIDTH_PROPERTIES,
  BORDER_WIDTH_TOKENS,
  BREAKPOINT_TOKENS_BY_PX,
  COLOR_TOKENS,
  COLOR_TOKENS_NORMALIZED,
  DURATION_TOKENS_BY_MS,
  EASING_TOKENS,
  FONT_SIZE_TOKENS_BY_REM,
  FONT_WEIGHT_TOKENS,
  MICRO_SPACING_TOKENS_BY_PX,
  OUTLINE_OFFSET_TOKENS,
  OUTLINE_WIDTH_TOKENS,
  RADII_PROPERTIES,
  RADII_TOKENS_BY_PX,
  SHADOW_TOKENS,
  SIZE_PROPERTIES,
  SIZE_TOKENS_BY_PX,
  SPACING_PROPERTIES,
  SPACING_TOKENS_BY_PX,
  normalizeHex,
  normalizeValue,
} from '../util/tokens.js'
import {ensureNamedImport} from '../util/imports.js'
import {matchesAnyGlob} from '../util/glob.js'

type MessageIds =
  | 'rawColorToken'
  | 'rawColor'
  | 'rawSpacing'
  | 'rawMicroSpacing'
  | 'rawRadius'
  | 'offScaleSpacing'
  | 'offScaleRadius'
  | 'rawBreakpoint'
  | 'rawFontSize'
  | 'rawFontWeight'
  | 'rawShadow'
  | 'rawDuration'
  | 'rawEasing'
  | 'rawMeasure'
  | 'ambiguousMeasure'
  | 'missingMeasureToken'
  | 'nearestMeasureRole'
  | 'rawShadowLength'
  | 'rawTrack'
  | 'replaceWithToken'
type Options = [
  {
    factories?: string[]
    spacingProperties?: string[]
    radiiProperties?: string[]
    exemptFiles?: string[]
  }?,
]

const HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/
const FUNC_COLOR_RE = /\b(?:rgba?|hsla?)\([^)]*\)/
const BREAKPOINT_KEY_RE = /^@(?:media|container)\b.*\b(?:min|max)-(?:width|height)\s*:\s*(\d+)px/
const TOKENS_PKG = '@duro-app/tokens'

const FONT_SIZE_PROPERTIES = new Set(['fontSize'])
const FONT_WEIGHT_PROPERTIES = new Set(['fontWeight'])
const SHADOW_PROPERTIES = new Set(['boxShadow'])
const DURATION_PROPERTIES = new Set(['transitionDuration', 'animationDuration'])
const EASING_PROPERTIES = new Set(['transitionTimingFunction', 'animationTimingFunction'])

const PX_RE = /^(-?)(\d+(?:\.\d+)?)px$/
const STATIC_PX_RE = /\d+(?:\.\d+)?px/
const TRACK_PROPERTIES = new Set([
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridAutoColumns',
  'gridAutoRows',
])

type MeasureGroup = 'sizes' | 'borders'
interface Measure {
  group: MeasureGroup
  /** Every token this property may use, with its px value, in key order. */
  tokens: [token: string, px: number][]
}

type Axis = 'width' | 'height'

const WIDTH_PROPERTIES = new Set([
  'width',
  'minWidth',
  'maxWidth',
  'inlineSize',
  'minInlineSize',
  'maxInlineSize',
])
const HEIGHT_PROPERTIES = new Set([
  'height',
  'minHeight',
  'maxHeight',
  'blockSize',
  'minBlockSize',
  'maxBlockSize',
])

/**
 * The axis a size token names: `…W`/`…MinW`/`…MaxW` is a width and
 * `…H`/`…MinH`/`…MaxH` a height, with an optional step after it
 * (`popoverWSm`, `listMaxHSm`). Anything else (`touchTarget`, `gridColSm`)
 * fits both.
 */
function tokenAxis(token: string): Axis | null {
  const match = /[a-z](?:Min|Max)?([WH])(?:Xs|Sm|Md|Lg|Xl)?$/.exec(token)
  if (!match) return null
  return match[1] === 'W' ? 'width' : 'height'
}

function propertyAxis(property: string): Axis | null {
  if (WIDTH_PROPERTIES.has(property)) return 'width'
  if (HEIGHT_PROPERTIES.has(property)) return 'height'
  return null // flexBasis runs along either axis
}

const entriesOf = (table: Record<number, string[]>) =>
  Object.entries(table).flatMap(([px, tokens]) =>
    tokens.map((token) => [token, Number(px)] as [string, number]),
  )

const borderTokens = (allowed: string[]) =>
  entriesOf(BORDER_TOKENS_BY_PX).filter(([token]) => allowed.includes(token))

/** Which token set a measure property draws from; null for any other property. */
function measureFor(property: string): Measure | null {
  if (SIZE_PROPERTIES.has(property)) {
    const axis = propertyAxis(property)
    const tokens = entriesOf(SIZE_TOKENS_BY_PX).filter(([token]) => {
      const own = tokenAxis(token)
      return own === null || axis === null || own === axis
    })
    return {group: 'sizes', tokens}
  }
  if (property === 'outlineOffset') {
    return {group: 'borders', tokens: borderTokens(OUTLINE_OFFSET_TOKENS)}
  }
  if (property === 'outlineWidth' || property === 'outline') {
    return {group: 'borders', tokens: borderTokens(OUTLINE_WIDTH_TOKENS)}
  }
  if (BORDER_WIDTH_PROPERTIES.has(property) || BORDER_SHORTHAND_PROPERTIES.has(property)) {
    return {group: 'borders', tokens: borderTokens(BORDER_WIDTH_TOKENS)}
  }
  return null
}

/** Tokens of `measure` at exactly `px`, in key order. */
function candidatesAt(measure: Measure, px: number): string[] {
  return measure.tokens.filter(([, value]) => value === px).map(([token]) => token)
}

/** How far a value may sit from a token for that token to be its nearest role. */
const NEAREST_ROLE_TOLERANCE = 0.1

/**
 * The tokens at the nearest value within ±10% of `px`, as `[value, tokens]`
 * pairs: one pair, or two (smaller value first) when two values are equally
 * near. Empty when nothing is that close.
 */
function nearestRoles(measure: Measure, px: number): [number, string[]][] {
  const limit = px * NEAREST_ROLE_TOLERANCE
  const values = [...new Set(measure.tokens.map(([, value]) => value))]
  const near = values.filter((value) => Math.abs(value - px) <= limit)
  if (near.length === 0) return []
  const best = Math.min(...near.map((value) => Math.abs(value - px)))
  return near
    .filter((value) => Math.abs(value - px) === best)
    .sort((a, b) => a - b)
    .map((value) => [value, candidatesAt(measure, value)])
}

const scale = (table: Record<number, string>) =>
  Object.keys(table)
    .map(Number)
    .sort((a, b) => a - b)
    .join(' / ')

/**
 * Inside css.create() style objects, flag raw design values — anything with a
 * token equivalent, and anything on a tokenised property that is off the
 * scale:
 *
 * - colors: a hex / rgb() / hsl() literal anywhere. A palette value suggests
 *   its token; an off-palette one reports without a fix.
 * - spacing and radius: a px value on the properties where that mapping is
 *   unambiguous. On the scale → suggest the token; off the scale (`marginTop:
 *   23`) → report, because "not a token" is the finding.
 * - breakpoints: a px inside a `@media` / `@container` condition key. On the
 *   scale → suggest the `breakpoints.<key>` template-literal key.
 * - font size (px or rem), font weight, box-shadow, transition/animation
 *   duration and timing function: a literal suggests its token when one
 *   matches, else reports.
 *
 * - sizes and border widths: a px length on width/height (and min/max,
 *   flexBasis, block/inline size), on border*Width / outlineWidth /
 *   outlineOffset and on the width inside a border* / outline shorthand,
 *   negatives included. Each property has its own candidate tokens (sizes.*,
 *   borders hairline/strong/accent, focusRing, focusOffset/focusOffsetSm),
 *   filtered by axis: a `…W` token is only offered on a width property and a
 *   `…H` token on a height one. One match suggests it; several give one
 *   suggestion each; none names the nearest role (every token at the nearest
 *   value within ±10%, both values smaller first on a tie), or says to add a
 *   token when nothing is that close. Percent, viewport, em/rem/ch, keywords
 *   and calc() without a px are fine.
 * - box-shadow in a template literal: a px length in its static text is a raw
 *   shadow (`inset 0 0 0 1px ${colors.border}`); use a `shadows.*` token.
 *
 * Option `exemptFiles` (globs) silences the rule for whole files.
 *
 * Skipped on purpose: 0, negatives on the spacing properties, shorthands
 * ('8px 16px', 'opacity 150ms'), identifiers, member expressions, template
 * literals and calls — the rule reads literals, not expressions (the size,
 * border-width and box-shadow properties also read static px text in template
 * literals).
 */
export const noRawDesignValues: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer design tokens over raw colors, lengths, sizes, border widths, breakpoints, type, shadows and motion in css.create styles',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          factories: {type: 'array', items: {type: 'string'}, uniqueItems: true},
          spacingProperties: {type: 'array', items: {type: 'string'}, uniqueItems: true},
          radiiProperties: {type: 'array', items: {type: 'string'}, uniqueItems: true},
          exemptFiles: {type: 'array', items: {type: 'string'}, uniqueItems: true},
        },
        additionalProperties: false,
      },
    ],
    messages: {
      rawColorToken:
        "'{{value}}' is the {{token}} token. Use `colors.{{token}}` from {{pkg}}/tokens/colors.css so it follows the theme.",
      rawColor:
        "'{{value}}' is not in the palette. Use a semantic token from {{pkg}}/tokens/colors.css instead of a raw color.",
      rawSpacing:
        '{{value}} on `{{property}}` is the {{token}} spacing token. Use `spacing.{{token}}` from {{pkg}}/tokens/spacing.css.',
      rawRadius:
        '{{value}} on `{{property}}` is the {{token}} radius token. Use `radii.{{token}}` from {{pkg}}/tokens/spacing.css.',
      rawMicroSpacing:
        '{{value}} on `{{property}}` is off the spacing scale; it is the {{token}} micro-spacing token. Use `microSpacing.{{token}}` from {{pkg}}/tokens/spacing.css, or the scale if the nudge is not needed.',
      offScaleSpacing:
        '{{value}} on `{{property}}` is off the spacing scale ({{scale}}px). Use the nearest `spacing.*` token from {{pkg}}/tokens/spacing.css, or disable this line with the reason.',
      offScaleRadius:
        '{{value}} on `{{property}}` is off the radius scale ({{scale}}px). Use the nearest `radii.*` token from {{pkg}}/tokens/spacing.css, or disable this line with the reason.',
      rawBreakpoint:
        '{{value}}px in `{{key}}` is a raw breakpoint. Use `breakpoints.{{token}}` from {{pkg}}/tokens/breakpoints.css in a template-literal key (the scale is {{scale}}px).',
      rawFontSize:
        '{{value}} on `fontSize` is the {{group}}.{{token}} token. Use it from {{pkg}}/tokens/typography.css.',
      rawFontWeight:
        '{{value}} on `fontWeight` is the typography.{{token}} token. Use it from {{pkg}}/tokens/typography.css.',
      rawShadow:
        "'{{value}}' on `boxShadow` is a raw shadow. Use `shadows.{{token}}` from {{pkg}}/tokens/shadows.css.",
      rawDuration:
        "'{{value}}' on `{{property}}` is a raw duration. Use `duration.{{token}}` from {{pkg}}/tokens/motion.css.",
      rawEasing:
        "'{{value}}' on `{{property}}` is a raw easing. Use `easing.{{token}}` from {{pkg}}/tokens/motion.css.",
      rawMeasure:
        '{{value}} on `{{property}}` is the {{tokens}} token. Use it from {{pkg}}/tokens/{{group}}.css.',
      ambiguousMeasure:
        '{{value}} on `{{property}}` matches several {{group}} tokens ({{tokens}}). Pick the one that says what this measure is, from {{pkg}}/tokens/{{group}}.css.',
      missingMeasureToken:
        '{{value}} on `{{property}}` has no token. Add a token (design-system.a-missing-token-is-added-not-approximated) instead of using a raw value.',
      nearestMeasureRole:
        '{{value}} on `{{property}}` has no token; nearest role: {{nearest}}. If this measure plays that role, use its token and take its value; if not, add a token (design-system.a-missing-token-is-added-not-approximated).',
      rawShadowLength:
        '{{value}} on `boxShadow` builds a shadow from a raw px length. Use a `shadows.*` token from {{pkg}}/tokens/shadows.css.',
      rawTrack:
        '{{value}} on `{{property}}` sizes a track in px. Put a size token inside it: `minmax(${sizes.gridColSm}, 1fr)` from {{pkg}}/tokens/sizes.css.',
      replaceWithToken: 'Replace with {{replacement}}',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    const factories = options.factories ?? ['css.create']
    const spacingProperties = options.spacingProperties
      ? new Set(options.spacingProperties)
      : SPACING_PROPERTIES
    const radiiProperties = options.radiiProperties
      ? new Set(options.radiiProperties)
      : RADII_PROPERTIES
    const sourceCode = context.sourceCode
    const exemptFiles = options.exemptFiles ?? []
    if (matchesAnyGlob(context.filename, context.cwd, exemptFiles)) return {}

    function calleeText(node: TSESTree.CallExpression): string {
      return sourceCode.getText(node.callee)
    }

    /** A suggestion that swaps `node` for `<importName>.<token>`, importing it. */
    function suggestReplacement(
      node: TSESTree.Node,
      replacement: string,
      importName: string,
      importPath: string,
      render: (local: string) => string = (local) =>
        replacement.replace(`${importName}.`, `${local}.`),
    ): TSESLint.ReportSuggestionArray<MessageIds> {
      return [
        {
          messageId: 'replaceWithToken',
          data: {replacement},
          fix(fixer) {
            const {local, fixes} = ensureNamedImport(
              sourceCode,
              fixer,
              `${TOKENS_PKG}/${importPath}`,
              importName,
            )
            return [...fixes, fixer.replaceText(node, render(local))]
          },
        },
      ]
    }

    /**
     * A px length on a size / border-width property. `fixable` is off for the
     * width inside a shorthand, where a swap would have to rewrite the string.
     */
    function checkMeasure(
      node: TSESTree.Node,
      property: string,
      measure: Measure,
      px: number,
      negative: boolean,
      display: string,
      fixable: boolean,
      suggest: boolean,
    ) {
      if (px === 0) return
      const candidates = candidatesAt(measure, px)
      const data = {
        value: display,
        property,
        group: measure.group,
        tokens: candidates.map((token) => `${measure.group}.${token}`).join(', '),
        pkg: TOKENS_PKG,
      }
      if (candidates.length === 0) {
        const nearest = nearestRoles(measure, px)
        if (nearest.length === 0) {
          context.report({node, messageId: 'missingMeasureToken', data})
          return
        }
        const text = nearest
          .map(
            ([value, tokens]) =>
              `${tokens.map((token) => `\`${measure.group}.${token}\``).join(', ')} (${value})`,
          )
          .join(', ')
        context.report({node, messageId: 'nearestMeasureRole', data: {...data, nearest: text}})
        return
      }
      const suggestions =
        fixable && suggest
          ? candidates.flatMap((token) =>
              suggestReplacement(
                node,
                `${measure.group}.${token}`,
                measure.group,
                `tokens/${measure.group}.css`,
                negative ? (local) => `\`calc(-1 * \${${local}.${token}})\`` : undefined,
              ),
            )
          : []
      context.report({
        node,
        messageId: candidates.length > 1 ? 'ambiguousMeasure' : 'rawMeasure',
        data,
        suggest: suggestions,
      })
    }

    /** Static text holding a `<number>px` inside calc() or a template literal. */
    function checkStaticPx(node: TSESTree.Node, property: string, text: string, display: string) {
      if (STATIC_PX_RE.test(text)) {
        context.report({
          node,
          messageId: 'missingMeasureToken',
          data: {value: display, property},
        })
      }
    }

    function checkMeasureString(
      node: TSESTree.Node,
      property: string,
      measure: Measure,
      value: string,
      suggest: boolean,
    ) {
      const text = value.trim()
      const display = `'${value}'`
      const px = PX_RE.exec(text)
      if (px) {
        checkMeasure(node, property, measure, Number(px[2]), px[1] === '-', display, true, suggest)
        return
      }
      if (BORDER_SHORTHAND_PROPERTIES.has(property)) {
        // The width is a bare px word outside any function call.
        const words = text.replace(/\([^)]*\)/g, ' ').split(/\s+/)
        const width = words.map((word) => PX_RE.exec(word)).find(Boolean)
        if (width) {
          checkMeasure(node, property, measure, Number(width[2]), false, display, false, suggest)
        }
        return
      }
      if (/\bcalc\(/.test(text)) checkStaticPx(node, property, text, display)
    }

    function checkColorValue(node: TSESTree.Node, raw: string, suggest: boolean) {
      const match = HEX_RE.exec(raw) ?? FUNC_COLOR_RE.exec(raw)
      if (!match) return
      const literal = match[0]
      const token = literal.startsWith('#')
        ? COLOR_TOKENS[normalizeHex(literal)]
        : COLOR_TOKENS_NORMALIZED[normalizeValue(literal)]
      if (token) {
        // Only suggest a direct replacement when the literal IS the color —
        // inside a compound value (a boxShadow) the rewrite would be wrong.
        const isWholeValue = raw.trim() === literal
        context.report({
          node,
          messageId: 'rawColorToken',
          data: {value: literal, token, pkg: TOKENS_PKG},
          suggest:
            isWholeValue && suggest
              ? suggestReplacement(node, `colors.${token}`, 'colors', 'tokens/colors.css')
              : [],
        })
      } else {
        context.report({node, messageId: 'rawColor', data: {value: literal, pkg: TOKENS_PKG}})
      }
    }

    function checkPxValue(
      node: TSESTree.Node,
      property: string,
      px: number,
      display: string,
      suggest: boolean,
    ) {
      if (spacingProperties.has(property)) {
        const token = SPACING_TOKENS_BY_PX[px]
        const micro = MICRO_SPACING_TOKENS_BY_PX[px]
        if (!token && micro) {
          context.report({
            node,
            messageId: 'rawMicroSpacing',
            data: {value: display, property, token: micro, pkg: TOKENS_PKG},
            suggest: suggest
              ? suggestReplacement(
                  node,
                  `microSpacing.${micro}`,
                  'microSpacing',
                  'tokens/spacing.css',
                )
              : [],
          })
          return
        }
        if (!token) {
          context.report({
            node,
            messageId: 'offScaleSpacing',
            data: {value: display, property, scale: scale(SPACING_TOKENS_BY_PX), pkg: TOKENS_PKG},
          })
          return
        }
        context.report({
          node,
          messageId: 'rawSpacing',
          data: {value: display, property, token, pkg: TOKENS_PKG},
          suggest: suggest
            ? suggestReplacement(node, `spacing.${token}`, 'spacing', 'tokens/spacing.css')
            : [],
        })
      } else if (radiiProperties.has(property)) {
        const token = RADII_TOKENS_BY_PX[px]
        if (!token) {
          context.report({
            node,
            messageId: 'offScaleRadius',
            data: {value: display, property, scale: scale(RADII_TOKENS_BY_PX), pkg: TOKENS_PKG},
          })
          return
        }
        context.report({
          node,
          messageId: 'rawRadius',
          data: {value: display, property, token, pkg: TOKENS_PKG},
          suggest: suggest
            ? suggestReplacement(node, `radii.${token}`, 'radii', 'tokens/spacing.css')
            : [],
        })
      } else if (FONT_SIZE_PROPERTIES.has(property)) {
        checkFontSize(node, px / 16, display, suggest)
      }
    }

    function checkFontSize(node: TSESTree.Node, rem: number, display: string, suggest: boolean) {
      const hit = FONT_SIZE_TOKENS_BY_REM[rem]
      if (!hit) return
      context.report({
        node,
        messageId: 'rawFontSize',
        data: {value: display, group: hit.group, token: hit.token, pkg: TOKENS_PKG},
        suggest: suggest
          ? suggestReplacement(
              node,
              `${hit.group}.${hit.token}`,
              hit.group,
              'tokens/typography.css',
            )
          : [],
      })
    }

    function checkFontWeight(
      node: TSESTree.Node,
      weight: number,
      display: string,
      suggest: boolean,
    ) {
      const token = FONT_WEIGHT_TOKENS[weight]
      if (!token) return
      context.report({
        node,
        messageId: 'rawFontWeight',
        data: {value: display, token, pkg: TOKENS_PKG},
        suggest: suggest
          ? suggestReplacement(node, `typography.${token}`, 'typography', 'tokens/typography.css')
          : [],
      })
    }

    function checkStringValue(
      node: TSESTree.Node,
      property: string,
      value: string,
      suggest: boolean,
    ) {
      const px = /^(\d+(?:\.\d+)?)px$/.exec(value)
      const rem = /^(\d+(?:\.\d+)?)rem$/.exec(value)
      const ms = /^(\d+(?:\.\d+)?)ms$/.exec(value)
      const display = `'${value}'`

      if (px) {
        checkPxValue(node, property, Number(px[1]), display, suggest)
        return
      }
      if (rem && FONT_SIZE_PROPERTIES.has(property)) {
        checkFontSize(node, Number(rem[1]), display, suggest)
        return
      }
      if (FONT_WEIGHT_PROPERTIES.has(property) && /^\d{3}$/.test(value)) {
        checkFontWeight(node, Number(value), display, suggest)
        return
      }
      if (SHADOW_PROPERTIES.has(property)) {
        if (value === 'none') return
        const token = SHADOW_TOKENS[normalizeValue(value)]
        context.report({
          node,
          messageId: 'rawShadow',
          data: {value, token: token ?? '*', pkg: TOKENS_PKG},
          suggest:
            token && suggest
              ? suggestReplacement(node, `shadows.${token}`, 'shadows', 'tokens/shadows.css')
              : [],
        })
        // A palette shadow's own rgba() is the token, not a second finding.
        if (!token) checkColorValue(node, value, suggest)
        return
      }
      if (DURATION_PROPERTIES.has(property) && ms) {
        const token = DURATION_TOKENS_BY_MS[Number(ms[1])]
        context.report({
          node,
          messageId: 'rawDuration',
          data: {value, property, token: token ?? '*', pkg: TOKENS_PKG},
          suggest:
            token && suggest
              ? suggestReplacement(node, `duration.${token}`, 'duration', 'tokens/motion.css')
              : [],
        })
        return
      }
      if (EASING_PROPERTIES.has(property)) {
        const token = EASING_TOKENS[normalizeValue(value)]
        context.report({
          node,
          messageId: 'rawEasing',
          data: {value, property, token: token ?? '*', pkg: TOKENS_PKG},
          suggest:
            token && suggest
              ? suggestReplacement(node, `easing.${token}`, 'easing', 'tokens/motion.css')
              : [],
        })
      }
    }

    function checkValue(node: TSESTree.Node, property: string | null, suggest: boolean) {
      // Grid tracks: a px anywhere in the track list is a raw size, the same
      // as on width (`'minmax(240px, 1fr)'`). Fractions, % and tokens pass.
      if (property && TRACK_PROPERTIES.has(property)) {
        const text =
          node.type === 'Literal' && typeof node.value === 'string'
            ? node.value
            : node.type === 'TemplateLiteral'
              ? node.quasis.map((q) => q.value.cooked ?? q.value.raw).join(' ')
              : null
        if (text !== null && /(?<![\w.-])(?!0+(?:\.0+)?px)\d+(?:\.\d+)?px\b/.test(text)) {
          context.report({
            node,
            messageId: 'rawTrack',
            data: {value: sourceCode.getText(node), property, pkg: TOKENS_PKG},
          })
        }
        if (node.type !== 'ObjectExpression') return
      }
      if (property && SHADOW_PROPERTIES.has(property) && node.type === 'TemplateLiteral') {
        const text = node.quasis.map((q) => q.value.cooked ?? q.value.raw).join(' ')
        if (/(?<![\w.-])(?!0+(?:\.0+)?px)\d+(?:\.\d+)?px\b/.test(text)) {
          context.report({
            node,
            messageId: 'rawShadowLength',
            data: {value: sourceCode.getText(node), pkg: TOKENS_PKG},
          })
        }
        return
      }
      const measure = property ? measureFor(property) : null
      if (property && measure) {
        if (node.type === 'Literal' && typeof node.value === 'number') {
          checkMeasure(
            node,
            property,
            measure,
            node.value,
            false,
            String(node.value),
            true,
            suggest,
          )
          return
        }
        if (
          node.type === 'UnaryExpression' &&
          node.operator === '-' &&
          node.argument.type === 'Literal' &&
          typeof node.argument.value === 'number' &&
          !BORDER_SHORTHAND_PROPERTIES.has(property)
        ) {
          const px = node.argument.value
          checkMeasure(node, property, measure, px, true, `-${px}`, true, suggest)
          return
        }
        if (node.type === 'TemplateLiteral') {
          const text = node.quasis.map((q) => q.value.cooked ?? q.value.raw).join('')
          checkStaticPx(node, property, text, sourceCode.getText(node))
          return
        }
        if (node.type === 'Literal' && typeof node.value === 'string') {
          checkColorValue(node, node.value, suggest)
          checkMeasureString(node, property, measure, node.value, suggest)
          return
        }
      }
      if (node.type === 'Literal') {
        if (typeof node.value === 'string') {
          if (property && SHADOW_PROPERTIES.has(property)) {
            checkStringValue(node, property, node.value, suggest)
          } else {
            checkColorValue(node, node.value, suggest)
            if (property) checkStringValue(node, property, node.value, suggest)
          }
        } else if (typeof node.value === 'number' && property && node.value > 0) {
          if (FONT_WEIGHT_PROPERTIES.has(property)) {
            checkFontWeight(node, node.value, String(node.value), suggest)
          } else {
            checkPxValue(node, property, node.value, String(node.value), suggest)
          }
        }
        return
      }
      if (node.type === 'ObjectExpression') {
        walkStyleObject(node, property, suggest)
      }
      // Everything else (identifiers, member expressions, template literals,
      // calls, negatives via UnaryExpression) is deliberately skipped.
    }

    /** A `@media (min-width: 768px)` key: report, and offer the const key. */
    function checkConditionKey(prop: TSESTree.Property, key: string, suggest: boolean) {
      const match = BREAKPOINT_KEY_RE.exec(key)
      if (!match) return
      const px = Number(match[1])
      const token = BREAKPOINT_TOKENS_BY_PX[px]
      const data = {
        value: String(px),
        key,
        token: token ?? '*',
        scale: scale(BREAKPOINT_TOKENS_BY_PX),
        pkg: TOKENS_PKG,
      }
      if (!token) {
        context.report({node: prop.key, messageId: 'rawBreakpoint', data})
        return
      }
      // css.create needs a computed key for a const; brackets included so a
      // plain string key becomes `[`@media (... ${breakpoints.md})`]`.
      const template = key.replace(`${px}px`, `\${%LOCAL%.${token}}`)
      context.report({
        node: prop.key,
        messageId: 'rawBreakpoint',
        data,
        suggest: !suggest
          ? []
          : suggestReplacement(
              prop.key,
              `breakpoints.${token}`,
              'breakpoints',
              'tokens/breakpoints.css',
              (local) => {
                const inner = '`' + template.replace('%LOCAL%', local) + '`'
                return prop.computed ? inner : `[${inner}]`
              },
            ),
      })
    }

    function walkStyleObject(
      obj: TSESTree.ObjectExpression,
      property: string | null,
      suggest: boolean,
    ) {
      for (const prop of obj.properties) {
        if (prop.type !== 'Property') continue
        const key =
          prop.key.type === 'Identifier'
            ? prop.key.name
            : prop.key.type === 'Literal'
              ? String(prop.key.value)
              : null
        if (key === null) {
          // Computed key — can't attribute a property; still scan for colors.
          checkValue(prop.value as TSESTree.Node, null, suggest)
          continue
        }
        // Condition keys (default, :hover, @media …) keep the enclosing
        // property; anything else IS the property.
        const isCondition = key === 'default' || /^[:@]/.test(key)
        if (isCondition) checkConditionKey(prop, key, suggest)
        checkValue(prop.value as TSESTree.Node, isCondition ? property : key, suggest)
      }
    }

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (!factories.includes(calleeText(node))) return
        const arg = node.arguments[0]
        if (!arg || arg.type !== 'ObjectExpression') return
        // Top level is the style-name level: css.create({styleName: {...}}).
        for (const prop of arg.properties) {
          if (prop.type !== 'Property') continue
          const value = prop.value
          if (value.type === 'ObjectExpression') walkStyleObject(value, null, true)
          // Dynamic styles: css.create({x: (arg) => ({...})})
          if (
            (value.type === 'ArrowFunctionExpression' || value.type === 'FunctionExpression') &&
            value.body.type === 'ObjectExpression'
          ) {
            walkStyleObject(value.body, null, true)
          }
        }
      },
    }
  },
}
