import {useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {Combobox} from './Combobox'

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
  const [value, setValue] = useState<string | null>(null)

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Combobox.Root value={value} onValueChange={setValue}>
        <Combobox.Input placeholder="Pick a role...">
          <Combobox.Trigger />
        </Combobox.Input>
        <Combobox.Popup>
          <Combobox.Item value="admin"><Combobox.ItemText>Admin</Combobox.ItemText></Combobox.Item>
          <Combobox.Item value="editor"><Combobox.ItemText>Editor</Combobox.ItemText></Combobox.Item>
          <Combobox.Item value="viewer"><Combobox.ItemText>Viewer</Combobox.ItemText></Combobox.Item>
          <Combobox.Item value="moderator"><Combobox.ItemText>Moderator</Combobox.ItemText></Combobox.Item>
          <Combobox.Item value="analyst"><Combobox.ItemText>Analyst</Combobox.ItemText></Combobox.Item>
          <Combobox.Empty>No roles found</Combobox.Empty>
        </Combobox.Popup>
      </Combobox.Root>
      <span style={{fontSize: 14, color: '#888'}}>
        Selected: {value ?? 'none'}
      </span>
    </div>
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
      'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada',
      'Chile', 'China', 'Colombia', 'Denmark', 'Egypt', 'Finland',
      'France', 'Germany', 'Greece', 'India', 'Indonesia', 'Ireland',
      'Italy', 'Japan', 'Kenya', 'Mexico', 'Netherlands', 'New Zealand',
      'Norway', 'Peru', 'Poland', 'Portugal', 'South Korea', 'Spain',
      'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'United Kingdom', 'United States',
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
