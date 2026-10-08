import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'The "On this page" list of a long page\'s sections: a labelled nav of in-page links (href="#id", level 2 or 3). value is the id of the section being read; that item gets aria-current="location", the nav marker bar and a heavier weight. variant="menu" puts the list behind a disclosure button (aria-expanded) for narrow screens. No scroll-spy inside: the app computes value. Compound component — Root is required.',
  whenToUse: [
    'A long document page (docs, a runbook, an ADR) with H2/H3 sections',
    'variant="menu" for the same list on a narrow screen, above the body',
  ],
  whenNotToUse: [
    'Navigation between pages — use SideNav, Tree or Breadcrumb',
    'Switching views of one record — use Tabs',
    'A page with no H2/H3 — render nothing instead of an empty list',
  ],
  anatomy: {
    required: ['Root', 'Item'],
  },
  relatedTo: [
    {
      component: 'Tabs',
      kind: 'contrast',
      relationship:
        'Tabs swap the content in place; TableOfContents links to sections of one long page',
    },
    {
      component: 'PageNav',
      kind: 'contrast',
      relationship: 'TableOfContents moves within the page; PageNav moves to the next page',
    },
  ],
  example: `<TableOfContents.Root aria-label="On this page" label="On this page" value={activeId}>
  <TableOfContents.Item href="#components">The components</TableOfContents.Item>
  <TableOfContents.Item href="#wiring">Wiring</TableOfContents.Item>
  <TableOfContents.Item href="#webhooks" level={3}>Webhooks</TableOfContents.Item>
</TableOfContents.Root>

// narrow screens
<TableOfContents.Root aria-label="On this page" variant="menu" value={activeId}>
  …
</TableOfContents.Root>`,
}
