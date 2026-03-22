import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Modal sliding panel from a screen edge (right, left, or bottom). Slides in with backdrop overlay. Supports swipe-to-dismiss gestures on mobile, backdrop click dismiss, and Escape key. Use for secondary workflows, settings panels, or mobile-friendly detail views.',
  whenToUse: [
    'Settings or configuration panels that slide in from the side',
    'Mobile-friendly detail views (bottom sheet pattern)',
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
    {component: 'Dialog', relationship: 'Dialog is centered modal; Drawer slides from an edge'},
    {component: 'DetailPanel', relationship: 'DetailPanel is non-modal and in-flow; Drawer is modal with backdrop'},
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
