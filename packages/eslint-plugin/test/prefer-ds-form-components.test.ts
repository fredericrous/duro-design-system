import {RuleTester} from '@typescript-eslint/rule-tester'
import {preferDsFormComponents} from '../src/rules/prefer-ds-form-components.js'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: {jsx: true}},
  },
})

tester.run('prefer-ds-form-components', preferDsFormComponents, {
  valid: [
    // The form kit itself
    {code: '<Input name="q" value={v} onChange={f} />', filename: 'x.tsx'},
    {code: '<Field.Root><Field.Label>Name</Field.Label><Input /></Field.Root>', filename: 'x.tsx'},
    // Non-form html.* elements are no-raw-html-element territory, not ours
    {code: '<html.div><html.span>x</html.span></html.div>', filename: 'x.tsx'},
    {code: '<html.button type="submit">Go</html.button>', filename: 'x.tsx'},
    // Raw intrinsics are also not ours (no-raw-html-element reports those)
    {code: '<input />', filename: 'x.tsx'},
    // Escape hatch for a component tree that IS the form kit
    {code: '<html.input />', filename: 'x.tsx', options: [{allow: ['input']}]},
    // Only the configured html objects match
    {code: '<h.input />', filename: 'x.tsx'},
  ],
  invalid: [
    {
      code: '<html.input value={v} onChange={f} />',
      filename: 'x.tsx',
      errors: [{messageId: 'useFormKit'}],
    },
    {
      code: '<html.select>{options}</html.select>',
      filename: 'x.tsx',
      errors: [{messageId: 'useFormKit'}],
    },
    {
      code: '<html.textarea rows={4} />',
      filename: 'x.tsx',
      errors: [{messageId: 'useFormKit'}],
    },
    {
      code: '<h.input />',
      filename: 'x.tsx',
      options: [{htmlObjects: ['h']}],
      errors: [{messageId: 'useFormKit'}],
    },
  ],
})
