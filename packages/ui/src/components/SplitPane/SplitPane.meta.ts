import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Two panes side by side with a resizable separator: the first Pane is sized by the Handle (pointer drag, arrow keys, Shift for larger steps, Home and End), the second takes the rest. Min, max and starting widths are size tokens. onSizeChange reports every width while the handle moves; onSizeCommit reports the width once a resize ends (a released drag, each keyboard step), the moment to persist it. Below collapseBelow, measured on its own width, the panes stack in one column and the handle goes; on native they always stack. A controlled collapsed prop shrinks the first pane to a strip (the iconButton size) that shows collapsedContent, removes the Handle, and keeps the first pane’s own children mounted but inert and hidden (state kept, no tab stops, out of the accessibility tree); the prior width returns when it turns false. Native ignores both. The Handle is a hairline that thickens to the accent on hover, keyboard focus or drag.',
  whenToUse: [
    'A list beside its detail where people need more room on either side (a session list and its transcript)',
    'An editor beside its preview',
  ],
  whenNotToUse: [
    'A fixed list/detail layout nobody resizes — use Grid layout="split"',
    'Navigation beside content — use AppShell or the page-with-sidenav recipe',
    'A short-lived inspection over a list — use DetailPanel',
  ],
  anatomy: {
    required: ['Root', 'Pane'],
    optional: ['Handle'],
  },
  relatedTo: [
    {
      component: 'Grid',
      kind: 'contrast',
      relationship: 'Grid layout="split" is a fixed split; SplitPane lets people resize it',
    },
    {
      component: 'DetailPanel',
      kind: 'contrast',
      relationship: 'DetailPanel overlays the list; SplitPane keeps both side by side',
    },
  ],
  example: `<SplitPane.Root aria-label="Resize the session list" minSize="sidebarW" maxSize="panelLg">
  <SplitPane.Pane>
    <List.Root aria-label="Sessions">…</List.Root>
  </SplitPane.Pane>
  <SplitPane.Handle />
  <SplitPane.Pane>
    <Panel.Root>…</Panel.Root>
  </SplitPane.Pane>
</SplitPane.Root>`,
}
