import type {Meta, StoryObj} from '@storybook/react'
import {css, html} from 'react-strict-dom'
import {Inline} from './Inline'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

const meta: Meta<typeof Inline> = {
  title: 'Layout/Inline',
  component: Inline,
  argTypes: {
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'ms', 'md', 'lg', 'xl', 'xxl', 'xxxl'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'baseline', 'stretch'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Inline>

const localStyles = css.create({
  box: {
    backgroundColor: colors.accent,
    color: colors.accentContrast,
    padding: spacing.sm,
    borderRadius: 4,
    textAlign: 'center',
    fontSize: '0.875rem',
  },
  iconLg: {
    fontSize: '1.25rem',
  },
})

const Box = ({children}: {children: string}) => (
  <html.div style={localStyles.box}>{children}</html.div>
)

export const Default: Story = {
  args: {
    gap: 'sm',
    align: 'center',
    justify: 'start',
  },
  render: (args) => (
    <Inline {...args}>
      <Box>One</Box>
      <Box>Two</Box>
      <Box>Three</Box>
    </Inline>
  ),
}

export const SpaceBetween: Story = {
  render: () => (
    <Inline gap="md" justify="between">
      <Box>Left</Box>
      <Box>Right</Box>
    </Inline>
  ),
}

export const IconAndText: Story = {
  render: () => (
    <Inline gap="xs" align="center">
      <html.span style={localStyles.iconLg}>*</html.span>
      <html.span>Label text</html.span>
    </Inline>
  ),
}

export const ButtonGroup: Story = {
  render: () => (
    <Inline gap="sm">
      <Box>Save</Box>
      <Box>Cancel</Box>
      <Box>Delete</Box>
    </Inline>
  ),
}
