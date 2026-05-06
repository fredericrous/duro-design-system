import type {ComponentMeta} from '../../component-meta'

export const meta: ComponentMeta = {
  description:
    'Connector line between two points, with an arrowhead at the end. Supports straight lines and right-angle (L) bends. The arrowhead inherits the line colour via stroke="context-stroke".',
  whenToUse: [
    'Linking nodes in a flowchart or architecture diagram',
    'Indicating directionality (the arrowhead points to `to`)',
  ],
  whenNotToUse: [
    'Dashed callouts to labels — use Leader',
    'Two-headed/undirected edges — out of scope in v1; render two arrows or a line + custom marker',
  ],
  example: `<Arrow from={[340, 76]} to={[340, 120]} />
<Arrow from={[280, 246]} to={[170, 300]} bend="L" />`,
}
