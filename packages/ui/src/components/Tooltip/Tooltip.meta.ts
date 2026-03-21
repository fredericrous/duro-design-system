import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Hover/focus tooltip that shows supplementary content. Compound component — Root is required (throws without it).',
  whenToUse: [
    'Providing extra context on hover for icon-only buttons',
    'Explaining abbreviations or truncated text',
  ],
  whenNotToUse: [
    'Critical information that must always be visible — use Text or Callout',
    'Interactive content (links, buttons) — tooltips are not interactive',
  ],
  anatomy: {
    required: ['Root', 'Trigger'],
  },
  example: `<Tooltip.Root content="Delete this item permanently" placement="top">
  <Tooltip.Trigger>
    <Button variant="danger">Delete</Button>
  </Tooltip.Trigger>
</Tooltip.Root>`,
}
