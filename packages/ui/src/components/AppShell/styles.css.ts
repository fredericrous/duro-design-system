import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {breakpoints} from '@duro-app/tokens/tokens/breakpoints.css'

// At and above sm (measured on the shell's own width, not the window) the
// rail sits beside the page; below it the rail gives way to the Menu button
// and its Drawer. CSS makes the switch, so the server's HTML is the same at
// every width and the first paint is already right.
const WIDE = `@container (min-width: ${breakpoints.sm})`

export const styles = css.create({
  // Hosts the container query: a container cannot query itself.
  container: {
    containerType: 'inline-size',
    minWidth: 0,
  },
  // The page canvas of the app, in the theme.
  grid: {
    display: 'grid',
    minHeight: '100dvh',
    color: colors.text,
    backgroundColor: colors.bg,
    gridTemplateColumns: {
      default: 'minmax(0, 1fr)',
      [WIDE]: `${sizes.sidebarW} minmax(0, 1fr)`,
    },
    gridTemplateRows: 'auto 1fr',
    gridTemplateAreas: {
      default: '"header" "main"',
      [WIDE]: '"rail header" "rail main"',
    },
  },
  // The rail scrolls on its own beside the page.
  rail: {
    display: {
      default: 'none',
      [WIDE]: 'block',
    },
    gridArea: 'rail',
    alignSelf: 'start',
    position: 'sticky',
    top: 0,
    height: '100dvh',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    backgroundColor: colors.bgCard,
    borderRightWidth: borders.hairline,
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
  },
  header: {
    gridArea: 'header',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
    paddingTop: spacing.ms,
    paddingBottom: spacing.ms,
    paddingLeft: {default: spacing.md, [WIDE]: spacing.lg},
    paddingRight: {default: spacing.md, [WIDE]: spacing.lg},
    backgroundColor: colors.bgCard,
    borderBottomWidth: borders.hairline,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  menu: {
    display: {
      default: 'block',
      [WIDE]: 'none',
    },
  },
  main: {
    gridArea: 'main',
    minWidth: 0,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingLeft: {default: spacing.md, [WIDE]: spacing.lg},
    paddingRight: {default: spacing.md, [WIDE]: spacing.lg},
  },
})
