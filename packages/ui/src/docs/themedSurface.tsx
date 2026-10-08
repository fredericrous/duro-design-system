import type {Decorator} from '@storybook/react'
import {css, html} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

const styles = css.create({
  surface: {
    padding: spacing.md,
    backgroundColor: colors.bg,
    color: colors.text,
  },
})

/**
 * Paints the theme's page background behind a story. The vitest browser frame
 * has a white page whatever the theme, so axe would measure the dark theme's
 * text against white; on this surface `color-contrast` checks the real pair.
 */
export const onThemeSurface: Decorator = (Story) => (
  <html.div style={styles.surface}>
    <Story />
  </html.div>
)
