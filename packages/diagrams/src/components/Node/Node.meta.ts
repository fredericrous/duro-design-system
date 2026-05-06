import type {ComponentMeta} from '../../component-meta'

export const meta: ComponentMeta = {
  description:
    'A rounded rectangle node with a title and optional subtitle. Coloured via a ramp prop; fill, stroke, and text colours flip automatically with the active theme.',
  whenToUse: [
    'Steps in a flowchart',
    'Components in an architecture diagram',
    'Boxes representing services, modules, or resources',
  ],
  whenNotToUse: [
    'Free-floating text — use Text',
    'Container shapes without semantic content — use a plain <rect className="box">',
  ],
  example: `<Node
  x={100} y={20} w={200} h={56}
  ramp="blue"
  title="Lookup metadata"
  subtitle="O(1) cache check"
/>`,
}
