import type {TSESLint, TSESTree} from '@typescript-eslint/utils'

type MessageIds = 'flexGrowForced'
type Options = [
  {
    factories?: string[]
  }?,
]

/**
 * Inside css.create() style objects, flag non-zero `flexGrow`: on the web
 * target react-strict-dom's runtime base style forces computed
 * `flex-grow: 0`, so the declaration silently does nothing and grow-to-fill
 * layouts collapse (verified empirically — a flexGrow:1/flexBasis:0 column
 * grid shrank to its content width).
 *
 * There is no mechanical fix: the working alternatives are a plain React DOM
 * layout scaffold or absolute positioning against a measured container, both
 * structural rewrites. The rule informs; it does not gate — it ships as
 * `warn` in the recommended preset.
 */
export const noFlexGrowWeb: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow non-zero flexGrow in css.create styles (react-strict-dom forces flex-grow: 0 on web)',
    },
    schema: [
      {
        type: 'object',
        properties: {
          factories: {type: 'array', items: {type: 'string'}, uniqueItems: true},
        },
        additionalProperties: false,
      },
    ],
    messages: {
      flexGrowForced:
        'flexGrow has no effect under react-strict-dom on web — the runtime forces computed flex-grow: 0, so this layout silently collapses. Lay out with a plain DOM scaffold, or absolute-position against a measured container.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    const factories = options.factories ?? ['css.create']
    const sourceCode = context.sourceCode

    function isZero(value: TSESTree.Property['value']): boolean {
      if (value.type === 'Literal') return value.value === 0 || value.value === '0'
      if (value.type === 'UnaryExpression' && value.operator === '-') {
        return value.argument.type === 'Literal' && value.argument.value === 0
      }
      return false
    }

    function walk(node: TSESTree.ObjectExpression): void {
      for (const prop of node.properties) {
        if (prop.type !== 'Property') continue
        const value = prop.value
        const name =
          prop.key.type === 'Identifier' && !prop.computed
            ? prop.key.name
            : prop.key.type === 'Literal'
              ? String(prop.key.value)
              : null
        if (name === 'flexGrow' && value.type !== 'ObjectExpression') {
          // Dynamic values (variables, conditionals) are just as forced-to-0
          // as literals — only a literal 0 is knowably redundant-but-harmless.
          if (!isZero(value)) {
            context.report({node: prop, messageId: 'flexGrowForced'})
          }
          continue
        }
        // Nested objects: named styles at the top level, and media-query /
        // pseudo maps below them ({'@media …': {flexGrow: 1}}).
        if (value.type === 'ObjectExpression') walk(value)
      }
    }

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (!factories.includes(sourceCode.getText(node.callee))) return
        const [arg] = node.arguments
        if (arg && arg.type === 'ObjectExpression') walk(arg)
      },
    }
  },
}
