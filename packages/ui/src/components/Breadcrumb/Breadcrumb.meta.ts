import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Where the current page sits in the hierarchy: a labelled nav landmark with an ordered list of links, outermost first. The current page is text with aria-current="page"; the › separators are aria-hidden. Links take href and an optional onNavigate(href, event) for a client router (plain clicks only). Compound component — Root is required.',
  whenToUse: [
    'A page deep in a hierarchy — docs › section › page, admin › collection › record',
    'A detail page whose way back to its collection should be one click',
  ],
  whenNotToUse: [
    'The previous and next pages in reading order — use PageNav',
    'The sections of the page being read — use TableOfContents',
    'Primary app navigation — use SideNav',
  ],
  anatomy: {
    required: ['Root', 'Item'],
  },
  relatedTo: [
    {
      component: 'PageNav',
      kind: 'contrast',
      relationship: 'Breadcrumb goes up the hierarchy; PageNav goes along the reading order',
    },
    {
      component: 'admin-detail-page',
      kind: 'composition',
      relationship: 'The admin-detail-page recipe heads the record with a Breadcrumb',
    },
  ],
  example: `<Breadcrumb.Root aria-label="Breadcrumb">
  <Breadcrumb.Item href="/docs" onNavigate={go}>Docs</Breadcrumb.Item>
  <Breadcrumb.Item href="/docs/architecture" onNavigate={go}>Architecture</Breadcrumb.Item>
  <Breadcrumb.Item current>AI-ops platform</Breadcrumb.Item>
</Breadcrumb.Root>

// go = (href, event) => { event.preventDefault(); navigate(href) }`,
}
