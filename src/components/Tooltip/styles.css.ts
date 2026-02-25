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
  popup: {
    position: "absolute",
    zIndex: 50,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    backgroundColor: colors.bgCard,
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeight,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    boxShadow: shadows.md,
    whiteSpace: "nowrap",
    pointerEvents: "none",
  },
  top: {
    bottom: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    marginBottom: spacing.xs,
  },
  bottom: {
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    marginTop: spacing.xs,
  },
  left: {
    right: "100%",
    top: "50%",
    transform: "translateY(-50%)",
    marginRight: spacing.xs,
  },
  right: {
    left: "100%",
    top: "50%",
    transform: "translateY(-50%)",
    marginLeft: spacing.xs,
  },
})
