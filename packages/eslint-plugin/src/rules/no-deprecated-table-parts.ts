import type {TSESLint, TSESTree} from '@typescript-eslint/utils'

type MessageIds = 'deprecatedContainer' | 'deprecatedIsActions' | 'removeIsActions'
type Options = [
  {
    tableIdentifiers?: string[]
  }?,
]

/**
 * Flag the deprecated Table API surface: <Table.Container> (Root owns the
 * container query now) and the no-op `isActions` prop on <Table.HeaderCell>
 * (it belongs on Table.Cell). Container is report-only — unwrapping children
 * mechanically is layout-unsafe. isActions removal autofixes for literal
 * values and falls back to a suggestion when the value is an expression.
 */
export const noDeprecatedTableParts: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow deprecated Table parts (Table.Container, HeaderCell isActions)',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          tableIdentifiers: {type: 'array', items: {type: 'string'}, uniqueItems: true},
        },
        additionalProperties: false,
      },
    ],
    messages: {
      deprecatedContainer:
        '{{table}}.Container is deprecated — {{table}}.Root sets up its own container query. Remove the wrapper.',
      deprecatedIsActions:
        '`isActions` has no effect on {{table}}.HeaderCell. Pass it on the matching {{table}}.Cell instead.',
      removeIsActions: 'Remove the `isActions` attribute',
    },
  },
  create(context) {
    const tableIdentifiers = new Set(context.options[0]?.tableIdentifiers ?? ['Table', 'TableCore'])
    const sourceCode = context.sourceCode

    function removeAttribute(fixer: TSESLint.RuleFixer, attr: TSESTree.JSXAttribute) {
      const before = sourceCode.getTokenBefore(attr)
      const start = before ? before.range[1] : attr.range[0]
      return fixer.removeRange([start, attr.range[1]])
    }

    return {
      JSXOpeningElement(node: TSESTree.JSXOpeningElement) {
        if (node.name.type !== 'JSXMemberExpression') return
        const {object, property} = node.name
        if (object.type !== 'JSXIdentifier' || !tableIdentifiers.has(object.name)) return

        if (property.name === 'Container') {
          context.report({
            node: node.name,
            messageId: 'deprecatedContainer',
            data: {table: object.name},
          })
          return
        }

        if (property.name !== 'HeaderCell') return
        const attr = node.attributes.find(
          (a): a is TSESTree.JSXAttribute =>
            a.type === 'JSXAttribute' &&
            a.name.type === 'JSXIdentifier' &&
            a.name.name === 'isActions',
        )
        if (!attr) return

        const value = attr.value
        const isLiteral =
          value === null ||
          (value?.type === 'JSXExpressionContainer' &&
            value.expression.type === 'Literal' &&
            typeof value.expression.value === 'boolean')

        if (isLiteral) {
          context.report({
            node: attr,
            messageId: 'deprecatedIsActions',
            data: {table: object.name},
            fix: (fixer) => removeAttribute(fixer, attr),
          })
        } else {
          context.report({
            node: attr,
            messageId: 'deprecatedIsActions',
            data: {table: object.name},
            suggest: [
              {
                messageId: 'removeIsActions',
                fix: (fixer) => removeAttribute(fixer, attr),
              },
            ],
          })
        }
      },
    }
  },
}
