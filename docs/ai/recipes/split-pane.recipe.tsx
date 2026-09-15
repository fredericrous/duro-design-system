import {useState} from 'react'
import {Grid} from '../../../packages/ui/src/components/Grid/Grid'
import {List} from '../../../packages/ui/src/components/List/List'
import {Panel} from '../../../packages/ui/src/components/Panel/Panel'
import {Stack} from '../../../packages/ui/src/components/Stack/Stack'
import {Inline} from '../../../packages/ui/src/components/Inline/Inline'
import {Heading} from '../../../packages/ui/src/components/Heading/Heading'
import {Text} from '../../../packages/ui/src/components/Text/Text'
import {Badge} from '../../../packages/ui/src/components/Badge/Badge'
import {Button} from '../../../packages/ui/src/components/Button/Button'
import {EmptyState} from '../../../packages/ui/src/components/EmptyState/EmptyState'
import type {ComponentMeta} from '../types'

export const recipeMeta: ComponentMeta = {
  description:
    'List/detail split: a selectable List beside a Panel showing the selection, on Grid layout="split" (list ≥ 240px, one column below the md breakpoint).',
  whenToUse: [
    'A screen that browses a collection and inspects one item at a time (applications, identities, certificates)',
    'Anywhere a hand-rolled gridTemplateColumns with its own @media is about to be written',
  ],
  whenNotToUse: [
    'The detail is a short-lived inspection — use DetailPanel over the list instead',
    'The left side is navigation, not data — use the page-with-sidenav recipe',
  ],
  example: '<SplitPaneRecipe />',
}

const ITEMS = [
  {id: 'grafana', name: 'Grafana', owner: 'platform', status: 'active'},
  {id: 'vault', name: 'Vault', owner: 'security', status: 'active'},
  {id: 'legacy-crm', name: 'Legacy CRM', owner: 'sales', status: 'retiring'},
] as const

export function SplitPaneRecipe() {
  const [selected, setSelected] = useState<string | null>(ITEMS[0].id)
  const item = ITEMS.find((candidate) => candidate.id === selected)

  return (
    <Grid layout="split" gap="lg">
      <List.Root selectionMode="single" aria-label="Applications">
        {ITEMS.map((candidate) => (
          <List.Item
            key={candidate.id}
            selected={candidate.id === selected}
            onClick={() => setSelected(candidate.id)}
          >
            <List.Content>
              <List.Text>{candidate.name}</List.Text>
              <List.Description>Owned by {candidate.owner}</List.Description>
            </List.Content>
            <List.Actions>
              <Badge variant={candidate.status === 'active' ? 'success' : 'warning'}>
                {candidate.status}
              </Badge>
            </List.Actions>
          </List.Item>
        ))}
        <List.Empty>No applications.</List.Empty>
      </List.Root>

      <Panel.Root bordered>
        {item ? (
          <>
            <Panel.Header>
              <Heading level={2}>{item.name}</Heading>
              <Inline gap="sm">
                <Button variant="secondary" size="small">
                  Edit
                </Button>
                <Button variant="danger" size="small">
                  Retire
                </Button>
              </Inline>
            </Panel.Header>
            <Panel.Body>
              <Stack gap="md">
                <Text>
                  Owner: <Text weight="medium">{item.owner}</Text>
                </Text>
                <Text color="muted">
                  Everything about the selection lives here: fields, history, related records.
                </Text>
              </Stack>
            </Panel.Body>
          </>
        ) : (
          <Panel.Body>
            <EmptyState message="Select an application to see its details." />
          </Panel.Body>
        )}
      </Panel.Root>
    </Grid>
  )
}
