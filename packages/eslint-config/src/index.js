import reactHooks from 'eslint-plugin-react-hooks'
import duro from '@duro-app/eslint-plugin'
import {base} from '@aval-adr/eslint-config'

/**
 * The Duro design-system and UI-library policy, on top of the harness's
 * `base` from @aval-adr/eslint-config. `base`, `effect`, `tests` and
 * `adrLint` come from @aval-adr/eslint-config directly; this package keeps
 * only `react`, which carries what only the design system knows: the duro
 * plugin rules and the foreign-UI and Lexical import bans.
 */

const FOREIGN_UI_MESSAGE =
  'UI primitives come from @duro-app/ui only. If the component you need is missing, add it to duro-design-system instead of reaching for another library — `npx duro list` shows what exists.'

const LEXICAL_MESSAGE =
  'Rich text goes through @fredericrous/lexical-multi at the app layer, never raw Lexical — the wrapper carries the multi-editor state, native support, and edit-state accessibility.'

const FOREIGN_UI_PATTERN = {
  allowTypeImports: true,
  group: [
    'react-aria',
    'react-aria-components',
    '@react-aria/*',
    '@adobe/react-spectrum',
    '@react-spectrum/*',
    '@mui/*',
    '@material-ui/*',
    '@radix-ui/*',
    '@chakra-ui/*',
    '@headlessui/*',
    'antd',
    'antd/*',
    '@frontjutsu/ui',
    '@frontjutsu/ui/*',
  ],
  message: FOREIGN_UI_MESSAGE,
}

const LEXICAL_PATTERN = {
  allowTypeImports: true,
  group: ['lexical', '@lexical/*'],
  message: LEXICAL_MESSAGE,
}

/** @type {import('eslint').Linter.Config[]} */
export const react = [
  ...base,
  // Classic hooks correctness only. react-hooks v7's flat.recommended also
  // ships the React Compiler-era rules (refs, set-state-in-effect,
  // immutability, …) at error — adopting those is a per-repo migration
  // (duro-design-system deferred ~27 sites, website-builder ~53), not a
  // default gate. A repo that adopts the compiler opts in on top.
  {
    name: 'duro-config/react-hooks-classic',
    plugins: {'react-hooks': reactHooks},
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  duro.configs.recommended,
  {
    name: 'duro-config/react-policy',
    rules: {
      // The typescript-eslint rule, not the core one, for `allowTypeImports`.
      // Banning a module by name also catches `import type {X} from 'lexical'`,
      // and a type import erases at compile time: it reaches no runtime module,
      // so it bypasses nothing these bans protect. kb-vision hit exactly that —
      // it uses the wrapper correctly and needed one type the wrapper does not
      // re-export — and had to carry a local override to say so.
      'no-restricted-imports': 'off',
      'duro/no-restricted-imports': [
        'error',
        {
          patterns: [FOREIGN_UI_PATTERN, LEXICAL_PATTERN],
        },
      ],
    },
  },
]

export default {react}
