import {useState} from 'react'
import {Grid} from '../../../packages/ui/src/components/Grid/Grid'
import {PageShell} from '../../../packages/ui/src/components/PageShell'
import {SideNav} from '../../../packages/ui/src/components/SideNav/SideNav'
import {Icon} from '../../../packages/ui/src/components/Icon/Icon'
import {Stack} from '../../../packages/ui/src/components/Stack/Stack'
import {Heading} from '../../../packages/ui/src/components/Heading/Heading'
import {Text} from '../../../packages/ui/src/components/Text/Text'
import {Card} from '../../../packages/ui/src/components/Card/Card'
import type {ComponentMeta} from '../types'

export const recipeMeta: ComponentMeta = {
  description:
    'Page with a side navigation rail: SideNav in the narrow column of Grid layout="split-wide", the routed content in the wide one; the rail stacks above the content below the md breakpoint.',
  whenToUse: [
    'The admin or settings area of an app — several destinations, one shell',
    'Anywhere PageShell + SideNav were about to be combined by hand',
  ],
  whenNotToUse: [
    'Three or four destinations — Tabs inside a PageShell read better than a rail',
    'The left column is data, not navigation — use the split-pane recipe',
  ],
  example: '<PageWithSideNavRecipe />',
}

const SECTIONS: Record<string, {title: string; body: string}> = {
  identities: {title: 'Identities', body: 'People and service accounts known to the system.'},
  grants: {title: 'Grants', body: 'Who holds what, and since when.'},
  applications: {title: 'Applications', body: 'Everything access is granted to.'},
  plugins: {title: 'Plugins', body: 'Push and pull connectors. Rarely visited, so it is a Group.'},
}

export function PageWithSideNavRecipe() {
  const [section, setSection] = useState('identities')
  const current = SECTIONS[section] ?? SECTIONS.identities

  return (
    <PageShell maxWidth="lg" padding="md">
      <Grid layout="split-wide" gap="xl">
        <SideNav.Root value={section} onValueChange={setSection}>
          <SideNav.Section label="People & access">
            <SideNav.Item value="identities" icon={<Icon name="users" size="md" />}>
              Identities
            </SideNav.Item>
            <SideNav.Item value="grants" icon={<Icon name="key" size="md" />}>
              Grants
            </SideNav.Item>
          </SideNav.Section>
          <SideNav.Section label="Catalog">
            <SideNav.Item value="applications" icon={<Icon name="box" size="md" />}>
              Applications
            </SideNav.Item>
          </SideNav.Section>
          <SideNav.Group label="Advanced" defaultExpanded={false}>
            <SideNav.Item value="plugins" icon={<Icon name="plug" size="md" />}>
              Plugins
            </SideNav.Item>
          </SideNav.Group>
        </SideNav.Root>

        <Stack gap="lg">
          <Heading level={1}>{current.title}</Heading>
          <Card>
            <Text color="muted">{current.body}</Text>
          </Card>
        </Stack>
      </Grid>
    </PageShell>
  )
}
