import type {ComponentMeta} from '../../component-meta'

export const meta: ComponentMeta = {
  description:
    'A dashed, thin line for callout/annotation leaders. No arrowhead. Use to point a label at a node or region without implying flow.',
  whenToUse: [
    'Connecting an annotation Text to its referenced shape',
    'Visually grouping a label with a region of the diagram',
  ],
  whenNotToUse: ['Indicating directional flow — use Arrow'],
  example: `<Leader from={[300, 100]} to={[420, 80]} />
<Text x={425} y={80} variant="ts" anchor="start">Annotation</Text>`,
}
