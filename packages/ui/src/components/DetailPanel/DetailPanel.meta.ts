import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Non-modal side panel for right-side inspection. Click a table row to show details, click another to update in place. Built on Panel internally. In-flow (flex child), not fixed/modal — content behind remains interactive.',
  whenToUse: [
    'Table row detail inspection (click row → see details)',
    'Side-by-side master-detail layouts',
    'Non-modal content inspection that keeps context visible',
  ],
  whenNotToUse: [
    'Modal overlays — use Dialog or Drawer',
    'Mobile slide-in panels — compose with Drawer',
    'Left-side navigation — use SideNav',
  ],
  anatomy: {
    required: ['Root', 'Content', 'Header', 'Body'],
    optional: ['Title', 'Footer', 'Close'],
  },
  relatedTo: [
    {
      component: 'Drawer',
      relationship: 'Drawer is modal with backdrop; DetailPanel is non-modal and in-flow',
    },
    {component: 'Panel', relationship: 'DetailPanel uses Panel structure internally'},
    {component: 'Table', relationship: 'Common pattern: Table + DetailPanel for master-detail'},
  ],
  example: `<html.div style={layoutStyles.container}>
  <html.div style={layoutStyles.main}>
    <Table.Root columns={3}>...</Table.Root>
  </html.div>
  <DetailPanel.Root open={selectedId != null} onOpenChange={handleOpenChange}>
    <DetailPanel.Content size="sm" label="User details">
      <DetailPanel.Header>
        <DetailPanel.Title>{user.name}</DetailPanel.Title>
        <DetailPanel.Close />
      </DetailPanel.Header>
      <DetailPanel.Body>
        <Stack gap="md">...</Stack>
      </DetailPanel.Body>
    </DetailPanel.Content>
  </DetailPanel.Root>
</html.div>`,
}
