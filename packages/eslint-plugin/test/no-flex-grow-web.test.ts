import {RuleTester} from '@typescript-eslint/rule-tester'
import {noFlexGrowWeb} from '../src/rules/no-flex-grow-web.js'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: {jsx: true}},
  },
})

tester.run('no-flex-grow-web', noFlexGrowWeb, {
  valid: [
    // flexGrow: 0 is what the runtime forces anyway — redundant, not a lie
    {code: 'const s = css.create({row: {flexGrow: 0}})'},
    {code: "const s = css.create({row: {flexGrow: '0'}})"},
    // Other flex properties are untouched by the forced base style
    {code: 'const s = css.create({row: {flexShrink: 1, flexBasis: 0}})'},
    // Outside a style factory, flexGrow is someone else's business
    {code: 'const layout = {flexGrow: 1}'},
    {code: 'other.create({row: {flexGrow: 1}})'},
    // Custom factory list replaces the default
    {code: 'css.create({row: {flexGrow: 1}})', options: [{factories: ['styles.make']}]},
  ],
  invalid: [
    {
      code: 'const s = css.create({row: {flexGrow: 1}})',
      errors: [{messageId: 'flexGrowForced'}],
    },
    {
      // Dynamic values are forced to 0 just the same
      code: 'const s = css.create({row: {flexGrow: grow}})',
      errors: [{messageId: 'flexGrowForced'}],
    },
    {
      // Nested media-query map
      code: "const s = css.create({row: {'@media (min-width: 768px)': {flexGrow: 1}}})",
      errors: [{messageId: 'flexGrowForced'}],
    },
    {
      // String key spelling
      code: "const s = css.create({row: {'flexGrow': 2}})",
      errors: [{messageId: 'flexGrowForced'}],
    },
    {
      code: 'styles.make({row: {flexGrow: 1}})',
      options: [{factories: ['styles.make']}],
      errors: [{messageId: 'flexGrowForced'}],
    },
  ],
})
