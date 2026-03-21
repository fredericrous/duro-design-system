import {useState} from 'react'
import {Inline} from '../../../packages/ui/src/components/Inline/Inline'
import {Select} from '../../../packages/ui/src/components/Select/Select'
import {Toggle} from '../../../packages/ui/src/components/Toggle/Toggle'
import {ToggleGroup} from '../../../packages/ui/src/components/ToggleGroup/ToggleGroup'
import {Button} from '../../../packages/ui/src/components/Button/Button'
import type {ComponentMeta} from '../types'

export function FilterBarRecipe() {
  const [view, setView] = useState<string[]>(['grid'])

  return (
    <Inline gap="sm" align="center" justify="between">
      <Inline gap="sm" align="center">
        <Select.Root name="status" defaultValue="all">
          <Select.Trigger>
            <Select.Value placeholder="Status" />
            <Select.Icon />
          </Select.Trigger>
          <Select.Popup>
            <Select.Item value="all">All statuses</Select.Item>
            <Select.Item value="active">Active</Select.Item>
            <Select.Item value="inactive">Inactive</Select.Item>
            <Select.Item value="archived">Archived</Select.Item>
          </Select.Popup>
        </Select.Root>

        <Select.Root name="role" defaultValue="all">
          <Select.Trigger>
            <Select.Value placeholder="Role" />
            <Select.Icon />
          </Select.Trigger>
          <Select.Popup>
            <Select.Item value="all">All roles</Select.Item>
            <Select.Item value="admin">Admin</Select.Item>
            <Select.Item value="editor">Editor</Select.Item>
            <Select.Item value="viewer">Viewer</Select.Item>
          </Select.Popup>
        </Select.Root>
      </Inline>

      <Inline gap="sm" align="center">
        <ToggleGroup value={view} onValueChange={setView} multiple={false}>
          <Toggle value="list">List</Toggle>
          <Toggle value="grid">Grid</Toggle>
        </ToggleGroup>

        <Button variant="secondary" onClick={() => console.log('reset')}>
          Reset
        </Button>
      </Inline>
    </Inline>
  )
}

export const recipeMeta: ComponentMeta = {
  description:
    'Filter bar with Select dropdowns, ToggleGroup for view switching, and reset button.',
  whenToUse: ['Above data tables or card grids', 'Dashboard filter controls'],
  whenNotToUse: ['Simple search — use just Input with InputGroup'],
  example: '<FilterBarRecipe />',
}
