import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'A floating, non-modal panel from a screen edge: inset from the edge, rounded all round, no backdrop, so the page and anything on it stay usable beside it. Side panes rest at two widths (compact and expanded) and a bottom pane at two heights (medium and large); an Expand button in the header steps between them, and so does the grabber. Escape closes it only while focus is inside. Built from Drawer, so swipe-to-dismiss and the detents are the Drawer ones. Web only for now.',
  whenToUse: [
    'A tool panel the user works in while looking at the page: a theme or style picker, an inspector, filters',
    'Content that needs more room on demand: compact first, expanded when the user asks',
    'The same panel on phones as a bottom sheet and on desktop as a side pane',
  ],
  whenNotToUse: [
    'A modal task that needs focus and a backdrop — use Dialog or Drawer',
    'Details that sit beside a table in the page flow — use DetailPanel',
    'A few controls anchored to a button — use Popover',
    'Primary navigation — use SideNav',
  ],
  anatomy: {
    required: ['Root', 'Portal'],
    optional: ['Trigger', 'Header', 'Title', 'Body', 'Footer', 'Close', 'Expand'],
  },
  relatedTo: [
    {
      component: 'Drawer',
      kind: 'composition',
      relationship:
        'Pane is a non-modal Drawer that floats; modal Drawer dims the page and locks scroll',
    },
    {
      component: 'DetailPanel',
      kind: 'contrast',
      relationship:
        'DetailPanel is in the page flow and splits the layout; Pane floats over the page and leaves the layout alone',
    },
    {
      component: 'Popover',
      kind: 'contrast',
      relationship:
        'Popover is a small overlay anchored to its trigger; Pane is a panel with its own sizes and does not open another popover over a popover',
    },
  ],
  example: `<Pane.Root>
  <Pane.Trigger>
    <Button>Theme</Button>
  </Pane.Trigger>
  <Pane.Portal>
    <Pane.Header>
      <Pane.Title>Theme</Pane.Title>
      <Pane.Expand />
      <Pane.Close />
    </Pane.Header>
    <Pane.Body>...</Pane.Body>
  </Pane.Portal>
</Pane.Root>`,
}
