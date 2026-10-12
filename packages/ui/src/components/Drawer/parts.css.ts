import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration} from '@duro-app/tokens/tokens/motion.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

/** Styles of the Drawer parts both platforms draw (no animations: native has none). */
export const partStyles = css.create({
  // --- Grabber (snap sheets) ---
  grabberHit: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    flexShrink: 0,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  grabber: {
    display: 'block',
    width: sizes.sheetGrabberW,
    height: sizes.sheetGrabberH,
    borderRadius: radii.full,
    backgroundColor: colors.border,
  },

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

  // Under a snap sheet's grabber the header needs no top padding of its own.
  headerUnderGrabber: {
    paddingTop: 0,
  },

  // Title centred, the other children at the end (Header titleAlign="center").
  headerCentered: {
    alignItems: 'center',
  },

  headerSide: {
    display: 'flex',
    flexGrow: 1,
    flexBasis: 0,
  },

  headerEnd: {
    justifyContent: 'flex-end',
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
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
    color: colors.textMuted,
    margin: 0,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.md,
  },

  // --- Footer ---
  footer: {
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

  // --- Inline wrapper ---
  inlineWrapper: {
    display: 'inline-flex',
  },
})
