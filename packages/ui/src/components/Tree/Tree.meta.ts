import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Hierarchy of items with single selection and expandable branches (the WAI-ARIA tree pattern): one tab stop, arrow keys, Home/End, typeahead. Compound component — Root is required.',
  whenToUse: [
    'Browsing data that nests to any depth — a file tree, zones › services › capabilities, namespace › resource',
    'Picking one node of a hierarchy to show its details beside the tree',
  ],
  whenNotToUse: [
    'Site or app navigation — use SideNav (a rail advertises destinations; a tree browses data)',
    'A flat list of choices — use List or RadioGroup',
    'Choosing several nodes at once — not supported (single selection)',
  ],
  anatomy: {
    required: ['Root', 'Item'],
  },
  relatedTo: [
    {
      component: 'SideNav',
      kind: 'contrast',
      relationship:
        'SideNav is navigation between pages; Tree browses arbitrary-depth data. Never nest SideNav to fake a tree',
    },
    {
      component: 'split-pane',
      kind: 'composition',
      relationship:
        'A Tree in the list column of the split-pane recipe, the selection’s details beside it',
    },
  ],
  example: `<Tree.Root aria-label="Blocs" defaultExpanded={['energy']} onValueChange={setSelected}>
  <Tree.Item value="energy" label="Core business — Energy">
    <Tree.Item value="generation" label="Generation" meta="4 apps" />
    <Tree.Item value="network" label="Network operations">
      <Tree.Item value="scada" label="SCADA supervision" />
    </Tree.Item>
  </Tree.Item>
  <Tree.Item value="finance" label="Finance & steering" />
</Tree.Root>`,
}
