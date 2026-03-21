import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description: 'Horizontal flex layout that WRAPS to the next line when items overflow.',
  whenToUse: [
    'Tags, badges, or chips that should wrap when they exceed the container width',
    'Any set of inline elements with unknown/dynamic count',
    'Filter pills, keyword lists, avatar groups',
  ],
  whenNotToUse: ['Items that must stay on one line — use Inline', 'Vertical stacking — use Stack'],
  relatedTo: [
    {component: 'Inline', relationship: 'Same but does NOT wrap (nowrap)'},
    {component: 'Stack', relationship: 'Vertical equivalent'},
  ],
  example: `<Cluster gap="xs">
  <Badge>React</Badge>
  <Badge>TypeScript</Badge>
  <Badge>Design Systems</Badge>
  <Badge>Accessibility</Badge>
</Cluster>`,
}
