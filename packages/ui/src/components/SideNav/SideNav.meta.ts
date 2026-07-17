import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Vertical side navigation. Use collapsible `Group`s (chevron accordion) or static `Section`s (always-open headers) — or a mix. `Item`s take an optional `icon` and show an active left-marker. Supports controlled and uncontrolled active item. Compound component — Root is required.',
  whenToUse: [
    'App-level sidebar navigation',
    'Settings navigation with grouped sections',
    'Flat menu with labelled, always-open regions — use Section instead of Group',
  ],
  whenNotToUse: [
    'In-page content switching — use Tabs',
    'Top-level horizontal nav — use Inline with LinkButton',
  ],
  anatomy: {
    required: ['Root', 'Item'],
    optional: ['Group', 'Section'],
  },
  relatedTo: [
    {component: 'Tabs', relationship: 'Tabs switch content in-place; SideNav navigates pages'},
    {component: 'PageShell', relationship: 'Often placed alongside PageShell'},
  ],
  example: `<SideNav.Root defaultValue="identities">
  {/* Static, always-open sections with icons (flat menu) */}
  <SideNav.Section label="People & access">
    <SideNav.Item value="identities" icon={<Icon name="users" size={18} />}>Identities</SideNav.Item>
    <SideNav.Item value="grants" icon={<Icon name="key" size={18} />}>Grants</SideNav.Item>
  </SideNav.Section>
  {/* Or collapsible groups (accordion) */}
  <SideNav.Group label="Advanced" defaultExpanded={false}>
    <SideNav.Item value="plugins" icon={<Icon name="plug" size={18} />}>Plugins</SideNav.Item>
  </SideNav.Group>
</SideNav.Root>`,
}
