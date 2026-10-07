import {RuleTester} from '@typescript-eslint/rule-tester'
import {noFlexGrowWeb} from '../src/rules/no-flex-grow-web.js'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: {jsx: true}},
  },
})

// Retired: react-strict-dom honours flexGrow on web (see the rule's comment),
// so what it used to report is valid now. It stays loadable for configs that
// name it.
tester.run('no-flex-grow-web', noFlexGrowWeb, {
  valid: [
    {code: 'const s = css.create({row: {flexGrow: 1}})'},
    {code: 'const s = css.create({row: {flexGrow: grow}})'},
    {code: "const s = css.create({row: {'@media (min-width: 768px)': {flexGrow: 1}}})"},
    {code: 'styles.make({row: {flexGrow: 1}})', options: [{factories: ['styles.make']}]},
    {code: 'const s = css.create({row: {flexGrow: 1}})', filename: 'src/Row.native.tsx'},
  ],
  invalid: [],
})
