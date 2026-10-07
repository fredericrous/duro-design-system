import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'A row of controls with one tab stop (the WAI-ARIA toolbar pattern): Tab enters at the last focused control, Left/Right move across every control inside — through attached ButtonGroups too — and Home/End jump to the ends. A Select or Menu trigger keeps its own keys, and a control whose popup is open keeps Left/Right.',
  whenToUse: [
    'An editor toolbar: text style, format toggles, insert menus',
    'A dense set of related actions that should cost one Tab, not one per control',
  ],
  whenNotToUse: [
    'A dialog footer or a form action row — use ButtonGroup (every button its own tab stop)',
    'A floating bulk-selection bar — use ActionBar',
    'A vertical toolbar holding a Select: a closed Select takes ArrowDown/ArrowUp to open, so use the horizontal orientation',
  ],
  anatomy: {
    required: ['Toolbar', 'aria-label'],
    optional: ['ButtonGroup attached', 'Toggle', 'Button', 'Select', 'Menu', 'Popover'],
  },
  relatedTo: [
    {
      component: 'ButtonGroup',
      kind: 'composition',
      relationship:
        'Place attached ButtonGroups inside a Toolbar: the group joins the controls visually, the toolbar gives them one tab stop and arrow keys',
    },
    {
      component: 'ToggleGroup',
      kind: 'composition',
      relationship:
        'A ToggleGroup inside a Toolbar hands its arrow keys to the toolbar (one roving handler)',
    },
    {
      component: 'ActionBar',
      kind: 'contrast',
      relationship: 'ActionBar floats over a selection; Toolbar sits in the layout',
    },
  ],
  example: `<Toolbar aria-label="Formatting">
  <ButtonGroup attached aria-label="Text style">
    <Toggle aria-label="Bold" pressed={bold} onPressedChange={setBold}>B</Toggle>
    <Toggle aria-label="Italic" pressed={italic} onPressedChange={setItalic}>I</Toggle>
  </ButtonGroup>
  <Menu.Root>
    <Menu.Trigger>Insert</Menu.Trigger>
    <Menu.Popup>…</Menu.Popup>
  </Menu.Root>
</Toolbar>`,
}
