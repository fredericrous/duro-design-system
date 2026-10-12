import {useState} from 'react'
import {Combobox, Listbox, Select, Stack, Text} from '@duro-app/ui'

const MODELS = [
  'claude-opus-5-5',
  'claude-sonnet-5-5',
  'claude-haiku-5-5',
  'gpt-6',
  'gpt-6-mini',
  'gemini-3-pro',
  'gemini-3-flash',
  'llama-5',
  'mistral-large-3',
]

const REPOS = Array.from({length: 40}, (_, i) => `repository-${String(i + 1).padStart(2, '0')}`)

/**
 * Checkpoint C scenarios for the pickers (C0 direction A, "Check",
 * docs/mockups/native-picker/Check.dc.html): a Select sheet, an empty Select,
 * a Combobox sheet with its search field above the keyboard and its empty
 * state, and a bare Listbox.
 */
export function PickerDemo() {
  const [model, setModel] = useState<string | null>('claude-sonnet-5-5')
  const [repo, setRepo] = useState<string | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  return (
    <Stack gap="sm">
      <Select.Root value={model ?? undefined} onValueChange={setModel}>
        <Select.Trigger aria-label="Model">
          <Select.Value placeholder="Choose a model" />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup label="Model">
          {MODELS.map((m) => (
            <Select.Item key={m} value={m}>
              {m}
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Root>
      <Select.Root>
        <Select.Trigger aria-label="Model, none available">
          <Select.Value placeholder="No models" />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup
          label="Model"
          empty={
            <Stack gap="xs" align="center">
              <Text weight="semibold">No models</Text>
              <Text color="muted">Connect a provider to choose a model.</Text>
            </Stack>
          }
        >
          {[]}
        </Select.Popup>
      </Select.Root>
      <Combobox.Root value={repo ?? undefined} onValueChange={setRepo}>
        <Combobox.Input placeholder="Search repositories" />
        <Combobox.Popup label="Repository">
          {REPOS.map((r) => (
            <Combobox.Item key={r} value={r}>
              {r}
            </Combobox.Item>
          ))}
          <Combobox.Empty>No repository matches</Combobox.Empty>
        </Combobox.Popup>
      </Combobox.Root>
      <Listbox.Root
        id="bare-listbox"
        open
        anchor={() => null}
        highlightedId={null}
        onSelect={setPicked}
        aria-label="Bare listbox"
      >
        <Listbox.Option value="one" selected={picked === 'one'}>
          One
        </Listbox.Option>
        <Listbox.Option value="two" selected={picked === 'two'}>
          Two
        </Listbox.Option>
      </Listbox.Root>
      <Text>Chosen: {[model, repo, picked].filter(Boolean).join(' · ') || 'nothing'}</Text>
    </Stack>
  )
}
