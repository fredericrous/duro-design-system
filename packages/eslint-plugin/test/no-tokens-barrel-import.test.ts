import {RuleTester} from '@typescript-eslint/rule-tester'
import {noTokensBarrelImport} from '../src/rules/no-tokens-barrel-import.js'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {ecmaVersion: 2022, sourceType: 'module'},
  },
})

tester.run('no-tokens-barrel-import', noTokensBarrelImport, {
  valid: [
    "import {colors} from '@greenharness/greenrack-tokens/tokens/colors.css'",
    "import {darkColors} from '@greenharness/greenrack-tokens/raw'",
    "import {SPACING_KEYS} from '@greenharness/greenrack-tokens/keys'",
    "import {colors} from '@other/tokens'",
  ],
  invalid: [
    {
      code: "import {colors} from '@greenharness/greenrack-tokens'",
      errors: [{messageId: 'barrelImport'}],
      output: "import {colors} from '@greenharness/greenrack-tokens/tokens/colors.css'",
    },
    {
      code: "import {spacing, radii, colors} from '@greenharness/greenrack-tokens'",
      errors: [{messageId: 'barrelImport'}],
      output:
        "import {colors} from '@greenharness/greenrack-tokens/tokens/colors.css'\n" +
        "import {spacing, radii} from '@greenharness/greenrack-tokens/tokens/spacing.css'",
    },
    {
      code: "import {colors as c, type Breakpoint} from '@greenharness/greenrack-tokens';",
      errors: [{messageId: 'barrelImport'}],
      output:
        "import type {Breakpoint} from '@greenharness/greenrack-tokens/tokens/breakpoints.css';\n" +
        "import {colors as c} from '@greenharness/greenrack-tokens/tokens/colors.css';",
    },
    {
      code: 'import type {SpacingToken} from "@greenharness/greenrack-tokens"',
      errors: [{messageId: 'barrelImport'}],
      output: 'import type {SpacingToken} from "@greenharness/greenrack-tokens/keys"',
    },
    {
      code: "function f() {\n  return import('x')\n}\nimport {colors, mystery} from '@greenharness/greenrack-tokens'",
      errors: [{messageId: 'unknownSpecifiers'}],
      output: null,
    },
    {
      code: "import * as tokens from '@greenharness/greenrack-tokens'",
      errors: [{messageId: 'barrelNamespace'}],
      output: null,
    },
    {
      code: "import '@greenharness/greenrack-tokens'",
      errors: [{messageId: 'barrelSideEffect'}],
      output: null,
    },
    {
      code: "export {colors} from '@greenharness/greenrack-tokens'",
      errors: [{messageId: 'barrelImport'}],
      output: null,
    },
  ],
})
