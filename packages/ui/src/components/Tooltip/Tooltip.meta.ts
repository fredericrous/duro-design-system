import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Hover/focus tooltip that shows supplementary content. Compound component — Root is required (throws without it). On touch (React Native) no bubble is drawn: a string content becomes the accessibility hint of the Duro trigger inside (Button, Toggle, Menu.Trigger, Popover.Trigger), read after its name. Keep tooltip text non-essential, and keep aria-label on icon-only triggers.',
  whenToUse: [
    'Providing extra context on hover for icon-only buttons',
    'Explaining abbreviations or truncated text',
  ],
  whenNotToUse: [
    'Critical information that must always be visible — use Text or Callout',
    'Interactive content (links, buttons) — tooltips are not interactive — use Popover',
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
