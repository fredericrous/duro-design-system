import type {Meta, StoryObj} from '@storybook/react'
import {css, html} from 'react-strict-dom'
import {Icon} from './Icon'
import type {IconName} from './Icon'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  argTypes: {
    size: {control: 'select', options: ['sm', 'md', 'lg', 'xl', 'xxl']},
  },
}

export default meta
type Story = StoryObj<typeof Icon>

// The groups of the IconName union, in its order.
const groups: ReadonlyArray<{title: string; names: readonly IconName[]}> = [
  {
    title: 'Core',
    names: [
      'x-circle',
      'check-circle',
      'check-done',
      'clock',
      'forbidden',
      'info-circle',
      'alert-triangle',
      'shield',
      'lock',
      'key',
    ],
  },
  {
    title: 'Navigation / wayfinding',
    names: [
      'map',
      'layers',
      'repeat',
      'database',
      'shield-check',
      'route',
      'git-branch',
      'menu',
      'pin',
    ],
  },
  {
    title: 'Infrastructure / inventory',
    names: ['server', 'hard-drive', 'box', 'image', 'tag', 'pie-chart'],
  },
  {title: 'People / access / admin', names: ['users', 'user-plus', 'mail', 'file-text', 'plug']},
  {title: 'Input / action', names: ['search', 'mic']},
  {title: 'Color mode', names: ['sun', 'moon', 'monitor', 'contrast']},
  {title: 'Device status', names: ['signal', 'battery']},
  {title: 'Media', names: ['video', 'music', 'play', 'pause']},
  {
    title: 'Filled variants',
    names: [
      'info-circle-filled',
      'alert-triangle-filled',
      'check-circle-filled',
      'x-circle-filled',
      'shield-filled',
      'lock-filled',
    ],
  },
]

const styles = css.create({
  page: {display: 'flex', flexDirection: 'column', gap: spacing.xl, color: colors.text},
  heading: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
    color: colors.textMuted,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${sizes.gridColSm}, 1fr))`,
    gap: spacing.lg,
  },
  cell: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.sm},
  label: {fontSize: typography.fontSizeSm, color: colors.textMuted},
})

export const Default: Story = {
  args: {name: 'signal', size: 'lg'},
}

export const AllIcons: Story = {
  render: () => (
    <html.div style={styles.page}>
      {groups.map((group) => (
        <html.section key={group.title}>
          <html.h3 style={styles.heading}>{group.title}</html.h3>
          <html.div style={styles.grid}>
            {group.names.map((name) => (
              <html.div key={name} style={styles.cell}>
                <Icon name={name} size="lg" />
                <html.span style={styles.label}>{name}</html.span>
              </html.div>
            ))}
          </html.div>
        </html.section>
      ))}
    </html.div>
  ),
}
