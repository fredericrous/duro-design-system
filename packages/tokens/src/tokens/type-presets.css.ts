import {css} from 'react-strict-dom'
import {typography, typeScale} from './typography.css'

export const typePresets = css.create({
  // Body
  bodySm: {
    fontFamily: typography.fontFamily,
    fontSize: typeScale.fontSize3,
    lineHeight: typeScale.lineHeight3,
    fontWeight: typography.fontWeightNormal,
    letterSpacing: typeScale.letterSpacingNormal,
  },
  bodyMd: {
    fontFamily: typography.fontFamily,
    fontSize: typeScale.fontSize4,
    lineHeight: typeScale.lineHeight4,
    fontWeight: typography.fontWeightNormal,
    letterSpacing: typeScale.letterSpacingNormal,
  },
  bodyLg: {
    fontFamily: typography.fontFamily,
    fontSize: typeScale.fontSize5,
    lineHeight: typeScale.lineHeight5,
    fontWeight: typography.fontWeightNormal,
    letterSpacing: typeScale.letterSpacingNormal,
  },

  // UI
  caption: {
    fontFamily: typography.fontFamily,
    fontSize: typeScale.fontSize1,
    lineHeight: typeScale.lineHeight1,
    fontWeight: typography.fontWeightNormal,
    letterSpacing: typeScale.letterSpacingWide,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typeScale.fontSize3,
    lineHeight: typeScale.lineHeight3,
    fontWeight: typography.fontWeightMedium,
    letterSpacing: typeScale.letterSpacingNormal,
  },
  code: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typeScale.fontSize3,
    lineHeight: typeScale.lineHeight3,
    fontWeight: typography.fontWeightNormal,
    letterSpacing: typeScale.letterSpacingNormal,
  },
  overline: {
    fontFamily: typography.fontFamily,
    fontSize: typeScale.fontSize1,
    lineHeight: typeScale.lineHeight1,
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: typeScale.letterSpacingWide,
    textTransform: 'uppercase' as const,
  },

  // Heading
  headingSm: {
    fontFamily: typography.fontFamily,
    fontSize: typeScale.fontSize6,
    lineHeight: typeScale.lineHeight6,
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: typeScale.letterSpacingTight,
  },
  headingMd: {
    fontFamily: typography.fontFamily,
    fontSize: typeScale.fontSize7,
    lineHeight: typeScale.lineHeight7,
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: typeScale.letterSpacingTight,
  },
  headingLg: {
    fontFamily: typography.fontFamily,
    fontSize: typeScale.fontSize8,
    lineHeight: typeScale.lineHeight8,
    fontWeight: typography.fontWeightBold,
    letterSpacing: typeScale.letterSpacingTight,
  },
  headingXl: {
    fontFamily: typography.fontFamily,
    fontSize: typeScale.fontSize9,
    lineHeight: typeScale.lineHeight9,
    fontWeight: typography.fontWeightBold,
    letterSpacing: typeScale.letterSpacingTight,
  },

  // Display (fluid)
  displaySm: {
    fontFamily: typography.fontFamily,
    fontSize: typeScale.displaySm,
    lineHeight: 1.2,
    fontWeight: typography.fontWeightBold,
    letterSpacing: typeScale.letterSpacingTight,
  },
  displayMd: {
    fontFamily: typography.fontFamily,
    fontSize: typeScale.displayMd,
    lineHeight: 1.15,
    fontWeight: typography.fontWeightBold,
    letterSpacing: typeScale.letterSpacingTight,
  },
  displayLg: {
    fontFamily: typography.fontFamily,
    fontSize: typeScale.displayLg,
    lineHeight: 1.1,
    fontWeight: typography.fontWeightBold,
    letterSpacing: typeScale.letterSpacingTight,
  },
})
