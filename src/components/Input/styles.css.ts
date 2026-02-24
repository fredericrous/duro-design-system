import { css } from "react-strict-dom";
import { colors } from "../../tokens/colors.css";
import { radii, spacing } from "../../tokens/spacing.css";
import { typography } from "../../tokens/typography.css";

export const styles = css.create({
  base: {
    width: "100%",
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
    color: colors.text,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: radii.sm,
    transitionProperty: "border-color",
    transitionDuration: "150ms",
    transitionTimingFunction: "ease",
    outlineWidth: {
      default: 0,
      ":focus-visible": 2,
    },
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineColor: {
      default: "transparent",
      ":focus-visible": colors.accent,
    },
    outlineOffset: {
      default: 0,
      ":focus-visible": 1,
    },
  },
  default: {
    borderColor: {
      default: colors.border,
      ":hover": colors.textMuted,
      ":focus": colors.accent,
    },
  },
  error: {
    borderColor: {
      default: colors.error,
      ":focus": colors.error,
    },
  },
});
