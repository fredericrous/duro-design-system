import { css } from "react-strict-dom"
import { colors } from "../../tokens/colors.css"
import { radii, spacing } from "../../tokens/spacing.css"
import { typography } from "../../tokens/typography.css"
import { shadows } from "../../tokens/shadows.css"

export const styles = css.create({
  root: {
    position: "relative",
    display: "inline-flex",
  },
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.text,
    backgroundColor: {
      default: "transparent",
      ":hover": colors.bgCardHover,
    },
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: radii.sm,
    cursor: "pointer",
    transitionProperty: "background-color, border-color",
    transitionDuration: "150ms",
  },
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 49,
  },
  popup: {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: spacing.xs,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: radii.sm,
    boxShadow: shadows.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    minWidth: 160,
    zIndex: 50,
  },
  item: {
    display: "flex",
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontSize: typography.fontSizeSm,
    fontFamily: typography.fontFamily,
    color: colors.text,
    borderRadius: radii.sm,
    cursor: "pointer",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.bgCardHover,
    },
    transitionProperty: "background-color",
    transitionDuration: "150ms",
  },
  linkItem: {
    textDecoration: "none",
    color: {
      default: colors.text,
      ":hover": colors.text,
    },
  },
})
