import {useState} from 'react'
import {ScrollView} from 'react-native'
import {
  Badge,
  Heading,
  Inline,
  Menu,
  Panel,
  Popover,
  Stack,
  Text,
  TextLink,
  Tree,
  type OnNavigate,
} from '@duro-app/ui'

/**
 * Device checkpoint for the 5.17.0 native links (plan
 * 2026-10-15-happier-m1-gaps-native-links): a Tree with Happier-shaped rows
 * (caption + Badge meta) as leaf and branch, each with and without href;
 * TextLinks routed, unrouted and with a target; a Menu.LinkItem; a Popover
 * (Android refuses a string zIndex on its popup); a Panel whose
 * Body holds 50 rows. Every navigation lands in the log at the top.
 */
export default function Checkpoint() {
  const [log, setLog] = useState<string[]>([])
  const note = (line: string) => setLog((l) => [line, ...l].slice(0, 6))
  const route: OnNavigate = (href, event) => {
    event.preventDefault()
    note(`onNavigate ${href}`)
  }
  const meta = (time: string, status: string) => (
    <Inline gap="sm" align="center">
      <Text variant="caption" color="muted">
        {time}
      </Text>
      <Badge variant="info" size="sm">
        {status}
      </Badge>
    </Inline>
  )

  return (
    <ScrollView>
      <Stack gap="lg">
        <Stack gap="xs">
          <Heading level={3}>Log</Heading>
          {log.length === 0 ? <Text color="muted">nothing yet</Text> : null}
          {log.map((line, i) => (
            <Text key={i} variant="caption">
              {line}
            </Text>
          ))}
        </Stack>

        <Tree.Root aria-label="Sessions" defaultExpanded={['folder-link']}>
          <Tree.Item value="folder" label="happier" meta={meta('2m', '3')}>
            <Tree.Item
              value="s1"
              label="Fix the rail"
              href="/session/1"
              onNavigate={route}
              meta={meta('2m', 'Running')}
            />
            <Tree.Item value="s2" label="Plain leaf" meta={meta('1h', 'Idle')} />
          </Tree.Item>
          <Tree.Item
            value="folder-link"
            label="duro (page)"
            href="/folder/duro"
            onNavigate={route}
            meta={meta('5m', '2')}
          >
            <Tree.Item
              value="s3"
              label="Ship 5.17"
              href="/session/3"
              onNavigate={route}
              meta={meta('5m', 'Needs approval')}
            />
          </Tree.Item>
          <Tree.Item value="lonely" label="Unrouted link" href="/session/9" />
        </Tree.Root>

        <Text>
          Routed{' '}
          <TextLink href="/docs" onNavigate={route}>
            in-app link
          </TextLink>
          , a system <TextLink href="https://example.com">web link</TextLink> and a{' '}
          <TextLink href="https://example.com/blank" target="_blank" onNavigate={route}>
            new-window link
          </TextLink>{' '}
          inside one paragraph that wraps over several lines on a phone.
        </Text>

        <Menu.Root>
          <Menu.Trigger>Menu</Menu.Trigger>
          <Menu.Popup>
            <Menu.LinkItem href="/settings" onNavigate={route}>
              Settings (link)
            </Menu.LinkItem>
          </Menu.Popup>
        </Menu.Root>

        <Popover.Root>
          <Popover.Trigger>Filters</Popover.Trigger>
          <Popover.Popup label="Filters">
            <Text>Popover content</Text>
          </Popover.Popup>
        </Popover.Root>

        <Panel.Root bordered>
          <Panel.Header>
            <Heading level={3}>Panel, 50 rows</Heading>
          </Panel.Header>
          <Panel.Body>
            {Array.from({length: 50}, (_, i) => (
              <Text key={i}>Row {i + 1}</Text>
            ))}
          </Panel.Body>
          <Panel.Footer>
            <Text>Footer</Text>
          </Panel.Footer>
        </Panel.Root>
      </Stack>
    </ScrollView>
  )
}
