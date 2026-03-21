import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Tabbed interface with keyboard navigation. Supports horizontal and vertical orientation. Compound component — Root is required.',
  whenToUse: [
    'Switching between content panels in the same view',
    'Settings pages with multiple sections',
    'Organizing related content without page navigation',
  ],
  whenNotToUse: [
    'Primary site navigation — use SideNav or links',
    'Step-by-step wizard — use a custom stepper',
  ],
  anatomy: {
    required: ['Root', 'List', 'Tab', 'Panel'],
  },
  relatedTo: [
    {component: 'SideNav', relationship: 'For persistent navigation, not content switching'},
  ],
  example: `<Tabs.Root defaultValue="general">
  <Tabs.List>
    <Tabs.Tab value="general">General</Tabs.Tab>
    <Tabs.Tab value="security">Security</Tabs.Tab>
    <Tabs.Tab value="billing" disabled>Billing</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="general">General settings content</Tabs.Panel>
  <Tabs.Panel value="security">Security settings content</Tabs.Panel>
  <Tabs.Panel value="billing">Billing content</Tabs.Panel>
</Tabs.Root>`,
}
