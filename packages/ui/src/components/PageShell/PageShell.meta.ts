import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Page-level layout wrapper. Centers content with max-width, padding, and an optional sticky header.',
  whenToUse: [
    'Top-level page layout',
    'Any full-page view that needs centered content with consistent padding',
  ],
  whenNotToUse: [
    'Nested section layouts — use Stack or Card',
    'Sidebar layouts — start from the page-with-sidenav recipe (PageShell + Grid layout="split-wide" + SideNav)',
  ],
  relatedTo: [
    {
      component: 'Stack',
      kind: 'composition',
      relationship: 'Use Stack for content within PageShell',
    },
    {component: 'SideNav', kind: 'composition', relationship: 'Often placed alongside PageShell'},
    {
      component: 'page-with-sidenav',
      kind: 'composition',
      relationship:
        'PageShell with a SideNav rail is the page-with-sidenav recipe — copy it, do not lay it out by hand',
    },
    {
      component: 'admin-detail-page',
      kind: 'composition',
      relationship: 'PageShell with a record heading and Tabs is the admin-detail-page recipe',
    },
  ],
  example: `<PageShell maxWidth="lg" padding="md" header={<Heading level={1}>Dashboard</Heading>}>
  <Stack gap="lg">
    <Card>Content section 1</Card>
    <Card>Content section 2</Card>
  </Stack>
</PageShell>`,
}
