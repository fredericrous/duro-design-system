import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'The previous and next pages in reading order, at the foot of a page: a labelled nav with up to two link cards (a direction label over the page title, both from props). A missing side keeps its slot, so Next stays right-aligned; the cards stack below the xs container width. Links take href and an optional onNavigate(href, event) (plain clicks only). Compound component — Root is required.',
  whenToUse: [
    'Docs or a guide read in order — the foot of each page',
    'A sequence of steps where each step is its own page',
  ],
  whenNotToUse: [
    'Numbered result pages of a table — use Pagination from @duro-app/ui/table',
    'Going up the hierarchy — use Breadcrumb',
  ],
  anatomy: {
    required: ['Root'],
    optional: ['Prev', 'Next'],
  },
  relatedTo: [
    {
      component: 'Breadcrumb',
      kind: 'contrast',
      relationship: 'PageNav goes along the reading order; Breadcrumb goes up the hierarchy',
    },
    {
      component: 'Card',
      kind: 'contrast',
      relationship:
        'PageNav draws its own link cards; do not wrap a Card in a link to fake a prev/next pair',
    },
  ],
  example: `<PageNav.Root aria-label="Pages">
  <PageNav.Prev href="/docs/architecture/clusters" label="Previous" title="Clusters and bootstrap" onNavigate={go} />
  <PageNav.Next href="/docs/architecture/secrets" label="Next" title="Secrets and Vault" onNavigate={go} />
</PageNav.Root>`,
}
