import type {TSESLint, TSESTree} from '@typescript-eslint/utils'
import {
  COLOR_TOKENS,
  RADII_PROPERTIES,
  RADII_TOKENS_BY_PX,
  SPACING_PROPERTIES,
  SPACING_TOKENS_BY_PX,
  normalizeHex,
} from '../util/tokens.js'
import {ensureNamedImport} from '../util/imports.js'

type MessageIds = 'rawColorToken' | 'rawColor' | 'rawSpacing' | 'rawRadius' | 'replaceWithToken'
type Options = [
  {
    factories?: string[]
    spacingProperties?: string[]
    radiiProperties?: string[]
  }?,
]

const HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/
const TOKENS_PKG = '@duro-app/tokens'

/**
 * Inside css.create() style objects, flag raw design values that have a token
 * equivalent: hex colors (anywhere — a hex is never right in this system) and
 * spacing/radius px values on the properties where that mapping is unambiguous.
 * Values with no token equivalent (0, negatives, rem, shorthands, off-scale
 * numbers) are skipped, except off-palette hex colors, which report without a
 * fix — surfacing them is the point.
 */
export const noRawDesignValues: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer design tokens over raw hex colors and px values in css.create styles',
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

    function suggestReplacement(
      node: TSESTree.Node,
      replacement: string,
      importName: string,
      importPath: string,
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
            const target = replacement.replace(`${importName}.`, `${local}.`)
            return [...fixes, fixer.replaceText(node, target)]
          },
        },
      ]
    }

    function checkColorValue(node: TSESTree.Node, raw: string) {
      const match = HEX_RE.exec(raw)
      if (!match) return
      const hex = normalizeHex(match[0])
      const token = COLOR_TOKENS[hex] ?? COLOR_TOKENS[raw.toLowerCase()]
      if (token) {
        // Only suggest a direct replacement when the literal IS the color —
        // inside a compound value (a boxShadow) the rewrite would be wrong.
        const isWholeValue = raw.trim() === match[0]
        context.report({
          node,
          messageId: 'rawColorToken',
          data: {value: match[0], token, pkg: TOKENS_PKG},
          suggest: isWholeValue
            ? suggestReplacement(node, `colors.${token}`, 'colors', 'tokens/colors.css')
            : [],
        })
      } else {
        context.report({node, messageId: 'rawColor', data: {value: match[0], pkg: TOKENS_PKG}})
      }
    }

    function checkLengthValue(node: TSESTree.Node, property: string, px: number, display: string) {
      if (spacingProperties.has(property)) {
        const token = SPACING_TOKENS_BY_PX[px]
        if (!token) return
        context.report({
          node,
          messageId: 'rawSpacing',
          data: {value: display, property, token, pkg: TOKENS_PKG},
          suggest: suggestReplacement(node, `spacing.${token}`, 'spacing', 'tokens/spacing.css'),
        })
      } else if (radiiProperties.has(property)) {
        const token = RADII_TOKENS_BY_PX[px]
        if (!token) return
        context.report({
          node,
          messageId: 'rawRadius',
          data: {value: display, property, token, pkg: TOKENS_PKG},
          suggest: suggestReplacement(node, `radii.${token}`, 'radii', 'tokens/spacing.css'),
        })
      }
    }

    function checkValue(node: TSESTree.Node, property: string | null) {
      if (node.type === 'Literal') {
        if (typeof node.value === 'string') {
          checkColorValue(node, node.value)
          if (property) {
            const pxMatch = /^(\d+)px$/.exec(node.value)
            if (pxMatch) checkLengthValue(node, property, Number(pxMatch[1]), `'${node.value}'`)
          }
        } else if (typeof node.value === 'number' && property && node.value > 0) {
          checkLengthValue(node, property, node.value, String(node.value))
        }
        return
      }
      if (node.type === 'ObjectExpression') {
        walkStyleObject(node, property)
      }
      // Everything else (identifiers, member expressions, template literals,
      // calls, negatives via UnaryExpression) is deliberately skipped.
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
