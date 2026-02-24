import { css } from "react-strict-dom";
import { colors } from "../../tokens/colors.css";
import { radii, spacing } from "../../tokens/spacing.css";
import { typography } from "../../tokens/typography.css";
import { shadows } from "../../tokens/shadows.css";

export const styles = css.create({
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.text,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: radii.sm,
    cursor: "pointer",
    transitionProperty: "border-color",
    transitionDuration: "150ms",
  },
  icon: {
    fontSize: typography.fontSizeXs,
    color: colors.textMuted,
  },
  popup: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: radii.sm,
    boxShadow: shadows.md,
    padding: spacing.xs,
    minWidth: 120,
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
    color: colors.text,
    borderRadius: radii.sm,
    cursor: "pointer",
    transitionProperty: "background-color",
    transitionDuration: "150ms",
  },
  itemHighlighted: {
    backgroundColor: colors.bgCardHover,
  },
  itemSelected: {
    color: colors.accent,
    fontWeight: typography.fontWeightMedium,
  },
});
