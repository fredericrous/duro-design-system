import {RuleTester} from '@typescript-eslint/rule-tester'
import {noTokensBarrelImport} from '../src/rules/no-tokens-barrel-import.js'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {ecmaVersion: 2022, sourceType: 'module'},
  },
})

tester.run('no-tokens-barrel-import', noTokensBarrelImport, {
  valid: [
    "import {colors} from '@duro-app/tokens/tokens/colors.css'",
    "import {darkColors} from '@duro-app/tokens/raw'",
    "import {SPACING_KEYS} from '@duro-app/tokens/keys'",
    "import {colors} from '@other/tokens'",
  ],
  invalid: [
    {
      code: "import {colors} from '@duro-app/tokens'",
      errors: [{messageId: 'barrelImport'}],
      output: "import {colors} from '@duro-app/tokens/tokens/colors.css'",
    },
    {
      code: "import {spacing, radii, colors} from '@duro-app/tokens'",
      errors: [{messageId: 'barrelImport'}],
      output:
        "import {colors} from '@duro-app/tokens/tokens/colors.css'\n" +
        "import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'",
    },
    {
      code: "import {colors as c, type Breakpoint} from '@duro-app/tokens';",
      errors: [{messageId: 'barrelImport'}],
      output:
        "import type {Breakpoint} from '@duro-app/tokens/tokens/breakpoints.css';\n" +
        "import {colors as c} from '@duro-app/tokens/tokens/colors.css';",
    },
    {
      code: 'import type {SpacingToken} from "@duro-app/tokens"',
      errors: [{messageId: 'barrelImport'}],
      output: 'import type {SpacingToken} from "@duro-app/tokens/keys"',
    },
    {
      code: "function f() {\n  return import('x')\n}\nimport {colors, mystery} from '@duro-app/tokens'",
      errors: [{messageId: 'unknownSpecifiers'}],
      output: null,
    },
    {
      code: "import * as tokens from '@duro-app/tokens'",
      errors: [{messageId: 'barrelNamespace'}],
      output: null,
    },
    {
      code: "import '@duro-app/tokens'",
      errors: [{messageId: 'barrelSideEffect'}],
      output: null,
    },
    {
      code: "export {colors} from '@duro-app/tokens'",
      errors: [{messageId: 'barrelImport'}],
      output: null,
    },
  ],
})
