import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'A styled native color swatch (<input type="color">) for picking a hex color. Field-context aware like Input.',
  whenToUse: [
    'Picking an accent/brand/category color in a form (e.g. a zone or tag color)',
    'Inside a Field.Root, where it adopts the label, invalid state, and disabled',
  ],
  whenNotToUse: [
    'Free-text hex entry with validation — use Input with a pattern instead',
    'A full palette/gradient picker — out of scope; this is the native swatch',
  ],
  relatedTo: [
    {
      component: 'Input',
      kind: 'contrast',
      relationship: 'ColorInput is the native color swatch; Input is text entry',
    },
    {
      component: 'Field',
      kind: 'composition',
      relationship: 'Wrap in Field.Root for label + error wiring',
    },
  ],
  example: `<Field.Root>
  <Field.Label>Accent</Field.Label>
  <ColorInput value={accent} onChange={(e) => setAccent(e.target.value)} />
</Field.Root>`,
}
