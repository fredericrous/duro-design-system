import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Container with visual styling (elevation, border, or fill). Groups related content with consistent spacing and background. For structural containers with Header/Body/Footer slots, use Panel instead.',
  whenToUse: [
    'Grouping related content visually (settings sections, dashboard widgets)',
    'Clickable content cards with hover state (interactive variant)',
    'Content containers with elevation or borders',
  ],
  whenNotToUse: [
    'Structural containers with Header/Body/Footer — use Panel',
    'Page-level layout — use PageShell',
    'Simple spacing — use Stack or Inline',
  ],
  relatedTo: [
    {
      component: 'Panel',
      relationship: 'Panel for structural Header/Body/Footer; Card for visual container',
    },
  ],
  example: `<Card variant="elevated" size="md">
  <Stack gap="md">
    <Heading level={3}>Account</Heading>
    <Text>Manage your account settings.</Text>
  </Stack>
</Card>`,
}
