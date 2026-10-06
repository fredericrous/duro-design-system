import {RuleTester} from '@typescript-eslint/rule-tester'
import {noRawDesignValues} from '../src/rules/no-raw-design-values.js'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {ecmaVersion: 2022, sourceType: 'module'},
  },
})

const wrap = (body: string) => `css.create({s: {${body}}})`

tester.run('no-raw-design-values', noRawDesignValues, {
  valid: [
    wrap('padding: spacing.md'),
    // Off the property allowlist — same numbers, different meaning
    wrap('top: 8, zIndex: 16, lineHeight: 1.5'),
    // No token equivalent: zero, negatives, shorthands
    wrap("padding: 0, margin: -8, gap: '8px 16px', transition: 'opacity 150ms'"),
    wrap('color: colors.text, fontSize: typography.fontSizeMd, boxShadow: shadows.sm'),
    // A font size off both scales, a bold keyword, no shadow
    wrap("fontSize: 11, fontWeight: 'bold', boxShadow: 'none'"),
    // Not a css.create argument
    'const styles = {s: {padding: 16}}',
    // Sizes and border widths: exemptions and tokens
    wrap("width: 0, minWidth: '0', height: '0px', width: '100%', maxHeight: '85vh'"),
    wrap(
      "width: 'auto', height: 'fit-content', flexBasis: '10rem', maxWidth: '60ch', width: '2em'",
    ),
    wrap('width: sizes.touchTarget, borderWidth: borders.hairline, outlineOffset: -0'),
    wrap('width: `calc(100% - ${spacing.md})`'),
    wrap("width: 'calc(100% - 2rem)'"),
    wrap('outlineOffset: `calc(-1 * ${borders.focusOffset})`'),
    wrap('border: `${borders.hairline} solid ${colors.border}`'),
    wrap("border: 'none', outline: 0, borderTop: 'inherit'"),
    {
      code: wrap('width: 1'),
      filename: 'packages/ui/src/styles/visually-hidden.css.ts',
      options: [{exemptFiles: ['packages/ui/src/styles/visually-hidden.css.ts']}],
    },
    {
      code: wrap('width: 1'),
      filename: '/repo/packages/ui/src/styles/a.css.ts',
      options: [{exemptFiles: ['**/styles/*.css.{ts,tsx}']}],
    },
    wrap("gridTemplateColumns: 'minmax(0, 2fr) 1fr'"),
    wrap('gridTemplateColumns: `minmax(${sizes.gridColSm}, 1fr) minmax(0, 2fr)`'),
    wrap("gridTemplateColumns: 'repeat(auto-fill, minmax(20%, 1fr))', gridAutoRows: 'auto'"),
    // Breakpoint already read from the const
    'css.create({s: {[`@media (min-width: ${breakpoints.md})`]: {padding: spacing.xl}}})',
  ],
  invalid: [
    {
      code: wrap("gridTemplateColumns: 'minmax(240px, 1fr) minmax(0, 2fr)'"),
      errors: [{messageId: 'rawTrack'}],
    },
    {
      code: wrap(
        "gridTemplateColumns: {default: '1fr', '@media (prefers-reduced-motion: reduce)': 'minmax(280px, 1fr)'}",
      ),
      errors: [{messageId: 'rawTrack'}],
    },
    {
      code: wrap('gridAutoRows: `minmax(${sizes.controlSm}, 44px)`'),
      errors: [{messageId: 'rawTrack'}],
    },
    {
      code: wrap('width: 44'),
      errors: [
        {
          messageId: 'ambiguousMeasure',
          data: {
            value: '44',
            property: 'width',
            group: 'sizes',
            tokens: 'sizes.touchTarget, sizes.swatchW',
            pkg: '@duro-app/tokens',
          },
          suggestions: [],
        },
      ],
    },
    {
      code: wrap("minHeight: '28px'"),
      errors: [
        {
          messageId: 'ambiguousMeasure',
          data: {
            value: "'28px'",
            property: 'minHeight',
            group: 'sizes',
            tokens: 'sizes.controlSm, sizes.iconButtonSm',
            pkg: '@duro-app/tokens',
          },
          suggestions: [],
        },
      ],
    },
    {
      code: wrap('width: 16'),
      errors: [{messageId: 'ambiguousMeasure', suggestions: []}],
    },
    {
      code: wrap('maxWidth: 520'),
      errors: [
        {
          messageId: 'rawMeasure',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {sizes} from '@duro-app/tokens/tokens/sizes.css'\n" +
                wrap('maxWidth: sizes.dialogMd'),
            },
          ],
        },
      ],
    },
    {
      // 1 is sizes.divider; EMAIL_PX.trackingPixel is never a candidate
      code: wrap('width: 1'),
      errors: [
        {
          messageId: 'rawMeasure',
          data: {
            value: '1',
            property: 'width',
            group: 'sizes',
            tokens: 'sizes.divider',
            pkg: '@duro-app/tokens',
          },
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {sizes} from '@duro-app/tokens/tokens/sizes.css'\n" +
                wrap('width: sizes.divider'),
            },
          ],
        },
      ],
    },
    {
      code: wrap('width: 7'),
      errors: [{messageId: 'missingMeasureToken', suggestions: []}],
    },
    {
      code: wrap('borderWidth: 2'),
      errors: [
        {
          messageId: 'rawMeasure',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {borders} from '@duro-app/tokens/tokens/borders.css'\n" +
                wrap('borderWidth: borders.strong'),
            },
          ],
        },
      ],
    },
    {
      code: wrap("borderTopWidth: '1px'"),
      errors: [
        {
          messageId: 'rawMeasure',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {borders} from '@duro-app/tokens/tokens/borders.css'\n" +
                wrap('borderTopWidth: borders.hairline'),
            },
          ],
        },
      ],
    },
    {
      code: wrap('outlineWidth: 2'),
      errors: [
        {
          messageId: 'rawMeasure',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {borders} from '@duro-app/tokens/tokens/borders.css'\n" +
                wrap('outlineWidth: borders.focusRing'),
            },
          ],
        },
      ],
    },
    {
      code: wrap('outlineOffset: 2'),
      errors: [
        {
          messageId: 'rawMeasure',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {borders} from '@duro-app/tokens/tokens/borders.css'\n" +
                wrap('outlineOffset: borders.focusOffset'),
            },
          ],
        },
      ],
    },
    {
      code: wrap('outlineOffset: -2'),
      errors: [
        {
          messageId: 'rawMeasure',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {borders} from '@duro-app/tokens/tokens/borders.css'\n" +
                wrap('outlineOffset: `calc(-1 * ${borders.focusOffset})`'),
            },
          ],
        },
      ],
    },
    {
      code: wrap("outlineOffset: '-1px'"),
      errors: [
        {
          messageId: 'rawMeasure',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {borders} from '@duro-app/tokens/tokens/borders.css'\n" +
                wrap('outlineOffset: `calc(-1 * ${borders.focusOffsetSm})`'),
            },
          ],
        },
      ],
    },
    {
      code: wrap('marginLeft: -8, width: -44'),
      errors: [{messageId: 'ambiguousMeasure', suggestions: []}],
    },
    {
      code: wrap("border: '1px solid red'"),
      errors: [{messageId: 'rawMeasure', suggestions: []}],
    },
    {
      code: wrap("outline: '3px solid rgba(1, 2, 3, 0.5)'"),
      errors: [
        {messageId: 'rawColor', suggestions: []},
        {messageId: 'missingMeasureToken', suggestions: []},
      ],
    },
    {
      code: wrap("width: 'calc(100% - 8px)'"),
      errors: [{messageId: 'missingMeasureToken', suggestions: []}],
    },
    {
      code: wrap('width: `calc(100% - ${spacing.md} - 8px)`'),
      errors: [{messageId: 'missingMeasureToken', suggestions: []}],
    },
    {
      // The same 1px outside the exempt module is reported
      code: wrap('width: 1'),
      filename: 'packages/ui/src/styles/x.css.ts',
      options: [{exemptFiles: ['packages/ui/src/styles/visually-hidden.css.ts']}],
      errors: [
        {
          messageId: 'rawMeasure',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {sizes} from '@duro-app/tokens/tokens/sizes.css'\n" +
                wrap('width: sizes.divider'),
            },
          ],
        },
      ],
    },
    {
      code: wrap('gap: 24'),
      errors: [
        {
          messageId: 'rawSpacing',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {spacing} from '@duro-app/tokens/tokens/spacing.css'\n" +
                wrap('gap: spacing.lg'),
            },
          ],
        },
      ],
    },
    {
      code: wrap("padding: '8px'"),
      errors: [
        {
          messageId: 'rawSpacing',
          data: {value: "'8px'", property: 'padding', token: 'sm', pkg: '@duro-app/tokens'},
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {spacing} from '@duro-app/tokens/tokens/spacing.css'\n" +
                wrap('padding: spacing.sm'),
            },
          ],
        },
      ],
    },
    {
      code: wrap('borderRadius: 8'),
      errors: [
        {
          messageId: 'rawRadius',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {radii} from '@duro-app/tokens/tokens/spacing.css'\n" +
                wrap('borderRadius: radii.sm'),
            },
          ],
        },
      ],
    },
    {
      code: wrap("color: '#333333'"),
      errors: [
        {
          messageId: 'rawColorToken',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {colors} from '@duro-app/tokens/tokens/colors.css'\n" +
                wrap('color: colors.border'),
            },
          ],
        },
      ],
    },
    {
      // Off-palette hex: reported, no suggestion
      code: wrap("color: '#e67e22'"),
      errors: [{messageId: 'rawColor', suggestions: []}],
    },
    {
      // Hex inside a compound value: reported, no replacement suggestion
      code: wrap("boxShadow: '0 1px 2px #333333'"),
      errors: [
        {messageId: 'rawShadow', suggestions: []},
        {messageId: 'rawColorToken', suggestions: []},
      ],
    },
    {
      // Condition keys keep the enclosing property
      code: wrap("color: {default: '#e5e5e5', ':hover': '#242424'}"),
      errors: [
        {
          messageId: 'rawColorToken',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {colors} from '@duro-app/tokens/tokens/colors.css'\n" +
                wrap("color: {default: colors.text, ':hover': '#242424'}"),
            },
          ],
        },
        {
          messageId: 'rawColorToken',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {colors} from '@duro-app/tokens/tokens/colors.css'\n" +
                wrap("color: {default: '#e5e5e5', ':hover': colors.bgCardHover}"),
            },
          ],
        },
      ],
    },
    {
      code: wrap("'@media (min-width: 768px)': {padding: 32}"),
      errors: [
        {
          messageId: 'rawBreakpoint',
          data: {
            value: '768',
            key: '@media (min-width: 768px)',
            token: 'md',
            scale: '480 / 640 / 768 / 1024 / 1280',
            pkg: '@duro-app/tokens',
          },
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {breakpoints} from '@duro-app/tokens/tokens/breakpoints.css'\n" +
                wrap('[`@media (min-width: ${breakpoints.md})`]: {padding: 32}'),
            },
          ],
        },
        {
          messageId: 'rawSpacing',
          data: {value: '32', property: 'padding', token: 'xl', pkg: '@duro-app/tokens'},
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {spacing} from '@duro-app/tokens/tokens/spacing.css'\n" +
                wrap("'@media (min-width: 768px)': {padding: spacing.xl}"),
            },
          ],
        },
      ],
    },
    {
      // Dynamic style functions are walked too
      code: 'css.create({x: (o) => ({marginTop: 16})})',
      errors: [
        {
          messageId: 'rawSpacing',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {spacing} from '@duro-app/tokens/tokens/spacing.css'\n" +
                'css.create({x: (o) => ({marginTop: spacing.md})})',
            },
          ],
        },
      ],
    },
    {
      // An off-scale nudge that IS a micro-spacing token: suggest it
      code: wrap('paddingTop: 2'),
      errors: [
        {
          messageId: 'rawMicroSpacing',
          data: {value: '2', property: 'paddingTop', token: 'px2', pkg: '@duro-app/tokens'},
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {microSpacing} from '@duro-app/tokens/tokens/spacing.css'\n" +
                wrap('paddingTop: microSpacing.px2'),
            },
          ],
        },
      ],
    },
    {
      // Off the scale on a tokenised property: reported, no suggestion
      code: wrap('marginTop: 23, borderRadius: 10'),
      errors: [
        {
          messageId: 'offScaleSpacing',
          data: {
            value: '23',
            property: 'marginTop',
            scale: '4 / 8 / 12 / 16 / 24 / 32 / 48 / 64',
            pkg: '@duro-app/tokens',
          },
          suggestions: [],
        },
        {messageId: 'offScaleRadius', suggestions: []},
      ],
    },
    {
      // Off-scale breakpoint: reported, no suggestion
      code: wrap("'@media (min-width: 800px)': {gap: spacing.md}"),
      errors: [{messageId: 'rawBreakpoint', suggestions: []}],
    },
    {
      // Computed key stays computed
      code: wrap("['@media (max-width: 640px)']: {gap: spacing.md}"),
      errors: [
        {
          messageId: 'rawBreakpoint',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {breakpoints} from '@duro-app/tokens/tokens/breakpoints.css'\n" +
                wrap('[`@media (max-width: ${breakpoints.sm})`]: {gap: spacing.md}'),
            },
          ],
        },
      ],
    },
    {
      // Font sizes: px number, px string and rem all map; typography wins over typeScale
      code: wrap('fontSize: 16, lineHeight: 1.5'),
      errors: [
        {
          messageId: 'rawFontSize',
          data: {value: '16', group: 'typography', token: 'fontSizeMd', pkg: '@duro-app/tokens'},
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {typography} from '@duro-app/tokens/tokens/typography.css'\n" +
                wrap('fontSize: typography.fontSizeMd, lineHeight: 1.5'),
            },
          ],
        },
      ],
    },
    {
      code: wrap("fontSize: '0.8125rem'"),
      errors: [
        {
          messageId: 'rawFontSize',
          data: {
            value: "'0.8125rem'",
            group: 'typeScale',
            token: 'fontSize2',
            pkg: '@duro-app/tokens',
          },
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {typeScale} from '@duro-app/tokens/tokens/typography.css'\n" +
                wrap('fontSize: typeScale.fontSize2'),
            },
          ],
        },
      ],
    },
    {
      code: wrap("fontWeight: 600, fontSize: '14px'"),
      errors: [
        {
          messageId: 'rawFontWeight',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {typography} from '@duro-app/tokens/tokens/typography.css'\n" +
                wrap("fontWeight: typography.fontWeightSemibold, fontSize: '14px'"),
            },
          ],
        },
        {
          messageId: 'rawFontSize',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {typography} from '@duro-app/tokens/tokens/typography.css'\n" +
                wrap('fontWeight: 600, fontSize: typography.fontSizeSm'),
            },
          ],
        },
      ],
    },
    {
      // Shadow: exact palette value suggests; anything else reports
      code: wrap("boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'"),
      errors: [
        {
          messageId: 'rawShadow',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {shadows} from '@duro-app/tokens/tokens/shadows.css'\n" +
                wrap('boxShadow: shadows.sm'),
            },
          ],
        },
      ],
    },
    {
      code: wrap("boxShadow: '0 0 0 2px #6aaffc'"),
      errors: [
        {messageId: 'rawShadow', suggestions: []},
        {messageId: 'rawColorToken', suggestions: []},
      ],
    },
    {
      // Motion
      code: wrap(
        "transitionDuration: '150ms', transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)'",
      ),
      errors: [
        {
          messageId: 'rawDuration',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {duration} from '@duro-app/tokens/tokens/motion.css'\n" +
                wrap(
                  "transitionDuration: duration.fast, transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)'",
                ),
            },
          ],
        },
        {
          messageId: 'rawEasing',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {easing} from '@duro-app/tokens/tokens/motion.css'\n" +
                wrap("transitionDuration: '150ms', transitionTimingFunction: easing.easeOut"),
            },
          ],
        },
      ],
    },
    {
      code: wrap("animationDuration: '175ms'"),
      errors: [{messageId: 'rawDuration', suggestions: []}],
    },
    {
      // rgba() literals are colors too; a palette one suggests its token
      code: wrap("backgroundColor: 'rgba(248, 113, 113, 0.1)', color: 'rgb(1, 2, 3)'"),
      errors: [
        {
          messageId: 'rawColorToken',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                "import {colors} from '@duro-app/tokens/tokens/colors.css'\n" +
                wrap("backgroundColor: colors.errorBg, color: 'rgb(1, 2, 3)'"),
            },
          ],
        },
        {messageId: 'rawColor', suggestions: []},
      ],
    },
  ],
})
