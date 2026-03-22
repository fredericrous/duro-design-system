import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Placeholder for empty content areas. Shows an icon, message, and optional action button. Use when a list, table, or section has no data to display.',
  whenToUse: [
    'Empty tables or lists with no results',
    'Search results with no matches',
    'First-time use before any data exists',
  ],
  whenNotToUse: [
    'Loading states — use Spinner',
    'Error states — use Alert or Callout',
  ],
  example: `<Card>
  <EmptyState
    icon={<Icon name="info-circle" size={48} />}
    message="No results found"
    action={<Button variant="secondary">Clear filters</Button>}
  />
</Card>`,
}
