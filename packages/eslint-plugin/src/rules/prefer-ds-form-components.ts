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
 *
 * Two shapes are exempt because they take no user input, so there is no
 * theme or a11y for the form kit to carry:
 * - `html.input type="hidden"` — the router-form intent idiom
 *   (`<fetcher.Form>` carrying intent/id fields).
 * - a `readOnly` input/textarea — a display affordance (e.g. a select-all
 *   copy fallback), not a field.
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

    function attribute(node: TSESTree.JSXOpeningElement, attrName: string) {
      return node.attributes.find(
        (attr): attr is TSESTree.JSXAttribute =>
          attr.type === 'JSXAttribute' &&
          attr.name.type === 'JSXIdentifier' &&
          attr.name.name === attrName,
      )
    }

    return {
      JSXOpeningElement(node: TSESTree.JSXOpeningElement) {
        const name = node.name
        if (name.type !== 'JSXMemberExpression') return
        if (name.object.type !== 'JSXIdentifier' || !htmlObjects.has(name.object.name)) return
        const tag = name.property.name
        if (allow.has(tag)) return
        const replacement = FORM_KIT[tag]
        if (!replacement) return
        // Hidden inputs carry router-form intent, not user input.
        const type = attribute(node, 'type')
        if (
          type?.value?.type === 'Literal' &&
          typeof type.value.value === 'string' &&
          type.value.value.toLowerCase() === 'hidden'
        ) {
          return
        }
        // A readOnly field is a display affordance, not a field. Bare
        // `readOnly` and any non-false value count; only an explicit
        // literal false keeps the report.
        const readOnly = attribute(node, 'readOnly')
        if (readOnly) {
          const v = readOnly.value
          const literalFalse =
            v?.type === 'JSXExpressionContainer' &&
            v.expression.type === 'Literal' &&
            v.expression.value === false
          if (!literalFalse) return
        }
        context.report({node: name, messageId: 'useFormKit', data: {tag, replacement}})
      },
    }
  },
}
