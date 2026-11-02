import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    "A drill-down list: a stack of steps, each with a title, its own rows and an optional input row. A SteppedList.Item pushes the step named by `to`; the back control (text from `backLabel`) pops to the previous one. Focus moves to the new step's first row on push and back to the row that opened it on pop. Rows are as tall as they are, up to `maxHeight` (a size-token key), then scroll. Lives inside a Popover.Popup (a branch or repository picker) or any panel, on web and native. Every step is a labelled group.",
  whenToUse: [
    'A picker with a second level inside a Popover: repository, then branch',
    'Drilling into a choice without leaving the surface it is in',
  ],
  whenNotToUse: [
    'A flat list of choices — use List or Select',
    'Page-to-page navigation — use links and a router',
    'A hierarchy browsed in place — use Tree',
  ],
  anatomy: {
    required: ['Root', 'Step', 'Item'],
  },
  relatedTo: [
    {
      component: 'Popover',
      kind: 'composition',
      relationship: 'Place SteppedList.Root inside Popover.Popup',
    },
    {
      component: 'List',
      kind: 'composition',
      relationship:
        'A Step holds a List.Root; its Items are SteppedList.Items (List.Section works too)',
    },
  ],
  example: `<Popover.Popup label="Pick a branch">
  <SteppedList.Root defaultStep="repos" backLabel="Back" maxHeight="listMaxH">
    <SteppedList.Step id="repos" title="Repositories">
      <List.Root aria-label="Repositories">
        <SteppedList.Item to="branches">
          <List.Content><List.Text>duro</List.Text></List.Content>
        </SteppedList.Item>
      </List.Root>
    </SteppedList.Step>
    <SteppedList.Step id="branches" title="Branches">
      <List.Root aria-label="Branches">
        <List.Item onClick={pick}>
          <List.Content><List.Text>main</List.Text></List.Content>
        </List.Item>
      </List.Root>
    </SteppedList.Step>
  </SteppedList.Root>
</Popover.Popup>`,
}
