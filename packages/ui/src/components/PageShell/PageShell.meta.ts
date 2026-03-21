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
    'Sidebar layouts — combine with SideNav manually',
  ],
  relatedTo: [
    {component: 'Stack', relationship: 'Use Stack for content within PageShell'},
    {component: 'SideNav', relationship: 'Often placed alongside PageShell'},
  ],
  example: `<PageShell maxWidth="lg" padding="md" header={<Heading level={1}>Dashboard</Heading>}>
  <Stack gap="lg">
    <Card>Content section 1</Card>
    <Card>Content section 2</Card>
  </Stack>
</PageShell>`,
}
