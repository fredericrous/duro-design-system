import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Searchable dropdown for selecting a value from a filterable list. Combines a text input with a popup listbox. Compound component — Root is required.',
  whenToUse: [
    'Large option lists where users benefit from typing to filter (e.g. country, city, user picker)',
    'Autocomplete or typeahead scenarios',
    'Table column filters with known categorical values',
  ],
  whenNotToUse: [
    'Small lists (fewer than 7 options) — use Select instead',
    'Free-form text entry — use Input',
    'Multiple selections — use CheckboxGroup or ToggleGroup',
  ],
  anatomy: {
    required: ['Root', 'Input', 'Popup', 'Item'],
    optional: ['Empty'],
  },
  relatedTo: [
    {
      component: 'Select',
      relationship: 'Select for short lists without search; Combobox for long filterable lists',
    },
    {
      component: 'Input',
      relationship: 'Input for free-form text; Combobox for constrained selection',
    },
    {component: 'Menu', relationship: 'Menu triggers actions; Combobox picks a value'},
  ],
  example: `<Combobox.Root name="country" defaultValue="us" initialLabels={{us: 'United States'}}>
  <Combobox.Input placeholder="Search countries…" />
  <Combobox.Popup>
    <Combobox.Item value="us">United States</Combobox.Item>
    <Combobox.Item value="gb">United Kingdom</Combobox.Item>
    <Combobox.Item value="fr">France</Combobox.Item>
    <Combobox.Item value="de">Germany</Combobox.Item>
    <Combobox.Empty>No countries found</Combobox.Empty>
  </Combobox.Popup>
</Combobox.Root>`,
}
