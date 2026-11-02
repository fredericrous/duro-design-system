import {useState} from 'react'
import {
  Badge,
  Button,
  Dialog,
  Drawer,
  Icon,
  Inline,
  List,
  MasterDetail,
  Menu,
  Popover,
  SteppedList,
  Text,
  Tooltip,
} from '@duro-app/ui'

/**
 * Checkpoint B scenarios for the anchored overlays: a Menu whose item opens a
 * Dialog (it must present after the menu has gone, on both OSes), a Popover,
 * and Tooltip hints on a Button and a Menu trigger.
 */
export function OverlayDemo() {
  const [renaming, setRenaming] = useState(false)
  const [starting, setStarting] = useState(false)
  return (
    <Inline gap="sm">
      <Menu.Root>
        <Tooltip.Root content="Session actions">
          <Menu.Trigger aria-label="More">
            <Icon name="menu" />
          </Menu.Trigger>
        </Tooltip.Root>
        <Menu.Popup>
          <Menu.Item onClick={() => setRenaming(true)}>Rename…</Menu.Item>
          <Menu.Item>Duplicate</Menu.Item>
          <Menu.Separator />
          <Menu.LinkItem href="https://github.com/fredericrous/duro-design-system">
            Open on GitHub
          </Menu.LinkItem>
        </Menu.Popup>
      </Menu.Root>
      <Dialog.Root open={renaming} onOpenChange={setRenaming}>
        <Dialog.Portal size="sm">
          <Dialog.Header>
            <Dialog.Title>Rename</Dialog.Title>
            <Dialog.Close />
          </Dialog.Header>
          <Dialog.Body>
            <Text>Opened from a menu item.</Text>
          </Dialog.Body>
        </Dialog.Portal>
      </Dialog.Root>
      <Button onClick={() => setStarting(true)}>New session</Button>
      <Drawer.Root anchor="bottom" open={starting} onOpenChange={setStarting}>
        <Drawer.Portal
          placement="floating"
          backdrop="ramp"
          above={
            <Button variant="secondary" onClick={() => setStarting(false)}>
              Close
            </Button>
          }
        >
          <Drawer.Title>New session</Drawer.Title>
          <Drawer.Body>
            <Text>A floating card with a ramped backdrop.</Text>
          </Drawer.Body>
        </Drawer.Portal>
      </Drawer.Root>
      <Popover.Root>
        <Popover.Trigger>Filters</Popover.Trigger>
        <Popover.Popup label="Filters">
          <Text>Popover content</Text>
          <SteppedList.Root defaultStep="repos" backLabel="Back">
            <SteppedList.Step id="repos" title="Repositories">
              <List.Root aria-label="Repositories">
                <SteppedList.Item to="branches">
                  <List.Content>
                    <List.Text>duro</List.Text>
                  </List.Content>
                </SteppedList.Item>
              </List.Root>
            </SteppedList.Step>
            <SteppedList.Step id="branches" title="Branches">
              <List.Root aria-label="Branches">
                <List.Section title="Recent">
                  <List.Item>
                    <List.Content>
                      <List.Text>main</List.Text>
                    </List.Content>
                    <List.Actions>
                      <Badge dot variant="success">
                        Default
                      </Badge>
                    </List.Actions>
                  </List.Item>
                </List.Section>
              </List.Root>
            </SteppedList.Step>
          </SteppedList.Root>
          <Popover.Close>Close</Popover.Close>
        </Popover.Popup>
      </Popover.Root>
      <Popover.Root>
        <Popover.Trigger>Agents</Popover.Trigger>
        <Popover.Popup
          label="Agent picker"
          width="pickerMaxW"
          maxHeight="pickerMaxH"
          padding="flush"
        >
          <MasterDetail.Root defaultFocusedValue="claude">
            <MasterDetail.Rail aria-label="Agents">
              <MasterDetail.Section title="Agents" count={2}>
                <MasterDetail.Item value="claude" selected>
                  Claude
                </MasterDetail.Item>
                <MasterDetail.Item value="codex">Codex</MasterDetail.Item>
              </MasterDetail.Section>
            </MasterDetail.Rail>
            <MasterDetail.Detail>
              {(agent) => <Text>{`Settings of ${agent}`}</Text>}
            </MasterDetail.Detail>
          </MasterDetail.Root>
        </Popover.Popup>
      </Popover.Root>
      <Tooltip.Root content="Saves without closing">
        <Tooltip.Trigger>
          <Button variant="secondary">Save</Button>
        </Tooltip.Trigger>
      </Tooltip.Root>
    </Inline>
  )
}
