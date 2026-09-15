import {RuleTester} from '@typescript-eslint/rule-tester'
import {noRawBreakpointQuery} from '../src/rules/no-raw-breakpoint-query.js'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {ecmaVersion: 2022, sourceType: 'module'},
  },
})

const IMPORT = "import {breakpoints} from '@duro-app/tokens/tokens/breakpoints.css'\n"

tester.run('no-raw-breakpoint-query', noRawBreakpointQuery, {
  valid: [
    // Already read from the const
    'useMediaQuery(`(min-width: ${breakpoints.md})`)',
    // Not a breakpoint query
    "useMediaQuery('(prefers-color-scheme: light)')",
    "const s = 'width: 768px'",
    // css.create keys are no-raw-design-values' business
    "css.create({s: {'@media (min-width: 768px)': {gap: spacing.md}}})",
  ],
  invalid: [
    {
      code: "const isWide = useMediaQuery('(min-width: 768px)', true)",
      errors: [
        {
          messageId: 'rawBreakpointQuery',
          data: {value: '768', token: 'md', scale: '480 / 640 / 768 / 1024 / 1280'},
        },
      ],
      output: IMPORT + 'const isWide = useMediaQuery(`(min-width: ${breakpoints.md})`, true)',
    },
    {
      // Template literal without expressions, existing import reused
      code: IMPORT + 'const q = `screen and (max-width: 640px)`',
      errors: [{messageId: 'rawBreakpointQuery'}],
      output: IMPORT + 'const q = `screen and (max-width: ${breakpoints.sm})`',
    },
    {
      // Aliased import is respected
      code: "import {breakpoints as bp} from '@duro-app/tokens/tokens/breakpoints.css'\nwindow.matchMedia('(min-width: 1024px)')",
      errors: [{messageId: 'rawBreakpointQuery'}],
      output:
        "import {breakpoints as bp} from '@duro-app/tokens/tokens/breakpoints.css'\nwindow.matchMedia(`(min-width: ${bp.lg})`)",
    },
    {
      // Off the scale: reported, not fixed
      code: "useMediaQuery('(min-width: 800px)')",
      errors: [
        {
          messageId: 'rawBreakpointQuery',
          data: {value: '800', token: '*', scale: '480 / 640 / 768 / 1024 / 1280'},
        },
      ],
      output: null,
    },
    {
      // A local `breakpoints` binding shadows the import: reported, not fixed
      code: "const breakpoints = {}\nuseMediaQuery('(min-width: 768px)')",
      errors: [{messageId: 'rawBreakpointQuery'}],
      output: null,
    },
  ],
})
