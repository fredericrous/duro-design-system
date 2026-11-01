import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Modal sliding panel from a screen edge (right, left, or bottom). Slides in with backdrop overlay. Supports swipe-to-dismiss gestures on mobile, backdrop click dismiss, and Escape key. Swipe yields to an inner Duro ScrollArea: a drag there scrolls it, and dismisses only toward the edge from the scroll start (a native overflow:auto child is not covered — use ScrollArea). A bottom drawer with snapPoints (medium and large) is a phone sheet: it rests at its detents, a grabber steps through them on a tap, a drag moves between them and dismisses below the lowest; its Body is the scroll the drag defers to. A side drawer (left or right) takes snapPoints of its own, compact (the panelSm width) and expanded (the panelLg width), each held to the window width: it opens at defaultSnapPoint, a vertical grabber on its inner edge steps between them on a tap, swipe still dismisses it, and the size of Portal is ignored for it (web only; React Native ignores side snapPoints). Header titleAlign="center" centres the title with a text close at the end. Body flush drops its side padding, so rows run to the panel\'s edges (a picker\'s list); on React Native a bottom drawer rides above the on-screen keyboard. Root modal={false} drops the backdrop, aria-modal, body scroll lock and modal layering, so the page stays usable beside the panel; Escape then closes only while focus is inside the panel. A non-modal drawer sits at layers.floating (a modal one keeps layers.modal), and a Popover inside it stacks above the panel at layers.floatingRaised. modal={false} is web-only for now: React Native still renders a modal drawer. Use for secondary workflows, settings panels, or mobile-friendly detail views.',
  whenToUse: [
    'Settings or configuration panels that slide in from the side',
    'Mobile-friendly detail views (bottom sheet pattern)',
    'Side panels that open narrow and widen on demand (snapPoints compact and expanded)',
    'Phone pickers and lists that need more room on demand (snapPoints)',
    'Secondary workflows that need more space than a dialog',
    'Filters, navigation drawers, or form panels',
  ],
  whenNotToUse: [
    'Centered modal confirmations — use Dialog',
    'Non-modal side inspection panels — use DetailPanel',
    'Inline content expansion — use disclosure patterns',
    'Primary navigation — use SideNav',
  ],
  anatomy: {
    required: ['Root', 'Portal'],
    optional: ['Trigger', 'Header', 'Title', 'Description', 'Body', 'Footer', 'Close'],
  },
  relatedTo: [
    {
      component: 'Dialog',
      kind: 'contrast',
      relationship: 'Dialog is centered modal; Drawer slides from an edge',
    },
    {
      component: 'DetailPanel',
      kind: 'contrast',
      relationship: 'DetailPanel is non-modal and in-flow; Drawer is modal with backdrop',
    },
    {
      component: 'Popover',
      kind: 'contrast',
      relationship:
        'Popover is a small card anchored to an element; Drawer takes its place at phone width',
    },
  ],
  example: `<Drawer.Root anchor="right" open={open} onOpenChange={setOpen}>
  <Drawer.Trigger>
    <Button>Open drawer</Button>
  </Drawer.Trigger>
  <Drawer.Portal size="md">
    <Drawer.Header>
      <Drawer.Title>Settings</Drawer.Title>
      <Drawer.Close />
    </Drawer.Header>
    <Drawer.Body>
      <Stack gap="md">
        <Text>Drawer content goes here.</Text>
      </Stack>
    </Drawer.Body>
    <Drawer.Footer>
      <Button variant="secondary" onClick={() => setOpen(false)}>Done</Button>
    </Drawer.Footer>
  </Drawer.Portal>
</Drawer.Root>`,
}
