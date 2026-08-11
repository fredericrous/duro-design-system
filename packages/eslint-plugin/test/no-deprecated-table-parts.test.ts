import {RuleTester} from '@typescript-eslint/rule-tester'
import {noDeprecatedTableParts} from '../src/rules/no-deprecated-table-parts.js'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: {jsx: true}},
  },
})

tester.run('no-deprecated-table-parts', noDeprecatedTableParts, {
  valid: [
    {code: '<Table.Root><Table.Header /></Table.Root>', filename: 'x.tsx'},
    // isActions on Cell is the correct API
    {code: '<Table.Cell isActions>x</Table.Cell>', filename: 'x.tsx'},
    {code: '<Other.Container />', filename: 'x.tsx'},
    {code: '<Table.HeaderCell label="Actions" />', filename: 'x.tsx'},
  ],
  invalid: [
    {
      code: '<Table.Container><Table.Root /></Table.Container>',
      filename: 'x.tsx',
      errors: [{messageId: 'deprecatedContainer'}],
      output: null,
    },
    {
      code: '<TableCore.Container />',
      filename: 'x.tsx',
      errors: [{messageId: 'deprecatedContainer'}],
      output: null,
    },
    {
      code: '<Table.HeaderCell isActions>A</Table.HeaderCell>',
      filename: 'x.tsx',
      errors: [{messageId: 'deprecatedIsActions'}],
      output: '<Table.HeaderCell>A</Table.HeaderCell>',
    },
    {
      code: '<Table.HeaderCell width="40px" isActions={true} />',
      filename: 'x.tsx',
      errors: [{messageId: 'deprecatedIsActions'}],
      output: '<Table.HeaderCell width="40px" />',
    },
    {
      code: '<Table.HeaderCell isActions={cond} />',
      filename: 'x.tsx',
      errors: [
        {
          messageId: 'deprecatedIsActions',
          suggestions: [{messageId: 'removeIsActions', output: '<Table.HeaderCell />'}],
        },
      ],
      output: null,
    },
  ],
})
