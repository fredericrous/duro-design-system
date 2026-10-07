import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Text input with automatic Field/Form integration. Variant auto-switches to error when inside an invalid Field. variant="ghost" reads as text until hovered (hairline border) or focused (accent border and ring): only for inline edit where a visible Field.Label names it; it shows the error state when the Field is invalid.',
  whenToUse: [
    'Single-line text entry (text, email, password, url, tel, number, search)',
    'Inline edit of a labelled value in place (a ticket title) — variant="ghost"',
  ],
  whenNotToUse: [
    'Multi-line text — use Textarea',
    'Picking from predefined options — use Select',
    'A ghost field without a visible label — it reads as plain text, so the label is what says it is editable',
  ],
  relatedTo: [
    {component: 'Field', kind: 'composition', relationship: 'Wrap in Field.Root for label + error'},
    {
      component: 'InputGroup',
      kind: 'composition',
      relationship: 'Wrap in InputGroup.Root for prefix/suffix addons',
    },
    {
      component: 'Textarea',
      kind: 'contrast',
      relationship: 'Input for single-line entry; Textarea for multi-line',
    },
  ],
  example: `<Field.Root name="email">
  <Field.Label>Email</Field.Label>
  <Input type="email" placeholder="you@example.com" autoComplete="email" />
  <Field.Error />
</Field.Root>`,
}
