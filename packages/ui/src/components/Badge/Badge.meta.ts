import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Small label or tag for status indicators, counts, or categories. Renders inline. Use for metadata annotations next to text or in table cells.',
  whenToUse: [
    'Status indicators (active, expired, pending)',
    'Category tags or labels',
    'Count indicators next to items',
  ],
  whenNotToUse: [
    'Interactive toggleable tags — use Toggle or ToggleGroup',
    'Long descriptive messages — use Alert or Callout',
  ],
  example: `<Inline gap="xs">
  <Badge variant="success">Active</Badge>
  <Badge variant="error">Expired</Badge>
  <Badge variant="default">Draft</Badge>
</Inline>`,
}
