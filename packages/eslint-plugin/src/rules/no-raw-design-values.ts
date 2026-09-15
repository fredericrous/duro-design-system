import type {TSESLint, TSESTree} from '@typescript-eslint/utils'
import {
  BREAKPOINT_TOKENS_BY_PX,
  COLOR_TOKENS,
  COLOR_TOKENS_NORMALIZED,
  DURATION_TOKENS_BY_MS,
  EASING_TOKENS,
  FONT_SIZE_TOKENS_BY_REM,
  FONT_WEIGHT_TOKENS,
  RADII_PROPERTIES,
  RADII_TOKENS_BY_PX,
  SHADOW_TOKENS,
  SPACING_PROPERTIES,
  SPACING_TOKENS_BY_PX,
  normalizeHex,
  normalizeValue,
} from '../util/tokens.js'
import {ensureNamedImport} from '../util/imports.js'

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
  | 'replaceWithToken'
type Options = [
  {
    factories?: string[]
    spacingProperties?: string[]
    radiiProperties?: string[]
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
 * Skipped on purpose: 0, negatives (UnaryExpression), shorthands ('8px 16px',
 * 'opacity 150ms'), identifiers, member expressions, template literals and
 * calls — the rule reads literals, not expressions.
 */
export const noRawDesignValues: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer design tokens over raw colors, lengths, breakpoints, type, shadows and motion in css.create styles',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          factories: {type: 'array', items: {type: 'string'}, uniqueItems: true},
          spacingProperties: {type: 'array', items: {type: 'string'}, uniqueItems: true},
          radiiProperties: {type: 'array', items: {type: 'string'}, uniqueItems: true},
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
