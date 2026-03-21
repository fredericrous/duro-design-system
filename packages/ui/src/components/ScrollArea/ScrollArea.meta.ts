import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Custom scrollbar region with draggable thumb. Supports vertical and horizontal scrolling. Compound component — Root is required.',
  whenToUse: [
    'Custom-styled scrollbars for content overflow areas',
    'Chat logs, code blocks, or long lists with constrained height',
  ],
  whenNotToUse: [
    'Simple page-level scrolling — browser scroll is fine',
    'Very short content that never overflows',
  ],
  anatomy: {
    required: ['Root', 'Viewport', 'Content', 'Scrollbar', 'Thumb'],
  },
  example: `<ScrollArea.Root>
  <ScrollArea.Viewport maxHeight={300}>
    <ScrollArea.Content>
      {/* Long content here */}
    </ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="vertical">
    <ScrollArea.Thumb orientation="vertical" />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>`,
}
