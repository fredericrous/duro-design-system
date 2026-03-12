import type {Meta, StoryObj} from '@storybook/react'
import {css, html} from 'react-strict-dom'
import {Cluster} from './Cluster'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

const meta: Meta<typeof Cluster> = {
  title: 'Layout/Cluster',
  component: Cluster,
  argTypes: {
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'ms', 'md', 'lg', 'xl', 'xxl', 'xxxl'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Cluster>

const localStyles = css.create({
  tag: {
    backgroundColor: colors.accent,
    color: colors.accentContrast,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    borderRadius: 12,
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
  },
  narrow: {
    maxWidth: 300,
  },
})

const Tag = ({children}: {children: string}) => (
  <html.span style={localStyles.tag}>{children}</html.span>
)

export const Default: Story = {
  args: {
    gap: 'sm',
    align: 'start',
    justify: 'start',
  },
  render: (args) => (
    <Cluster {...args}>
      <Tag>React</Tag>
      <Tag>TypeScript</Tag>
      <Tag>Design Systems</Tag>
      <Tag>Tokens</Tag>
      <Tag>Storybook</Tag>
    </Cluster>
  ),
}

export const ManyTags: Story = {
  render: () => (
    <html.div style={localStyles.narrow}>
      <Cluster gap="xs">
        <Tag>React</Tag>
        <Tag>TypeScript</Tag>
        <Tag>Design Systems</Tag>
        <Tag>CSS</Tag>
        <Tag>Tokens</Tag>
        <Tag>Storybook</Tag>
        <Tag>Accessibility</Tag>
        <Tag>Performance</Tag>
      </Cluster>
    </html.div>
  ),
}

export const Centered: Story = {
  render: () => (
    <Cluster gap="sm" justify="center">
      <Tag>Filter A</Tag>
      <Tag>Filter B</Tag>
      <Tag>Filter C</Tag>
    </Cluster>
  ),
}
