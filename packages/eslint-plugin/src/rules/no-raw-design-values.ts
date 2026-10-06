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

type MeasureGroup = 'sizes' | 'borders'
interface Measure {
  group: MeasureGroup
  candidates: (px: number) => string[]
}

const borderCandidates = (allowed: string[]) => (px: number) =>
  (BORDER_TOKENS_BY_PX[px] ?? []).filter((token) => allowed.includes(token))

/** Which token set a measure property draws from; null for any other property. */
function measureFor(property: string): Measure | null {
  if (SIZE_PROPERTIES.has(property)) {
    return {group: 'sizes', candidates: (px) => SIZE_TOKENS_BY_PX[px] ?? []}
  }
  if (property === 'outlineOffset') {
    return {group: 'borders', candidates: borderCandidates(OUTLINE_OFFSET_TOKENS)}
  }
  if (property === 'outlineWidth' || property === 'outline') {
    return {group: 'borders', candidates: borderCandidates(OUTLINE_WIDTH_TOKENS)}
  }
  if (BORDER_WIDTH_PROPERTIES.has(property) || BORDER_SHORTHAND_PROPERTIES.has(property)) {
    return {group: 'borders', candidates: borderCandidates(BORDER_WIDTH_TOKENS)}
  }
  return null
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
 *   borders hairline/strong/accent, focusRing, focusOffset/focusOffsetSm); one
 *   match suggests it, several list them without a fix, none says to add a
 *   token. Percent, viewport, em/rem/ch, keywords and calc() without a px are
 *   fine.
 *
 * Option `exemptFiles` (globs) silences the rule for whole files.
 *
 * Skipped on purpose: 0, negatives on the spacing properties, shorthands
 * ('8px 16px', 'opacity 150ms'), identifiers, member expressions, template
 * literals and calls — the rule reads literals, not expressions (the size and
 * border-width properties also read static px text in template literals).
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
    ) {
      if (px === 0) return
      const candidates = measure.candidates(px)
      const data = {
        value: display,
        property,
        group: measure.group,
        tokens: candidates.map((token) => `${measure.group}.${token}`).join(', '),
        pkg: TOKENS_PKG,
      }
      if (candidates.length === 0) {
        context.report({node, messageId: 'missingMeasureToken', data})
      } else if (candidates.length > 1) {
        context.report({node, messageId: 'ambiguousMeasure', data})
      } else {
        const token = candidates[0]!
        context.report({
          node,
          messageId: 'rawMeasure',
          data,
          suggest: fixable
            ? suggestReplacement(
                node,
                `${measure.group}.${token}`,
                measure.group,
                `tokens/${measure.group}.css`,
                negative ? (local) => `\`calc(-1 * \${${local}.${token}})\`` : undefined,
              )
            : [],
        })
      }
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
    ) {
      const text = value.trim()
      const display = `'${value}'`
      const px = PX_RE.exec(text)
      if (px) {
        checkMeasure(node, property, measure, Number(px[2]), px[1] === '-', display, true)
        return
      }
      if (BORDER_SHORTHAND_PROPERTIES.has(property)) {
        // The width is a bare px word outside any function call.
        const words = text.replace(/\([^)]*\)/g, ' ').split(/\s+/)
        const width = words.map((word) => PX_RE.exec(word)).find(Boolean)
        if (width) {
          checkMeasure(node, property, measure, Number(width[2]), false, display, false)
        }
        return
      }
      if (/\bcalc\(/.test(text)) checkStaticPx(node, property, text, display)
    }

    function checkColorValue(node: TSESTree.Node, raw: string) {
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
          suggest: isWholeValue
            ? suggestReplacement(node, `colors.${token}`, 'colors', 'tokens/colors.css')
            : [],
        })
      } else {
        context.report({node, messageId: 'rawColor', data: {value: literal, pkg: TOKENS_PKG}})
      }
    }

    function checkPxValue(node: TSESTree.Node, property: string, px: number, display: string) {
      if (spacingProperties.has(property)) {
        const token = SPACING_TOKENS_BY_PX[px]
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
          suggest: suggestReplacement(node, `spacing.${token}`, 'spacing', 'tokens/spacing.css'),
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
          suggest: suggestReplacement(node, `radii.${token}`, 'radii', 'tokens/spacing.css'),
        })
      } else if (FONT_SIZE_PROPERTIES.has(property)) {
        checkFontSize(node, px / 16, display)
      }
    }

    function checkFontSize(node: TSESTree.Node, rem: number, display: string) {
      const hit = FONT_SIZE_TOKENS_BY_REM[rem]
      if (!hit) return
      context.report({
        node,
        messageId: 'rawFontSize',
        data: {value: display, group: hit.group, token: hit.token, pkg: TOKENS_PKG},
        suggest: suggestReplacement(
          node,
          `${hit.group}.${hit.token}`,
          hit.group,
          'tokens/typography.css',
        ),
      })
    }

    function checkFontWeight(node: TSESTree.Node, weight: number, display: string) {
      const token = FONT_WEIGHT_TOKENS[weight]
      if (!token) return
      context.report({
        node,
        messageId: 'rawFontWeight',
        data: {value: display, token, pkg: TOKENS_PKG},
        suggest: suggestReplacement(
          node,
          `typography.${token}`,
          'typography',
          'tokens/typography.css',
        ),
      })
    }

    function checkStringValue(node: TSESTree.Node, property: string, value: string) {
      const px = /^(\d+(?:\.\d+)?)px$/.exec(value)
      const rem = /^(\d+(?:\.\d+)?)rem$/.exec(value)
      const ms = /^(\d+(?:\.\d+)?)ms$/.exec(value)
      const display = `'${value}'`

      if (px) {
        checkPxValue(node, property, Number(px[1]), display)
        return
      }
      if (rem && FONT_SIZE_PROPERTIES.has(property)) {
        checkFontSize(node, Number(rem[1]), display)
        return
      }
      if (FONT_WEIGHT_PROPERTIES.has(property) && /^\d{3}$/.test(value)) {
        checkFontWeight(node, Number(value), display)
        return
      }
      if (SHADOW_PROPERTIES.has(property)) {
        if (value === 'none') return
        const token = SHADOW_TOKENS[normalizeValue(value)]
        context.report({
          node,
          messageId: 'rawShadow',
          data: {value, token: token ?? '*', pkg: TOKENS_PKG},
          suggest: token
            ? suggestReplacement(node, `shadows.${token}`, 'shadows', 'tokens/shadows.css')
            : [],
        })
        // A palette shadow's own rgba() is the token, not a second finding.
        if (!token) checkColorValue(node, value)
        return
      }
      if (DURATION_PROPERTIES.has(property) && ms) {
        const token = DURATION_TOKENS_BY_MS[Number(ms[1])]
        context.report({
          node,
          messageId: 'rawDuration',
          data: {value, property, token: token ?? '*', pkg: TOKENS_PKG},
          suggest: token
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
          suggest: token
            ? suggestReplacement(node, `easing.${token}`, 'easing', 'tokens/motion.css')
            : [],
        })
      }
    }

    function checkValue(node: TSESTree.Node, property: string | null) {
      const measure = property ? measureFor(property) : null
      if (property && measure) {
        if (node.type === 'Literal' && typeof node.value === 'number') {
          checkMeasure(node, property, measure, node.value, false, String(node.value), true)
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
          checkMeasure(node, property, measure, px, true, `-${px}`, true)
          return
        }
        if (node.type === 'TemplateLiteral') {
          const text = node.quasis.map((q) => q.value.cooked ?? q.value.raw).join('')
          checkStaticPx(node, property, text, sourceCode.getText(node))
          return
        }
        if (node.type === 'Literal' && typeof node.value === 'string') {
          checkColorValue(node, node.value)
          checkMeasureString(node, property, measure, node.value)
          return
        }
      }
      if (node.type === 'Literal') {
        if (typeof node.value === 'string') {
          if (property && SHADOW_PROPERTIES.has(property)) {
            checkStringValue(node, property, node.value)
          } else {
            checkColorValue(node, node.value)
            if (property) checkStringValue(node, property, node.value)
          }
        } else if (typeof node.value === 'number' && property && node.value > 0) {
          if (FONT_WEIGHT_PROPERTIES.has(property)) {
            checkFontWeight(node, node.value, String(node.value))
          } else {
            checkPxValue(node, property, node.value, String(node.value))
          }
        }
        return
      }
      if (node.type === 'ObjectExpression') {
        walkStyleObject(node, property)
      }
      // Everything else (identifiers, member expressions, template literals,
      // calls, negatives via UnaryExpression) is deliberately skipped.
    }

    /** A `@media (min-width: 768px)` key: report, and offer the const key. */
    function checkConditionKey(prop: TSESTree.Property, key: string) {
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
        suggest: suggestReplacement(
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

    function walkStyleObject(obj: TSESTree.ObjectExpression, property: string | null) {
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
          checkValue(prop.value as TSESTree.Node, null)
          continue
        }
        // Condition keys (default, :hover, @media …) keep the enclosing
        // property; anything else IS the property.
        const isCondition = key === 'default' || /^[:@]/.test(key)
        if (isCondition) checkConditionKey(prop, key)
        checkValue(prop.value as TSESTree.Node, isCondition ? property : key)
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
          if (value.type === 'ObjectExpression') walkStyleObject(value, null)
          // Dynamic styles: css.create({x: (arg) => ({...})})
          if (
            (value.type === 'ArrowFunctionExpression' || value.type === 'FunctionExpression') &&
            value.body.type === 'ObjectExpression'
          ) {
            walkStyleObject(value.body, null)
          }
        }
      },
    }
  },
}
