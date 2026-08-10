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
    wrap('width: 16, fontSize: 16, top: 8, borderWidth: 1'),
    // No token equivalent
    wrap("padding: 0, margin: -8, gap: '1rem', paddingTop: 7"),
    wrap('color: colors.text'),
    // Not a css.create argument
    'const styles = {s: {padding: 16}}',
    // Off-scale radius number is silent
    wrap('borderRadius: 10'),
  ],
  invalid: [
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
      errors: [{messageId: 'rawColorToken', suggestions: []}],
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
  ],
})
