import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Vertical side navigation. `Section` is a labelled block that is always open — the default for primary navigation. `Group` is the same block behind a chevron (a disclosure) — reach for it only for a rare/advanced region, an unbounded data-driven list, or a rail long enough that flat stops reading as an overview; mixing the two in one rail is the healthy shape. `Item`s take an optional `icon` and show an active left-marker. Supports controlled and uncontrolled active item. Compound component — Root is required.',
  whenToUse: [
    'App-level sidebar navigation — flat `Section`s, every destination visible',
    'Settings navigation with labelled regions',
    '`Group` for a rare or advanced region tucked below the flat sections',
    '`Group` when the entries are data-driven and unbounded (one per namespace, project, team)',
  ],
  whenNotToUse: [
    'Collapsing the everyday destinations — a nav advertises where you can go; hiding the common ones behind a chevron costs a click each and removes them from scanning. Use `Section`.',
    'Arbitrary-depth data browsing (file tree, resource drill-down) — that needs role="tree" with roving tabindex and typeahead, not a deeper SideNav',
    'In-page content switching — use Tabs',
    'Top-level horizontal nav — use Inline with LinkButton',
  ],
  anatomy: {
    required: ['Root', 'Item'],
    optional: ['Section', 'Group'],
  },
  relatedTo: [
    {
      component: 'Tabs',
      kind: 'contrast',
      relationship: 'Tabs switch content in-place; SideNav navigates pages',
    },
    {component: 'PageShell', kind: 'composition', relationship: 'Often placed alongside PageShell'},
  ],
  example: `<SideNav.Root defaultValue="identities">
  {/* Default: always-open sections. Nothing is a click away from being seen. */}
  <SideNav.Section label="People & access">
    <SideNav.Item value="identities" icon={<Icon name="users" size="md" />}>Identities</SideNav.Item>
    <SideNav.Item value="grants" icon={<Icon name="key" size="md" />}>Grants</SideNav.Item>
  </SideNav.Section>
  {/* Disclosure, earned: rarely visited, so it starts collapsed. */}
  <SideNav.Group label="Advanced" defaultExpanded={false}>
    <SideNav.Item value="plugins" icon={<Icon name="plug" size="md" />}>Plugins</SideNav.Item>
  </SideNav.Group>
</SideNav.Root>`,
}
