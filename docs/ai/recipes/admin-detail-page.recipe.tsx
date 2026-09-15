import {PageShell} from '../../../packages/ui/src/components/PageShell'
import {Tabs} from '../../../packages/ui/src/components/Tabs/Tabs'
import {Stack} from '../../../packages/ui/src/components/Stack/Stack'
import {Inline} from '../../../packages/ui/src/components/Inline/Inline'
import {Heading} from '../../../packages/ui/src/components/Heading/Heading'
import {Text} from '../../../packages/ui/src/components/Text/Text'
import {Badge} from '../../../packages/ui/src/components/Badge/Badge'
import {Button} from '../../../packages/ui/src/components/Button/Button'
import {LinkButton} from '../../../packages/ui/src/components/LinkButton/LinkButton'
import {Card} from '../../../packages/ui/src/components/Card/Card'
import {EmptyState} from '../../../packages/ui/src/components/EmptyState/EmptyState'
import type {ComponentMeta} from '../types'

export const recipeMeta: ComponentMeta = {
  description:
    'Admin detail page for one record: breadcrumb link, heading with status and actions, then Tabs whose panels hold the sections (the /admin/<collection>/:id shape).',
  whenToUse: [
    'A record page with several facets — overview, members, approvals, audit',
    'Any page that would otherwise stack every section into one long scroll',
  ],
  whenNotToUse: [
    'One facet only — a PageShell with a Card is enough',
    'A collection page — use the data-table or split-pane recipe',
  ],
  example: '<AdminDetailPageRecipe />',
}

function Header() {
  return (
    <Stack gap="sm">
      <LinkButton href="#applications" variant="secondary" size="small">
        ← Applications
      </LinkButton>
      <Inline gap="md" align="center" justify="between">
        <Inline gap="sm" align="center">
          <Heading level={1}>Grafana</Heading>
          <Badge variant="success">active</Badge>
        </Inline>
        <Inline gap="sm">
          <Button variant="secondary">Edit</Button>
          <Button variant="danger">Retire</Button>
        </Inline>
      </Inline>
    </Stack>
  )
}

export function AdminDetailPageRecipe() {
  return (
    <PageShell maxWidth="lg" padding="md" header={<Header />}>
      <Tabs.Root defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="members">Members</Tabs.Tab>
          <Tabs.Tab value="approvals">Approvals</Tabs.Tab>
          <Tabs.Tab value="audit">Audit</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <Stack gap="lg">
            <Card>
              <Stack gap="sm">
                <Heading level={3}>About</Heading>
                <Text color="muted">
                  Dashboards for the platform team. Owned by platform, reachable at grafana.example.
                </Text>
              </Stack>
            </Card>
            <Card>
              <Stack gap="sm">
                <Heading level={3}>Access</Heading>
                <Text>3 roles · 2 entitlements · 41 grants</Text>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <EmptyState message="No members yet." action={<Button>Add member</Button>} />
        </Tabs.Panel>
        <Tabs.Panel value="approvals">
          <EmptyState message="Every grant is auto-approved. Add a gate to require a decision." />
        </Tabs.Panel>
        <Tabs.Panel value="audit">
          <EmptyState message="Nothing recorded for this application." />
        </Tabs.Panel>
      </Tabs.Root>
    </PageShell>
  )
}
