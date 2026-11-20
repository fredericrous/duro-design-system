import {StrictMode, useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, screen, waitFor} from 'storybook/test'
import {Combobox} from './Combobox'
import {Stack} from '../Stack/Stack'
import {Text} from '../Text/Text'
import {Field} from '../Field/Field'

const meta: Meta = {
  title: 'Components/Combobox',
}

export default meta
type Story = StoryObj

const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew']

export const Default: Story = {
  render: () => (
    <Combobox.Root>
      <Combobox.Input placeholder="Search fruit...">
        <Combobox.Trigger />
      </Combobox.Input>
      <Combobox.Popup>
        {fruits.map((fruit) => (
          <Combobox.Item key={fruit} value={fruit.toLowerCase()}>
            <Combobox.ItemText>{fruit}</Combobox.ItemText>
          </Combobox.Item>
        ))}
        <Combobox.Empty>No fruits found</Combobox.Empty>
      </Combobox.Popup>
    </Combobox.Root>
  ),
  play: async ({canvas}) => {
    const input = canvas.getByRole('combobox')
    await expect(input).toBeInTheDocument()
    await expect(input).toHaveAttribute('aria-expanded', 'false')
  },
}

export const WithDefaultValue: Story = {
  render: () => (
    <Combobox.Root defaultValue="cherry" initialLabels={{cherry: 'Cherry'}}>
      <Combobox.Input placeholder="Search fruit...">
        <Combobox.Trigger />
      </Combobox.Input>
      <Combobox.Popup>
        {fruits.map((fruit) => (
          <Combobox.Item key={fruit} value={fruit.toLowerCase()}>
            <Combobox.ItemText>{fruit}</Combobox.ItemText>
          </Combobox.Item>
        ))}
        <Combobox.Empty>No fruits found</Combobox.Empty>
      </Combobox.Popup>
    </Combobox.Root>
  ),
  play: async ({canvas}) => {
    const input = canvas.getByRole('combobox')
    await expect(input).toHaveValue('Cherry')
  },
}

function ControlledDemo() {
  const [value, setValue] = useState<string | undefined>(undefined)

  return (
    <Stack gap="md">
      <Combobox.Root value={value} onValueChange={(v) => setValue(v ?? undefined)}>
        <Combobox.Input placeholder="Pick a role...">
          <Combobox.Trigger />
        </Combobox.Input>
        <Combobox.Popup>
          <Combobox.Item value="admin">
            <Combobox.ItemText>Admin</Combobox.ItemText>
          </Combobox.Item>
          <Combobox.Item value="editor">
            <Combobox.ItemText>Editor</Combobox.ItemText>
          </Combobox.Item>
          <Combobox.Item value="viewer">
            <Combobox.ItemText>Viewer</Combobox.ItemText>
          </Combobox.Item>
          <Combobox.Item value="moderator">
            <Combobox.ItemText>Moderator</Combobox.ItemText>
          </Combobox.Item>
          <Combobox.Item value="analyst">
            <Combobox.ItemText>Analyst</Combobox.ItemText>
          </Combobox.Item>
          <Combobox.Empty>No roles found</Combobox.Empty>
        </Combobox.Popup>
      </Combobox.Root>
      <Text variant="bodySm" color="muted">
        Selected: {value ?? 'none'}
      </Text>
    </Stack>
  )
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
  play: async ({canvas}) => {
    await expect(canvas.getByText('Selected: none')).toBeInTheDocument()
  },
}

export const ManyItems: Story = {
  render: () => {
    const countries = [
      'Argentina',
      'Australia',
      'Austria',
      'Belgium',
      'Brazil',
      'Canada',
      'Chile',
      'China',
      'Colombia',
      'Denmark',
      'Egypt',
      'Finland',
      'France',
      'Germany',
      'Greece',
      'India',
      'Indonesia',
      'Ireland',
      'Italy',
      'Japan',
      'Kenya',
      'Mexico',
      'Netherlands',
      'New Zealand',
      'Norway',
      'Peru',
      'Poland',
      'Portugal',
      'South Korea',
      'Spain',
      'Sweden',
      'Switzerland',
      'Thailand',
      'Turkey',
      'United Kingdom',
      'United States',
    ]

    return (
      <Combobox.Root>
        <Combobox.Input placeholder="Search country...">
          <Combobox.Trigger />
        </Combobox.Input>
        <Combobox.Popup>
          {countries.map((country) => (
            <Combobox.Item key={country} value={country.toLowerCase()}>
              <Combobox.ItemText>{country}</Combobox.ItemText>
            </Combobox.Item>
          ))}
          <Combobox.Empty>No countries found</Combobox.Empty>
        </Combobox.Popup>
      </Combobox.Root>
    )
  },
}

export const DescriptionAndLeading: Story = {
  render: () => (
    <Combobox.Root>
      <Combobox.Input placeholder="Search models...">
        <Combobox.Trigger />
      </Combobox.Input>
      <Combobox.Popup label="Model">
        <Combobox.Item value="fast" leading="⚡" description="Answers in a second or two">
          <Combobox.ItemText>Fast</Combobox.ItemText>
        </Combobox.Item>
        <Combobox.Item value="deep" leading="🧠" description="Thinks longer, answers better">
          <Combobox.ItemText>Deep</Combobox.ItemText>
        </Combobox.Item>
        <Combobox.Empty>No model found</Combobox.Empty>
      </Combobox.Popup>
    </Combobox.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const input = canvas.getByRole('combobox')
    await userEvent.click(input)
    const deep = await screen.findByRole('option', {name: 'Deep'})
    await expect(deep).toHaveAccessibleDescription('Thinks longer, answers better')
    await expect(deep).toHaveTextContent('Thinks longer, answers better')
    // The description is not filtered on: a word only it holds matches nothing.
    await userEvent.type(input, 'longer')
    await waitFor(() => expect(screen.queryByRole('option', {name: 'Deep'})).toBeNull())
    await userEvent.clear(input)
    await userEvent.type(input, 'de')
    await userEvent.click(await screen.findByRole('option', {name: 'Deep'}))
    await waitFor(() => expect(input).toHaveValue('Deep'))
  },
}

const fruitLabels = Object.fromEntries(fruits.map((f) => [f.toLowerCase(), f]))

function FruitList() {
  return (
    <Combobox.Popup label="Fruit">
      {fruits.map((fruit) => (
        <Combobox.Item key={fruit} value={fruit.toLowerCase()}>
          <Combobox.ItemText>{fruit}</Combobox.ItemText>
        </Combobox.Item>
      ))}
      <Combobox.Empty>No fruits found</Combobox.Empty>
    </Combobox.Popup>
  )
}

const optionCount = () => screen.queryAllByRole('option').length
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
// Past the input's 150 ms blur close, so a close that was going to fire has.
// Real time on purpose: these run in a browser, where fake timers would also
// freeze userEvent's own delays.
const AFTER_BLUR_CLOSE_MS = 300

export const OpensWithEveryOption: Story = {
  render: () => (
    <Combobox.Root defaultValue="cherry" initialLabels={fruitLabels}>
      <Combobox.Input aria-label="Fruit" />
      <FruitList />
    </Combobox.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const input = canvas.getByRole('combobox')
    input.focus()
    await waitFor(() => expect(optionCount()).toBe(fruits.length))
    await expect(screen.getByRole('option', {name: 'Cherry'})).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(input).toHaveAttribute('aria-activedescendant')
    // ArrowDown on the unfiltered list reaches every option.
    for (let step = 0; step < fruits.length - 3; step++) await userEvent.keyboard('{ArrowDown}')
    await expect(input.getAttribute('aria-activedescendant')).toBe(
      screen.getByRole('option', {name: 'Honeydew'}).id,
    )
    // Open then close without typing keeps the value and its label.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(optionCount()).toBe(0))
    await expect(input).toHaveValue('Cherry')
  },
}

export const PointerClickThenType: Story = {
  render: () => (
    <Combobox.Root defaultValue="cherry" initialLabels={fruitLabels}>
      <Combobox.Input aria-label="Fruit" />
      <FruitList />
    </Combobox.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const input = canvas.getByRole('combobox')
    await userEvent.click(input)
    await waitFor(() => expect(optionCount()).toBe(fruits.length))
    await userEvent.keyboard('b')
    await expect(input).toHaveValue('b')
    await waitFor(() => expect(screen.getAllByRole('option').length).toBeLessThan(fruits.length))
    await expect(screen.getByRole('option', {name: 'Banana'})).toBeInTheDocument()
  },
}

const languages = Array.from({length: 120}, (_, i) => `Language ${String(i + 1).padStart(3, '0')}`)
const languageLabels = Object.fromEntries(languages.map((name) => [name.toLowerCase(), name]))

/**
 * A long list whose chosen option sits near its end (a language picker): the
 * list opens with every option, the chosen one highlighted and scrolled into
 * view, and typing narrows it down to `Empty`.
 */
export const LongListChosenNearTheEnd: Story = {
  render: () => (
    <Combobox.Root defaultValue="language 110" initialLabels={languageLabels}>
      <Combobox.Input aria-label="Language" />
      <Combobox.Popup label="Language">
        {languages.map((name) => (
          <Combobox.Item key={name} value={name.toLowerCase()}>
            <Combobox.ItemText>{name}</Combobox.ItemText>
          </Combobox.Item>
        ))}
        <Combobox.Empty>No language found</Combobox.Empty>
      </Combobox.Popup>
    </Combobox.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const input = canvas.getByRole('combobox')
    await userEvent.click(input)
    await waitFor(() => expect(optionCount()).toBe(languages.length))
    const chosen = screen.getByRole('option', {name: 'Language 110'})
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBe(chosen.id))
    const list = screen.getByRole('listbox').getBoundingClientRect()
    await waitFor(() => {
      const box = chosen.getBoundingClientRect()
      expect(box.top).toBeGreaterThanOrEqual(list.top)
      expect(box.bottom).toBeLessThanOrEqual(list.bottom)
    })
    await userEvent.keyboard('Language 11')
    await waitFor(() => expect(optionCount()).toBe(10))
    await userEvent.keyboard('9x')
    await waitFor(() => expect(optionCount()).toBe(0))
    await expect(screen.getByText('No language found')).toBeInTheDocument()
  },
}

/**
 * The edges of the unfiltered open: typing the chosen label back exactly shows
 * every option again, and clearing the field then closing removes the value.
 */
export const TypedBackToTheLabelThenCleared: Story = {
  render: () => (
    <Combobox.Root defaultValue="cherry" initialLabels={fruitLabels}>
      <Combobox.Input aria-label="Fruit" />
      <FruitList />
    </Combobox.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const input = canvas.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.keyboard('Cherr')
    await waitFor(() => expect(optionCount()).toBe(1))
    await userEvent.keyboard('y')
    await waitFor(() => expect(optionCount()).toBe(fruits.length))
    await userEvent.clear(input)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(optionCount()).toBe(0))
    await expect(input).toHaveValue('')
    input.blur()
    input.focus()
    await waitFor(() => expect(optionCount()).toBe(fruits.length))
    await expect(screen.queryByRole('option', {selected: true})).toBeNull()
  },
}

export const TypedTextSurvivesBlurWithoutValue: Story = {
  render: () => (
    <Combobox.Root>
      <Combobox.Input aria-label="Fruit" />
      <FruitList />
    </Combobox.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const input = canvas.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.keyboard('an')
    await userEvent.tab()
    await waitFor(() => expect(optionCount()).toBe(0))
    await userEvent.click(input)
    await waitFor(() => expect(optionCount()).toBeGreaterThan(0))
    await expect(optionCount()).toBeLessThan(fruits.length)
    await expect(input).toHaveValue('an')
  },
}

function OpenChangeDemo({onOpen}: {onOpen: (open: boolean) => void}) {
  const [open, setOpen] = useState(false)
  return (
    <StrictMode>
      <Combobox.Root
        onOpenChange={(next) => {
          setOpen(next)
          onOpen(next)
        }}
      >
        <Combobox.Input aria-label="Fruit" />
        <FruitList />
      </Combobox.Root>
      <Text variant="bodySm">{open ? 'open' : 'closed'}</Text>
    </StrictMode>
  )
}

export const OpenChangeFiresOncePerTransition: StoryObj<{onOpen: (open: boolean) => void}> = {
  args: {onOpen: fn()},
  render: (args) => <OpenChangeDemo onOpen={args.onOpen} />,
  play: async ({args, canvas, userEvent}) => {
    const onOpen = args.onOpen as ReturnType<typeof fn>
    const sequence = () => onOpen.mock.calls.map((call: unknown[]) => call[0])
    // React reports a parent update made during render on console.error.
    const consoleError = console.error
    const errors: string[] = []
    console.error = (...parts: unknown[]) => {
      errors.push(parts.map(String).join(' '))
      consoleError(...parts)
    }
    try {
      await runOpenChangeSequence({onOpen, sequence, canvas, userEvent})
    } finally {
      console.error = consoleError
    }
    await expect(
      errors.filter((line) => /Cannot update a component|while rendering/.test(line)),
    ).toEqual([])
  },
}

async function runOpenChangeSequence({
  onOpen,
  sequence,
  canvas,
  userEvent,
}: {
  onOpen: ReturnType<typeof fn>
  sequence: () => unknown[]
  canvas: {getByRole: (role: string) => HTMLElement}
  userEvent: {
    click: (el: Element) => Promise<void>
    clear: (el: Element) => Promise<void>
    keyboard: (text: string) => Promise<void>
  }
}) {
  {
    const input = canvas.getByRole('combobox')
    input.focus()
    await waitFor(() => expect(onOpen).toHaveBeenCalledTimes(1))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(onOpen).toHaveBeenCalledTimes(2))
    // A blur while closed does not fire it.
    input.blur()
    await pause(AFTER_BLUR_CLOSE_MS)
    await expect(onOpen).toHaveBeenCalledTimes(2)
    // Focus then blur: one open, one close.
    onOpen.mockClear()
    input.focus()
    await waitFor(() => expect(onOpen).toHaveBeenCalledTimes(1))
    input.blur()
    await waitFor(() => expect(onOpen).toHaveBeenCalledTimes(2))
    await expect(sequence()).toEqual([true, false])
    // A pointer pick closes once, with no close-open-close.
    onOpen.mockClear()
    await userEvent.click(input)
    await userEvent.click(await screen.findByRole('option', {name: 'Fig'}))
    await pause(AFTER_BLUR_CLOSE_MS)
    await expect(sequence()).toEqual([true, false])
    await expect(input).toHaveValue('Fig')
    // An Enter pick whose handler updates parent state.
    onOpen.mockClear()
    await userEvent.clear(input)
    await userEvent.keyboard('gr{ArrowDown}{Enter}')
    await waitFor(() => expect(input).toHaveValue('Grape'))
    await pause(AFTER_BLUR_CLOSE_MS)
    await expect(sequence()).toEqual([true, false])
  }
}

function ControlledInputDemo({onInput}: {onInput: (text: string) => void}) {
  const [text, setText] = useState('Cherry')
  return (
    <Combobox.Root
      defaultValue="cherry"
      initialLabels={fruitLabels}
      inputValue={text}
      onInputChange={(next) => {
        onInput(next)
        setText(next)
      }}
    >
      <Combobox.Input aria-label="Fruit" />
      <FruitList />
    </Combobox.Root>
  )
}

export const ControlledInputValue: StoryObj<{onInput: (text: string) => void}> = {
  args: {onInput: fn()},
  render: (args) => <ControlledInputDemo onInput={args.onInput} />,
  play: async ({args, canvas, userEvent}) => {
    const onInput = args.onInput as ReturnType<typeof fn>
    const input = canvas.getByRole('combobox')
    await userEvent.click(input)
    await waitFor(() => expect(optionCount()).toBe(fruits.length))
    await expect(onInput).not.toHaveBeenCalled()
    await userEvent.click(await screen.findByRole('option', {name: 'Date'}))
    await waitFor(() => expect(onInput).toHaveBeenLastCalledWith('Date'))
    await userEvent.keyboard('{Control>}a{/Control}x')
    await userEvent.tab()
    await waitFor(() => expect(onInput).toHaveBeenLastCalledWith('Date'))
  },
}

export const NamedByAriaLabel: Story = {
  render: () => (
    <Combobox.Root>
      <Combobox.Input aria-label="Favourite fruit" />
      <FruitList />
    </Combobox.Root>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByRole('combobox', {name: 'Favourite fruit'})).toBeInTheDocument()
  },
}

export const NamedByFieldLabel: Story = {
  render: () => (
    <Field.Root>
      <Field.Label>Pick a fruit</Field.Label>
      <Combobox.Root>
        <Combobox.Input />
        <FruitList />
      </Combobox.Root>
    </Field.Root>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByRole('combobox', {name: 'Pick a fruit'})).toBeInTheDocument()
  },
}

export const InvalidInsideField: Story = {
  render: () => (
    <Field.Root invalid>
      <Field.Label>Pick a fruit</Field.Label>
      <Combobox.Root>
        <Combobox.Input />
        <FruitList />
      </Combobox.Root>
      <Field.Error>Choose a fruit from the list.</Field.Error>
    </Field.Root>
  ),
  play: async ({canvas}) => {
    const input = canvas.getByRole('combobox', {name: 'Pick a fruit'})
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAccessibleDescription('Choose a fruit from the list.')
  },
}
