import {css} from 'react-strict-dom'

export const typography = css.defineVars({
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  fontFamilyMono:
    '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", "Courier New", monospace',
  fontSizeXs: '0.75rem',
  fontSizeSm: '0.875rem',
  fontSizeMd: '1rem',
  fontSizeLg: '1.125rem',
  fontSizeXl: '1.25rem',
  fontSizeHeading: '1.5rem',
  fontWeightNormal: '400',
  fontWeightMedium: '500',
  fontWeightSemibold: '600',
  fontWeightBold: '700',
  lineHeight: '1.5',
})

export const typeScale = css.defineVars({
  // 9-step font size scale
  fontSize1: '0.75rem',    // 12px — captions, badges
  fontSize2: '0.8125rem',  // 13px — small UI
  fontSize3: '0.875rem',   // 14px — default UI (buttons, inputs)
  fontSize4: '1rem',       // 16px — body text
  fontSize5: '1.125rem',   // 18px — body-lg
  fontSize6: '1.25rem',    // 20px — subheading
  fontSize7: '1.5rem',     // 24px — heading-sm
  fontSize8: '1.875rem',   // 30px — heading-md
  fontSize9: '2.25rem',    // 36px — heading-lg

  // Matched line-heights
  lineHeight1: '1rem',     // 16px
  lineHeight2: '1.25rem',  // 20px
  lineHeight3: '1.25rem',  // 20px
  lineHeight4: '1.5rem',   // 24px
  lineHeight5: '1.5rem',   // 24px
  lineHeight6: '1.75rem',  // 28px
  lineHeight7: '2rem',     // 32px
  lineHeight8: '2.25rem',  // 36px
  lineHeight9: '2.75rem',  // 44px

  // Fluid display sizes
  displaySm: 'clamp(2.25rem, 1.5rem + 2vw, 3rem)',      // 36–48px
  displayMd: 'clamp(2.75rem, 1.75rem + 2.5vw, 3.75rem)', // 44–60px
  displayLg: 'clamp(3.5rem, 2rem + 3.5vw, 4.5rem)',      // 56–72px

  // Letter-spacing
  letterSpacingTight: '-0.02em',
  letterSpacingNormal: '0',
  letterSpacingWide: '0.04em',
})
