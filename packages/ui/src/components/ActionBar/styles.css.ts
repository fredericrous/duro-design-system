import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'

export const styles = css.create({
  overlay: {
    position: 'fixed',
    bottom: spacing.lg,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.md,
    boxShadow: shadows.lg,
    zIndex: 50,
  },
  // Centred on the window: the default, with nothing docked at its edge.
  centered: {
    left: '50%',
    transform: 'translateX(-50%)',
    maxWidth: 'calc(100vw - 48px)',
  },
  // Centred in the window minus chrome docked at the inline-end edge (a
  // DetailPanel). Both insets and auto margins centre a fixed box of
  // fit-content width in what is left, measured on the containing block
  // (the window without a classic scrollbar), not on 100vw.
  inset: (end: number) => ({
    insetInlineStart: 0,
    insetInlineEnd: end,
    marginInlineStart: 'auto',
    marginInlineEnd: 'auto',
    width: 'fit-content',
    maxWidth: `calc(100% - ${end}px - 48px)`,
  }),
  overlayOffset: (bottom: number) => ({
    bottom,
  }),
  overlayEmphasized: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  selectedCount: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    fontFamily: typography.fontFamily,
    color: colors.text,
    whiteSpace: 'nowrap',
  },
  selectedCountEmphasized: {
    color: colors.accentContrast,
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  // Beside a docked panel the room is narrower: more actions than fit scroll
  // instead of spilling past the bar. A scroll box clips vertically too, so
  // the row gets room on every side for the buttons' focus rings, taken back
  // by its margin so the bar keeps its size.
  actionsScroll: {
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    marginTop: `calc(-1 * ${spacing.xs})`,
    marginBottom: `calc(-1 * ${spacing.xs})`,
    marginLeft: `calc(-1 * ${spacing.xs})`,
    marginRight: `calc(-1 * ${spacing.xs})`,
  },
  closeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: radii.sm,
    color: {
      default: colors.textMuted,
      ':hover': colors.text,
    },
    cursor: 'pointer',
    transitionProperty: 'color, background-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
    outlineWidth: {
      default: 0,
      ':focus-visible': 2,
    },
    outlineStyle: {
      default: 'none',
      ':focus-visible': 'solid',
    },
    outlineColor: {
      default: 'transparent',
      ':focus-visible': colors.accent,
    },
    outlineOffset: {
      default: 0,
      ':focus-visible': 2,
    },
  },
  closeButtonEmphasized: {
    color: {
      default: colors.accentContrast,
      ':hover': colors.accentContrast,
    },
    opacity: {
      default: 0.7,
      ':hover': 1,
    },
  },
  separator: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  separatorEmphasized: {
    backgroundColor: colors.accentContrast,
    opacity: 0.3,
  },
})
