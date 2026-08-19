import type {TSESLint, TSESTree} from '@typescript-eslint/utils'

type MessageIds = 'useFormKit'
type Options = [
  {
    allow?: string[]
    htmlObjects?: string[]
  }?,
]

/**
 * Form fields go through the design system's form kit, not bare html.*
 * primitives: `html.input` → Field.Root + Field.Label + Input, `html.select`
 * → the Select compound, `html.textarea` → Textarea. The kit carries theming
 * (the app-owned duro theme drives the tokens) and a11y wiring that a bare
 * primitive silently drops.
 *
 * no-raw-html-element can't express this: html.input IS the correct
 * react-strict-dom spelling — the problem is the altitude, not the element.
 * The design system's own component sources allow these primitives by
 * disabling the rule for that tree; consumers get it from the react preset.
 */
const FORM_KIT: Record<string, string> = {
  input: 'Field.Root + Field.Label + Input (or Checkbox for checkables)',
  select: 'the Select compound (Select.Root/Trigger/Value/Item)',
  textarea: 'Textarea',
}

export const preferDsFormComponents: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require @duro-app/ui form components (Field/Input/Select/Textarea) instead of bare html.input/select/textarea',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {type: 'array', items: {type: 'string'}, uniqueItems: true},
          htmlObjects: {type: 'array', items: {type: 'string'}, uniqueItems: true},
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useFormKit:
        'Use {{replacement}} from @duro-app/ui instead of html.{{tag}} — the form kit carries the theme and a11y wiring. If the field you need is missing, add it to duro-design-system (`npx duro list`).',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    const allow = new Set(options.allow ?? [])
    const htmlObjects = new Set(options.htmlObjects ?? ['html'])

    return {
      JSXOpeningElement(node: TSESTree.JSXOpeningElement) {
        const name = node.name
        if (name.type !== 'JSXMemberExpression') return
        if (name.object.type !== 'JSXIdentifier' || !htmlObjects.has(name.object.name)) return
        const tag = name.property.name
        if (allow.has(tag)) return
        const replacement = FORM_KIT[tag]
        if (!replacement) return
        context.report({node: name, messageId: 'useFormKit', data: {tag, replacement}})
      },
    }
  },
}
