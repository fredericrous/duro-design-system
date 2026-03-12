import type {Meta, StoryObj} from '@storybook/react'
import {css, html} from 'react-strict-dom'
import {Stack} from './Stack'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

const meta: Meta<typeof Stack> = {
  title: 'Layout/Stack',
  component: Stack,
  argTypes: {
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'ms', 'md', 'lg', 'xl', 'xxl', 'xxxl'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Stack>

const localStyles = css.create({
  box: {
    backgroundColor: colors.accent,
    color: colors.accentContrast,
    padding: spacing.sm,
    borderRadius: 4,
    textAlign: 'center',
    fontSize: '0.875rem',
  },
  label: {
    fontSize: '0.75rem',
    color: colors.textMuted,
  },
})

const Box = ({children}: {children: string}) => (
  <html.div style={localStyles.box}>{children}</html.div>
)

export const Default: Story = {
  args: {
    gap: 'md',
    align: 'stretch',
  },
  render: (args) => (
    <Stack {...args}>
      <Box>First item</Box>
      <Box>Second item</Box>
      <Box>Third item</Box>
    </Stack>
  ),
}

export const Tight: Story = {
  render: () => (
    <Stack gap="xs">
      <Box>Tight spacing (4px)</Box>
      <Box>Between items</Box>
      <Box>For related content</Box>
    </Stack>
  ),
}

export const Spacious: Story = {
  render: () => (
    <Stack gap="xl">
      <Box>Section one</Box>
      <Box>Section two</Box>
      <Box>Section three</Box>
    </Stack>
  ),
}

export const CenterAligned: Story = {
  render: () => (
    <Stack gap="md" align="center">
      <Box>Short</Box>
      <Box>A wider content block</Box>
      <Box>Medium</Box>
    </Stack>
  ),
}

export const AllGaps: Story = {
  render: () => {
    const gaps = ['xs', 'sm', 'ms', 'md', 'lg', 'xl', 'xxl', 'xxxl'] as const
    return (
      <Stack gap="xl">
        {gaps.map((g) => (
          <Stack key={g} gap={g}>
            <html.span style={localStyles.label}>gap="{g}"</html.span>
            <Box>A</Box>
            <Box>B</Box>
          </Stack>
        ))}
      </Stack>
    )
  },
}
