import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Content beside the main reading column — a table of contents, related pages: a labelled aside landmark that sticks within the viewport while the page scrolls and scrolls on its own when taller (offset from a spacing token, the raised layer). Forwards ref to the aside element.',
  whenToUse: [
    'The second track of Grid layout="content-aside": an "On this page" list, related links',
    'Secondary content that should stay in view beside a long page',
  ],
  whenNotToUse: [
    'Inspecting a selected record — use DetailPanel',
    'A navigation rail for the app — use AppShell.Rail',
  ],
  relatedTo: [
    {
      component: 'Grid',
      kind: 'composition',
      relationship:
        'Grid layout="content-aside" gives Aside its asideW track and stacks it below md',
    },
    {
      component: 'TableOfContents',
      kind: 'composition',
      relationship: 'The usual content of an Aside on a docs page',
    },
  ],
  example: `<Grid layout="content-aside" gap="xl">
  <Prose>{body}</Prose>
  <Aside aria-label="Page outline">
    <TableOfContents.Root aria-label="On this page" title="On this page">…</TableOfContents.Root>
  </Aside>
</Grid>`,
}
