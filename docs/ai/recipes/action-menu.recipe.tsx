import {Menu} from '../../../packages/ui/src/components/Menu/Menu'
import type {ComponentMeta} from '../types'

export function ActionMenuRecipe() {
  return (
    <Menu.Root>
      {/* Menu.Trigger is the button: give it the label, not a <Button>. */}
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Popup>
        <Menu.Item onClick={() => console.log('edit')}>Edit</Menu.Item>
        <Menu.Item onClick={() => console.log('duplicate')}>Duplicate</Menu.Item>
        <Menu.Item onClick={() => console.log('archive')}>Archive</Menu.Item>
        <Menu.LinkItem href="/settings">Settings</Menu.LinkItem>
      </Menu.Popup>
    </Menu.Root>
  )
}

export const recipeMeta: ComponentMeta = {
  description: 'Dropdown action menu with button trigger, action items, and a link item.',
  whenToUse: ['Row-level actions in tables', 'Overflow menus in toolbars', 'Context actions'],
  whenNotToUse: ['Selecting a value — use Select instead'],
  example: '<ActionMenuRecipe />',
}
