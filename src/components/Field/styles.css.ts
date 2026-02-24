import { css } from "react-strict-dom";
import { colors } from "../../tokens/colors.css";
import { spacing } from "../../tokens/spacing.css";
import { typography } from "../../tokens/typography.css";

export const styles = css.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSizeXs,
    color: colors.textMuted,
  },
  error: {
    fontSize: typography.fontSizeXs,
    color: colors.error,
  },
});
