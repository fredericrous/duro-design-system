import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Wraps an Input with prefix and/or suffix addons (icons, text, buttons). Addons are visually attached to the input edges.',
  whenToUse: [
    'Inputs with units (e.g. "$" prefix, "kg" suffix)',
    'Search inputs with an icon prefix',
    'URL inputs with protocol prefix',
  ],
  whenNotToUse: [
    'Standalone inputs without addons — use Input directly',
    'Form field labels — use Field.Label',
  ],
  anatomy: {
    required: ['Root'],
    optional: ['Addon'],
  },
  relatedTo: [
    {component: 'Input', relationship: 'InputGroup enhances Input with addons'},
    {component: 'Field', relationship: 'Field provides label/error; InputGroup provides visual addons'},
  ],
  example: `<InputGroup.Root>
  <InputGroup.Addon>$</InputGroup.Addon>
  <Input type="number" placeholder="0.00" />
  <InputGroup.Addon>USD</InputGroup.Addon>
</InputGroup.Root>`,
}
