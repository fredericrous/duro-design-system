import type {TSESLint} from '@typescript-eslint/utils'

type MessageIds = 'flexGrowForced'
type Options = [
  {
    factories?: string[]
  }?,
]

/**
 * Retired in 5.2: reports nothing.
 *
 * The rule assumed react-strict-dom's web runtime forces computed
 * `flex-grow: 0`, so a growing child collapses. It does not: the
 * `Foundations/flexGrow on web` stories (packages/ui/src/docs/FlexGrow.stories.tsx)
 * render a growing child in a row and in a column and assert computed
 * `flex-grow: 1` and the filled size, and ticket-vision measured the same in
 * its app. The rule stays registered, deprecated, so a config that names it
 * (`'duro/no-flex-grow-web': 'off'`) keeps loading; it is out of the
 * recommended preset.
 */
export const noFlexGrowWeb: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'problem',
    deprecated: true,
    docs: {
      description:
        'Retired: react-strict-dom honours flexGrow on web, so this rule reports nothing',
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
      flexGrowForced: 'Retired: react-strict-dom honours flexGrow on web.',
    },
  },
  create() {
    return {}
  },
}
