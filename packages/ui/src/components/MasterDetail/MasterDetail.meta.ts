import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'A rail of selectable rows whose focused row drives a detail pane. Compound component — Root is required. The rail is a vertical tab list (arrow keys move between items, the detail is a tabpanel labelled by the focused item); an Item\'s `selected` check is separate from the focus that picks the detail. The rail (`railWidth`, default `railW`, never over 30% of the width) and the detail scroll on their own inside `maxHeight` (default `pickerMaxH`), and stack, rail above detail, below the `sm` breakpoint. Item takes a trailing `action` beside its button. Lives in a Popover.Popup with `padding="flush"` (a chip picker), or in any panel, on web and native.',
  whenToUse: [
    'A picker with many options and a preview or settings pane for the focused one, inside a Popover',
    'A settings screen of sections on the left and the focused section on the right',
  ],
  whenNotToUse: [
    'Switching panels of equal weight — use Tabs',
    'A drill-down where the next level replaces the list — use SteppedList',
    'A flat list of choices — use List or Select',
  ],
  anatomy: {
    required: ['Root', 'Rail', 'Item', 'Detail'],
    optional: ['Section'],
  },
  relatedTo: [
    {
      component: 'Popover',
      kind: 'composition',
      relationship:
        'Place MasterDetail.Root inside Popover.Popup maxWidth="pickerMaxW" maxHeight="pickerMaxH" padding="flush"',
    },
    {
      component: 'Tabs',
      kind: 'contrast',
      relationship:
        'Tabs switches equal panels; MasterDetail is a long rail with its own selection beside a detail pane',
    },
    {
      component: 'SteppedList',
      kind: 'contrast',
      relationship: 'SteppedList drills into a second level; MasterDetail shows both at once',
    },
  ],
  example: `<Popover.Popup label="Pick a model" maxWidth="pickerMaxW" maxHeight="pickerMaxH" padding="flush">
  <MasterDetail.Root defaultFocusedValue="claude" onFocusedValueChange={preview}>
    <MasterDetail.Rail aria-label="Models">
      <MasterDetail.Section title="Providers" count={2}>
        <MasterDetail.Item value="claude" selected>Claude</MasterDetail.Item>
        <MasterDetail.Item value="gpt" action={<Button size="small">Remove</Button>}>GPT</MasterDetail.Item>
      </MasterDetail.Section>
    </MasterDetail.Rail>
    <MasterDetail.Detail>{(model) => <ModelSettings model={model} />}</MasterDetail.Detail>
  </MasterDetail.Root>
</Popover.Popup>`,
}
