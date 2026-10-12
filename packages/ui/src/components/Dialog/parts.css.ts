import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration} from '@duro-app/tokens/tokens/motion.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

/** Styles of the Dialog parts both platforms draw (no animations: native has none). */
export const partStyles = css.create({
  // --- Sizes ---
  sm: {maxWidth: sizes.dialogSm},
  md: {maxWidth: sizes.dialogMd},
  lg: {maxWidth: sizes.dialogLg},

  // --- Header ---
  header: {
    // Header, Description and Footer keep their size; only the Body yields.
    flexShrink: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },

  // --- Title ---
  title: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeight,
    color: colors.text,
    margin: 0,
  },

  // --- Description ---
  description: {
    flexShrink: 0,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
    color: colors.textMuted,
    margin: 0,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.md,
  },

  // --- Body ---
  body: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.lg,
    overflowY: 'auto',
    flex: 1,
  },

  // --- Footer ---
  footer: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: borders.hairline,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },

  // --- Close button ---
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizes.iconButton,
    height: sizes.iconButton,
    borderRadius: radii.sm,
    borderWidth: 0,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    color: colors.textMuted,
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
    transitionProperty: 'background-color',
    transitionDuration: duration.fast,
  },

  // --- Inline wrapper (for Trigger / Close children) ---
  inlineWrapper: {
    display: 'inline-flex',
  },
})
