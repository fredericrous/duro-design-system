import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Hierarchy of items with single selection and expandable branches (the WAI-ARIA tree pattern): one tab stop, arrow keys, Home/End, typeahead. An Item with href renders its row as a real link (cmd-click opens a tab) outside the tab order; Enter/Space follows it, through onNavigate(href, event) when given. Compound component — Root is required. On React Native each row is a pressable link (href) or button, and a branch has its own chevron control that expands it (named by the optional Root prop expandLabel(text), default the item text); selection, expansion and aria-level are the same, the keyboard model (arrows, Home/End, typeahead) is web only. On native onNavigate is required for in-app routes: without it a relative href goes to the system (Linking.openURL). On web a tree with more items than Root virtualizeThreshold (default 150, open or not) is windowed: only the rows in view mount, as flat treeitems with aria-level, aria-setsize and aria-posinset; maxHeight caps its scroll viewport. Items must be JSX descendants of Root (fragments and arrays are fine, an Item hidden inside another component is not seen by the window). Native renders every row.',
  whenToUse: [
    'Browsing data that nests to any depth — a file tree, zones › services › capabilities, namespace › resource',
    'Picking one node of a hierarchy to show its details beside the tree',
    'A docs tree of sections and pages, each Item with href (and onNavigate for a client router)',
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
