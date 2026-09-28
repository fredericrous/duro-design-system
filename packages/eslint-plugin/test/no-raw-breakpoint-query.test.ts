import {RuleTester} from '@typescript-eslint/rule-tester'
import {noRawBreakpointQuery} from '../src/rules/no-raw-breakpoint-query.js'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {ecmaVersion: 2022, sourceType: 'module'},
  },
})

const STYLE_IMPORT = "import {breakpoints} from '@duro-app/tokens/tokens/breakpoints.css'\n"
const RAW_IMPORT = "import {breakpointsPx} from '@duro-app/tokens/raw'\n"
const SCALE = '480 / 640 / 768 / 1024 / 1280'

tester.run('no-raw-breakpoint-query', noRawBreakpointQuery, {
  valid: [
    // Runtime query already reads the raw scale
    RAW_IMPORT + 'useMediaQuery(`(min-width: ${breakpointsPx.md}px)`)',
    // Not a breakpoint query
    "useMediaQuery('(prefers-color-scheme: light)')",
    "const s = 'width: 768px'",
    // css.create keys are no-raw-design-values' business
    "css.create({s: {'@media (min-width: 768px)': {gap: spacing.md}}})",
    // The StyleX const inside css.create is exactly where it belongs
    STYLE_IMPORT + 'css.create({s: {[`@media (min-width: ${breakpoints.md})`]: {gap: 8}}})',
    // …and in a condition string built for a css.create key
    STYLE_IMPORT +
      'const WIDE = `@media (min-width: ${breakpoints.md})`\ncss.create({s: {[WIDE]: {gap: 8}}})',
    // Type-only imports never run
    "import type {Breakpoint} from '@duro-app/tokens/tokens/breakpoints.css'\nlet b: Breakpoint",
  ],
  invalid: [
    // --- runtime strings → raw breakpointsPx ---------------------------------
    {
      code: "const isWide = useMediaQuery('(min-width: 768px)', true)",
      errors: [{messageId: 'rawBreakpointQuery', data: {value: '768', token: 'md', scale: SCALE}}],
      output:
        RAW_IMPORT + 'const isWide = useMediaQuery(`(min-width: ${breakpointsPx.md}px)`, true)',
    },
    {
      // website-builder's useIsMobile shape
      code: "export const useIsMobile = () => window.matchMedia('(max-width: 768px)').matches",
      errors: [{messageId: 'rawBreakpointQuery'}],
      output:
        RAW_IMPORT +
        'export const useIsMobile = () => window.matchMedia(`(max-width: ${breakpointsPx.md}px)`).matches',
    },
    {
      // Template literal without expressions, existing raw import reused
      code: RAW_IMPORT + 'const q = `screen and (max-width: 640px)`',
      errors: [{messageId: 'rawBreakpointQuery'}],
      output: RAW_IMPORT + 'const q = `screen and (max-width: ${breakpointsPx.sm}px)`',
    },
    {
      // Aliased raw import is respected
      code: "import {breakpointsPx as bp} from '@duro-app/tokens/raw'\nwindow.matchMedia('(min-width: 1024px)')",
      errors: [{messageId: 'rawBreakpointQuery'}],
      output:
        "import {breakpointsPx as bp} from '@duro-app/tokens/raw'\nwindow.matchMedia(`(min-width: ${bp.lg}px)`)",
    },
    {
      // Off the scale: reported, not fixed
      code: "useMediaQuery('(min-width: 800px)')",
      errors: [{messageId: 'rawBreakpointQuery', data: {value: '800', token: '*', scale: SCALE}}],
      output: null,
    },
    {
      // A local `breakpointsPx` binding shadows the import: reported, not fixed
      code: "const breakpointsPx = {}\nuseMediaQuery('(min-width: 768px)')",
      errors: [{messageId: 'rawBreakpointQuery'}],
      output: null,
    },

    // --- style strings → StyleX breakpoints ----------------------------------
    {
      // A condition string destined for a css.create key keeps the const
      code: "const WIDE = '@media (min-width: 768px)'",
      errors: [
        {messageId: 'rawBreakpointStyleQuery', data: {value: '768', token: 'md', scale: SCALE}},
      ],
      output: STYLE_IMPORT + 'const WIDE = `@media (min-width: ${breakpoints.md})`',
    },
    {
      // Aliased style import is respected
      code: "import {breakpoints as bp} from '@duro-app/tokens/tokens/breakpoints.css'\nconst q = '@container (max-width: 640px)'",
      errors: [{messageId: 'rawBreakpointStyleQuery'}],
      output:
        "import {breakpoints as bp} from '@duro-app/tokens/tokens/breakpoints.css'\nconst q = `@container (max-width: ${bp.sm})`",
    },
    {
      // A local `breakpoints` binding shadows the import: reported, not fixed
      code: "const breakpoints = {}\nconst q = '@media (min-width: 768px)'",
      errors: [{messageId: 'rawBreakpointStyleQuery'}],
      output: null,
    },

    // --- the StyleX const read at runtime ------------------------------------
    {
      // What the old autofix produced in website-builder: moved to raw, and the
      // throwing import is gone
      code:
        STYLE_IMPORT +
        'export const useIsMobile = () => window.matchMedia(`(max-width: ${breakpoints.md})`).matches',
      errors: [{messageId: 'runtimeBreakpointConst', data: {name: 'breakpoints'}}],
      output:
        RAW_IMPORT +
        'export const useIsMobile = () => window.matchMedia(`(max-width: ${breakpointsPx.md}px)`).matches',
    },
    {
      // Other specifiers stay; every runtime read is rewritten in one fix
      code:
        "import {breakpoints, Breakpoint} from '@duro-app/tokens/tokens/breakpoints.css'\n" +
        'const a = `(min-width: ${breakpoints.sm})`\nconst b = `(max-width: ${breakpoints.lg})`',
      errors: [{messageId: 'runtimeBreakpointConst'}, {messageId: 'runtimeBreakpointConst'}],
      output:
        "import {Breakpoint} from '@duro-app/tokens/tokens/breakpoints.css'\n" +
        RAW_IMPORT.trimEnd() +
        '\nconst a = `(min-width: ${breakpointsPx.sm}px)`\nconst b = `(max-width: ${breakpointsPx.lg}px)`',
    },
    {
      // Existing raw import is extended, the style import removed
      code:
        "import {darkColors} from '@duro-app/tokens/raw'\n" +
        STYLE_IMPORT +
        'matchMedia(`(max-width: ${breakpoints.xs})`)',
      errors: [{messageId: 'runtimeBreakpointConst'}],
      output:
        "import {darkColors, breakpointsPx} from '@duro-app/tokens/raw'\n" +
        'matchMedia(`(max-width: ${breakpointsPx.xs}px)`)',
    },
    {
      // Still used inside css.create too: reported, not fixed — the import
      // has to stay for the style
      code:
        STYLE_IMPORT +
        'css.create({s: {[`@media (min-width: ${breakpoints.md})`]: {gap: 8}}})\n' +
        'matchMedia(`(min-width: ${breakpoints.md})`)',
      errors: [{messageId: 'runtimeBreakpointConst'}],
      output: null,
    },
    {
      // Not a template interpolation: reported, not fixed
      code: STYLE_IMPORT + 'const w = parseInt(breakpoints.md)',
      errors: [{messageId: 'runtimeBreakpointConst'}],
      output: null,
    },

    // --- breakpointsPx imported from the StyleX module -----------------------
    {
      code: "import {breakpointsPx, type Breakpoint} from '@duro-app/tokens/tokens/breakpoints.css'\nconst w = breakpointsPx.md",
      errors: [{messageId: 'breakpointsPxFromStyleModule', data: {name: 'breakpointsPx'}}],
      output:
        "import {breakpointsPx, type Breakpoint} from '@duro-app/tokens/raw'\nconst w = breakpointsPx.md",
    },
    {
      // Shares the declaration with the const: reported, not moved
      code: "import {breakpoints, breakpointsPx} from '@duro-app/tokens/tokens/breakpoints.css'\ncss.create({s: {[`@media (min-width: ${breakpoints.md})`]: {gap: 8}}})\nconst w = breakpointsPx.md",
      errors: [{messageId: 'breakpointsPxFromStyleModule'}],
      output: null,
    },
  ],
})
