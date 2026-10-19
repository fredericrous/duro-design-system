import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {Heading} from './Heading'
import {Stack} from '../Stack/Stack'
import {TextLink} from '../TextLink/TextLink'
import {onThemeSurface} from '../../docs/themedSurface'

const meta: Meta = {
  title: 'Components/Heading',
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
}

export default meta
type Story = StoryObj

export const Levels: Story = {
  render: () => (
    <Stack gap="sm">
      <Heading level={1}>Page title</Heading>
      <Heading level={2}>Section</Heading>
      <Heading level={3}>Subsection</Heading>
      <Heading level={4} color="muted">
        Group
      </Heading>
    </Stack>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByRole('heading', {level: 1, name: 'Page title'})).toBeInTheDocument()
    await expect(canvas.getByRole('heading', {level: 4, name: 'Group'})).toBeInTheDocument()
  },
}

/** `id` makes a heading the target of an in-page link (a table of contents)
 *  or of `aria-labelledby`. */
export const WithId: Story = {
  render: () => (
    <Stack gap="sm">
      <TextLink href="#install">Install</TextLink>
      <Heading level={2} id="install">
        Install
      </Heading>
    </Stack>
  ),
  play: async ({canvas}) => {
    const heading = canvas.getByRole('heading', {level: 2, name: 'Install'})
    await expect(heading).toHaveAttribute('id', 'install')
    await expect(document.getElementById('install')).toBe(heading)
    await expect(canvas.getByRole('link', {name: 'Install'})).toHaveAttribute('href', '#install')
  },
}

/** `variant` is the look and `size` its size, independent of the level: a group title over a
 *  list of rows is an `overline` heading, at any size. */
export const Overline: Story = {
  render: () => (
    <Stack gap="xs">
      <Heading level={3} variant="overline" color="muted">
        Today
      </Heading>
      <Heading level={3} variant="overline" size="md" color="muted">
        Earlier
      </Heading>
      <Heading level={2} variant="overline" size="lg">
        Archive
      </Heading>
    </Stack>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByRole('heading', {level: 3, name: 'Today'})).toBeInTheDocument()
    await expect(canvas.getAllByRole('heading', {level: 3})).toHaveLength(2)
    const sm = getComputedStyle(canvas.getByRole('heading', {name: 'Today'})).fontSize
    const lg = getComputedStyle(canvas.getByRole('heading', {name: 'Archive'})).fontSize
    await expect(parseFloat(lg)).toBeGreaterThan(parseFloat(sm))
  },
}

/** The old combined variants still render the same preset as the two props. */
export const LegacyVariant: Story = {
  render: () => (
    <Stack gap="xs">
      <Heading level={2} variant="headingSm">
        Legacy
      </Heading>
      <Heading level={2} variant="heading" size="sm">
        Current
      </Heading>
    </Stack>
  ),
  play: async ({canvas}) => {
    const legacy = getComputedStyle(canvas.getByRole('heading', {name: 'Legacy'}))
    const current = getComputedStyle(canvas.getByRole('heading', {name: 'Current'}))
    await expect(legacy.fontSize).toBe(current.fontSize)
    await expect(legacy.fontWeight).toBe(current.fontWeight)
  },
}
