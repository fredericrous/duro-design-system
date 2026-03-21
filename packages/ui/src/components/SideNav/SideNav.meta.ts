import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Vertical side navigation with collapsible groups. Supports controlled and uncontrolled active item. Compound component — Root is required.',
  whenToUse: ['App-level sidebar navigation', 'Settings navigation with grouped sections'],
  whenNotToUse: [
    'In-page content switching — use Tabs',
    'Top-level horizontal nav — use Inline with LinkButton',
  ],
  anatomy: {
    required: ['Root', 'Group', 'Item'],
  },
  relatedTo: [
    {component: 'Tabs', relationship: 'Tabs switch content in-place; SideNav navigates pages'},
    {component: 'PageShell', relationship: 'Often placed alongside PageShell'},
  ],
  example: `<SideNav.Root defaultValue="dashboard">
  <SideNav.Group label="Main">
    <SideNav.Item value="dashboard">Dashboard</SideNav.Item>
    <SideNav.Item value="analytics">Analytics</SideNav.Item>
  </SideNav.Group>
  <SideNav.Group label="Settings" defaultExpanded={false}>
    <SideNav.Item value="profile">Profile</SideNav.Item>
    <SideNav.Item value="billing">Billing</SideNav.Item>
  </SideNav.Group>
</SideNav.Root>`,
}
