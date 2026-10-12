import {useState} from 'react'
import {Button, Dialog, Icon, Inline, Menu, Popover, Text, Tooltip} from '@duro-app/ui'

/**
 * Checkpoint B scenarios for the anchored overlays: a Menu whose item opens a
 * Dialog (it must present after the menu has gone, on both OSes), a Popover,
 * and Tooltip hints on a Button and a Menu trigger.
 */
export function OverlayDemo() {
  const [renaming, setRenaming] = useState(false)
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
      <Popover.Root>
        <Popover.Trigger>Filters</Popover.Trigger>
        <Popover.Popup label="Filters">
          <Text>Popover content</Text>
          <Popover.Close>Close</Popover.Close>
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
