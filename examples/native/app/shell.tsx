import {useState} from 'react'
import {
  AppShell,
  Heading,
  Inline,
  SideNav,
  SplitPane,
  Stack,
  Tabs,
  Tag,
  Text,
  Tree,
} from '@duro-app/ui'

/**
 * Checkpoint B for the navigation parts: the AppShell's phone shape (bar,
 * Main, the rail in a left Drawer) holding a SideNav and a Tree, with Tabs
 * and Tags in Main.
 */
export default function Shell() {
  const [page, setPage] = useState('sessions')
  const [tags, setTags] = useState(['auth', 'e2e', 'release'])
  return (
    <AppShell.Root
      menuLabel="Menu"
      closeLabel="Close navigation"
      skipLabel="Skip to content"
      brand={<Text>Duro</Text>}
    >
      <AppShell.Rail aria-label="Navigation">
        {({close}) => (
          <Stack gap="md">
            <SideNav.Root
              aria-label="Main"
              value={page}
              onValueChange={(v) => {
                setPage(v)
                close()
              }}
            >
              <SideNav.Section label="Work">
                <SideNav.Item value="sessions">Sessions</SideNav.Item>
                <SideNav.Item value="projects">Projects</SideNav.Item>
              </SideNav.Section>
              <SideNav.Group label="Advanced">
                <SideNav.Item value="settings">Settings</SideNav.Item>
              </SideNav.Group>
            </SideNav.Root>
            <Tree.Root aria-label="Files" defaultExpanded={['src']}>
              <Tree.Item value="src" label="src">
                <Tree.Item value="app" label="app.tsx" />
                <Tree.Item value="ui" label="ui.tsx" />
              </Tree.Item>
              <Tree.Item value="readme" label="README.md" />
            </Tree.Root>
          </Stack>
        )}
      </AppShell.Rail>
      <AppShell.Main>
        <Stack gap="md">
          <Heading level={1}>{page}</Heading>
          <Tabs.Root defaultValue="open">
            <Tabs.List>
              <Tabs.Tab value="open">Open</Tabs.Tab>
              <Tabs.Tab value="archived">Archived</Tabs.Tab>
              <Tabs.Tab value="all">All</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="open">
              <Text>Open sessions</Text>
            </Tabs.Panel>
            <Tabs.Panel value="archived">
              <Text>Archived sessions</Text>
            </Tabs.Panel>
            <Tabs.Panel value="all">
              <Text>All sessions</Text>
            </Tabs.Panel>
          </Tabs.Root>
          <SplitPane.Root aria-label="Resize">
            <SplitPane.Pane>
              <Text>A SplitPane stacks on a phone: this pane first…</Text>
            </SplitPane.Pane>
            <SplitPane.Handle />
            <SplitPane.Pane>
              <Text>…then this one, with no handle.</Text>
            </SplitPane.Pane>
          </SplitPane.Root>
          <Inline gap="xs">
            {tags.map((t) => (
              <Tag
                key={t}
                variant="info"
                removable
                onRemove={() => setTags((all) => all.filter((x) => x !== t))}
              >
                {t}
              </Tag>
            ))}
          </Inline>
        </Stack>
      </AppShell.Main>
    </AppShell.Root>
  )
}
