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
