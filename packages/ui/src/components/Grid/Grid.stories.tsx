import type {Meta, StoryObj} from '@storybook/react'
import {css, html} from 'react-strict-dom'
import {Grid} from './Grid'
import {Stack} from '../Stack/Stack'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {useContainerQuery} from '../../hooks/useContainerQuery'

const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  argTypes: {
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'ms', 'md', 'lg', 'xl', 'xxl', 'xxxl'],
    },
    columns: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
    minColumnWidth: {control: 'text'},
  },
}

export default meta
type Story = StoryObj<typeof Grid>

const localStyles = css.create({
  cell: {
    backgroundColor: colors.accent,
    color: colors.accentContrast,
    padding: spacing.md,
    borderRadius: 4,
    textAlign: 'center',
    fontSize: '0.875rem',
  },
  label: {
    fontSize: '0.75rem',
    color: colors.textMuted,
  },
})

const Cell = ({children}: {children: string}) => (
  <html.div style={localStyles.cell}>{children}</html.div>
)

export const FixedColumns: Story = {
  args: {
    gap: 'md',
    columns: 3,
  },
  render: (args) => (
    <Grid {...args}>
      <Cell>1</Cell>
      <Cell>2</Cell>
      <Cell>3</Cell>
      <Cell>4</Cell>
      <Cell>5</Cell>
      <Cell>6</Cell>
    </Grid>
  ),
}

export const AutoFit: Story = {
  render: () => (
    <Grid gap="md" minColumnWidth="200px">
      <Cell>Card A</Cell>
      <Cell>Card B</Cell>
      <Cell>Card C</Cell>
      <Cell>Card D</Cell>
      <Cell>Card E</Cell>
    </Grid>
  ),
}

export const TwoColumns: Story = {
  render: () => (
    <Grid gap="lg" columns={2}>
      <Cell>Left</Cell>
      <Cell>Right</Cell>
    </Grid>
  ),
}

export const WithContainerQuery: Story = {
  render: function Render() {
    const {ref, size} = useContainerQuery<HTMLDivElement>()
    const gap = size === 'compact' ? 'sm' : size === 'spacious' ? 'xl' : 'md'
    const cols = size === 'compact' ? 1 : size === 'spacious' ? 4 : 2

    return (
      <html.div ref={ref}>
        <Stack gap="sm">
          <html.span style={localStyles.label}>
            Container size: {size} — columns: {cols} — gap: {gap}
          </html.span>
          <Grid gap={gap} columns={cols as 1 | 2 | 3 | 4}>
            <Cell>1</Cell>
            <Cell>2</Cell>
            <Cell>3</Cell>
            <Cell>4</Cell>
          </Grid>
        </Stack>
      </html.div>
    )
  },
}
