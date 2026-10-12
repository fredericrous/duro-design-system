import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

/**
 * The native AppShell: a phone is below every `collapseBelow`, so it is
 * always the narrow shape — the bar on top, Main below, the rail in a Drawer.
 */
export const nativeStyles = css.create({
  shell: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    color: colors.text,
    backgroundColor: colors.bg,
  },
  bar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.appBarH,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    backgroundColor: colors.bgCard,
    borderBottomWidth: borders.hairline,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  // The bar sits below the status bar: the top safe-area inset is its padding.
  barTop: (top: number) => ({paddingTop: top}),
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexGrow: 1,
    flexShrink: 1,
  },
  main: {
    flexGrow: 1,
    flexShrink: 1,
    paddingTop: spacing.lg,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },
  drawerFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: borders.hairline,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
})
