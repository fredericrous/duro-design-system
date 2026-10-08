import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {layers} from '@duro-app/tokens/tokens/layers.css'
import {breakpoints} from '@duro-app/tokens/tokens/breakpoints.css'

// At and above the collapse point (measured on the shell's own width, not
// the window) the rail sits beside the page and the Header is a row that
// scrolls with it; below it the rail gives way to one sticky bar — the Menu
// button, the brand and the Header's content — and its Drawer. CSS makes the
// switch, so the server's HTML is the same at every width and the first
// paint is already right.
//
// `collapseBelow` picks one of three static sets (sm, md, lg): StyleX needs
// every query written out, so each breakpoint-dependent style comes three
// times, identical but for the query.
const WIDE_SM = `@container (min-width: ${breakpoints.sm})`
const WIDE_MD = `@container (min-width: ${breakpoints.md})`
const WIDE_LG = `@container (min-width: ${breakpoints.lg})`

// The custom property an Aside inside the shell adds to its sticky `top`
// (Aside/styles.css.ts spells the same name). It is set on the grid, inside
// the query container (a container query cannot style the container itself)
// and an ancestor of Main. Above the collapse point it is `initial` (unset),
// so the Aside's fallback 0px applies: StyleX would write a `0px` as a
// unitless 0, which makes the Aside's calc() invalid.
//   '--duro-app-shell-bar'

const RAIL_COLUMNS = `${sizes.sidebarW} minmax(0, 1fr)`
const NARROW_AREAS = '"bar" "main"'
const WIDE_AREAS = '"rail bar" "rail main"'

export const styles = css.create({
  // Hosts the container query: a container cannot query itself.
  container: {
    containerType: 'inline-size',
    position: 'relative',
    minWidth: 0,
  },
  // The page canvas of the app, in the theme.
  grid: {
    display: 'grid',
    minHeight: '100dvh',
    color: colors.text,
    backgroundColor: colors.bg,
    gridTemplateRows: 'auto 1fr',
  },
  gridSm: {
    gridTemplateColumns: {default: 'minmax(0, 1fr)', [WIDE_SM]: RAIL_COLUMNS},
    gridTemplateAreas: {default: NARROW_AREAS, [WIDE_SM]: WIDE_AREAS},
    '--duro-app-shell-bar': {default: sizes.appBarH, [WIDE_SM]: 'initial'},
  },
  gridMd: {
    gridTemplateColumns: {default: 'minmax(0, 1fr)', [WIDE_MD]: RAIL_COLUMNS},
    gridTemplateAreas: {default: NARROW_AREAS, [WIDE_MD]: WIDE_AREAS},
    '--duro-app-shell-bar': {default: sizes.appBarH, [WIDE_MD]: 'initial'},
  },
  gridLg: {
    gridTemplateColumns: {default: 'minmax(0, 1fr)', [WIDE_LG]: RAIL_COLUMNS},
    gridTemplateAreas: {default: NARROW_AREAS, [WIDE_LG]: WIDE_AREAS},
    '--duro-app-shell-bar': {default: sizes.appBarH, [WIDE_LG]: 'initial'},
  },

  // Holds the skip link, the first tab stop: off screen until the link
  // has focus.
  skip: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    zIndex: layers.floatingRaised,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.bgCard,
    transform: {default: 'translateY(-200%)', ':focus-within': 'none'},
    opacity: {default: 0, ':focus-within': 1},
  },

  // The rail scrolls on its own beside the page: the brand at the top, the
  // navigation in between, the footer at its foot.
  rail: {
    gridArea: 'rail',
    alignSelf: 'start',
    position: 'sticky',
    top: 0,
    height: '100dvh',
    flexDirection: 'column',
    minWidth: 0,
    backgroundColor: colors.bgCard,
    borderRightWidth: borders.hairline,
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
  },
  railSm: {display: {default: 'none', [WIDE_SM]: 'flex'}},
  railMd: {display: {default: 'none', [WIDE_MD]: 'flex'}},
  railLg: {display: {default: 'none', [WIDE_LG]: 'flex'}},
  railBrand: {
    flexShrink: 0,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },
  railBody: {
    flexGrow: 1,
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  },
  railFooter: {
    flexShrink: 0,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    borderTopWidth: borders.hairline,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  drawerFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: borders.hairline,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },

  // The bar: the banner. Below the collapse point it is sticky and exactly
  // appBarH tall, so the page never moves under it and an Aside can stick
  // right below it; above, it is the Header's row and scrolls with the page.
  bar: {
    gridArea: 'bar',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
    backgroundColor: colors.bgCard,
    borderBottomWidth: borders.hairline,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  barSm: {
    position: {default: 'sticky', [WIDE_SM]: 'static'},
    top: 0,
    zIndex: {default: layers.floating, [WIDE_SM]: 'auto'},
    height: {default: sizes.appBarH, [WIDE_SM]: 'auto'},
    paddingTop: {default: spacing.sm, [WIDE_SM]: spacing.ms},
    paddingBottom: {default: spacing.sm, [WIDE_SM]: spacing.ms},
    paddingLeft: {default: spacing.md, [WIDE_SM]: spacing.lg},
    paddingRight: {default: spacing.md, [WIDE_SM]: spacing.lg},
  },
  barMd: {
    position: {default: 'sticky', [WIDE_MD]: 'static'},
    top: 0,
    zIndex: {default: layers.floating, [WIDE_MD]: 'auto'},
    height: {default: sizes.appBarH, [WIDE_MD]: 'auto'},
    paddingTop: {default: spacing.sm, [WIDE_MD]: spacing.ms},
    paddingBottom: {default: spacing.sm, [WIDE_MD]: spacing.ms},
    paddingLeft: {default: spacing.md, [WIDE_MD]: spacing.lg},
    paddingRight: {default: spacing.md, [WIDE_MD]: spacing.lg},
  },
  barLg: {
    position: {default: 'sticky', [WIDE_LG]: 'static'},
    top: 0,
    zIndex: {default: layers.floating, [WIDE_LG]: 'auto'},
    height: {default: sizes.appBarH, [WIDE_LG]: 'auto'},
    paddingTop: {default: spacing.sm, [WIDE_LG]: spacing.ms},
    paddingBottom: {default: spacing.sm, [WIDE_LG]: spacing.ms},
    paddingLeft: {default: spacing.md, [WIDE_LG]: spacing.lg},
    paddingRight: {default: spacing.md, [WIDE_LG]: spacing.lg},
  },
  // Without a Header there is nothing to show above the collapse point.
  barEmptySm: {display: {default: 'flex', [WIDE_SM]: 'none'}},
  barEmptyMd: {display: {default: 'flex', [WIDE_MD]: 'none'}},
  barEmptyLg: {display: {default: 'flex', [WIDE_LG]: 'none'}},
  // The Menu button and the bar's copy of the brand: below the collapse
  // point only (display: none takes the hidden copy out of the a11y tree).
  narrowSm: {display: {default: 'flex', [WIDE_SM]: 'none'}},
  narrowMd: {display: {default: 'flex', [WIDE_MD]: 'none'}},
  narrowLg: {display: {default: 'flex', [WIDE_LG]: 'none'}},
  narrowItem: {
    flexShrink: 0,
    alignItems: 'center',
    minWidth: 0,
  },
  // The Header's content, after the Menu button and the brand.
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    flexGrow: 1,
    minWidth: 0,
  },

  main: {
    gridArea: 'main',
    minWidth: 0,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    // Focused by the skip link: no ring on a region that is not a control.
    outlineStyle: 'none',
  },
  mainSm: {
    paddingLeft: {default: spacing.md, [WIDE_SM]: spacing.lg},
    paddingRight: {default: spacing.md, [WIDE_SM]: spacing.lg},
  },
  mainMd: {
    paddingLeft: {default: spacing.md, [WIDE_MD]: spacing.lg},
    paddingRight: {default: spacing.md, [WIDE_MD]: spacing.lg},
  },
  mainLg: {
    paddingLeft: {default: spacing.md, [WIDE_LG]: spacing.lg},
    paddingRight: {default: spacing.md, [WIDE_LG]: spacing.lg},
  },
})
