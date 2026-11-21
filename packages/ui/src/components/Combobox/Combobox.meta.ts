import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    "Searchable dropdown for selecting a value from a filterable list. Combines a text input with a popup listbox. Compound component — Root is required. Combobox.Popup takes label (the list's accessible name). On React Native the field opens a bottom sheet at its large detent, above the keyboard, titled by label with a Cancel text button (cancelLabel): a search field is pinned under the header and focused, the list below filters as you type, Combobox.Empty shows when nothing matches, and a press picks an option and closes the sheet. The sheet's search text starts empty each time; Combobox.Trigger renders nothing on native. An Item takes description (a muted second line) and leading (an icon or small preview, decorative), laid out as Select.Item's are: the option's accessible name, its filtering and the text committed to the field stay its label, and the description is its accessible description. Root takes onOpenChange, called once each time the list (web) or sheet (native) opens or closes; there is no controlled open, as on Select, and it is not called when the Root unmounts while open. On the web the list opens with every option while the field shows its chosen option's label, and filters only once the text is edited; opening by focus selects the text. Combobox.Input is named by aria-label, or inside Field.Root by Field.Label. On native the field's accessibility label is aria-label, else the shown value, else the placeholder, and the shown value is its accessibility value when aria-label is given; native does not read Field.Label, so a native field inside Field.Root needs aria-label. Options may arrive after the list opens (loaded on demand from onOpenChange): on the web Combobox.Empty shows while the list holds no option, and a label that arrives later replaces the text the field showed for the value (a stand-in from initialLabels) unless it was edited.",
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
      component: 'Popover',
      kind: 'composition',
      relationship:
        'Inside Popover.Popup a Combobox keeps the popover open while you choose; Escape closes only the list',
    },
    {
      component: 'Select',
      kind: 'contrast',
      relationship: 'Select for short lists without search; Combobox for long filterable lists',
    },
    {
      component: 'Input',
      kind: 'contrast',
      relationship: 'Input for free-form text; Combobox for constrained selection',
    },
    {
      component: 'Menu',
      kind: 'contrast',
      relationship: 'Menu triggers actions; Combobox picks a value',
    },
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
