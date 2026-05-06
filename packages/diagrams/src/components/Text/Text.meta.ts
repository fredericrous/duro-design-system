import type {ComponentMeta} from '../../component-meta'

export const meta: ComponentMeta = {
  description:
    'Free-floating text inside a Diagram. Three variants — `t` (body 14px), `ts` (subtitle 12px muted), `th` (title 14px medium). Baseline is centred; descenders sit on the visual line.',
  whenToUse: [
    'Annotations and callouts pointing to nodes',
    'Section headers within a diagram',
    'Standalone labels not attached to a Node',
  ],
  whenNotToUse: ['Titles inside a Node — Node already renders its own title/subtitle'],
  example: `<Text x={20} y={20} variant="th">System overview</Text>
<Text x={20} y={40} variant="ts">As of 2026-05</Text>`,
}
