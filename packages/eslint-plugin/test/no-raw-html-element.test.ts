import {RuleTester} from '@typescript-eslint/rule-tester'
import {noRawHtmlElement} from '../src/rules/no-raw-html-element.js'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: {jsx: true}},
  },
})

tester.run('no-raw-html-element', noRawHtmlElement, {
  valid: [
    {code: '<html.div>hi</html.div>', filename: 'x.tsx'},
    {code: '<Table.Row><Card /></Table.Row>', filename: 'x.tsx'},
    // HTML-colliding tags inside an <svg> subtree are fine (ancestry check)
    {
      code: '<svg viewBox="0 0 1 1"><a href="#x"><title>t</title><path d="M0 0" /></a></svg>',
      filename: 'x.tsx',
    },
    // Detached SVG fragments (icon helper without the enclosing <svg>)
    {code: 'const icon = <path d="M0 0" />', filename: 'x.tsx'},
    {code: '<div />', filename: 'x.tsx', options: [{allow: ['div']}]},
    {code: '<my-widget />', filename: 'x.tsx'},
    {code: '<table />', filename: 'x.tsx', options: [{reportUnsupported: false}]},
  ],
  invalid: [
    {
      code: '<div><span>x</span></div>',
      filename: 'x.tsx',
      errors: [
        {
          messageId: 'useHtml',
          suggestions: [
            {
              messageId: 'suggestReplace',
              output: "import {html} from 'react-strict-dom'\n<html.div><span>x</span></html.div>",
            },
          ],
        },
        {
          messageId: 'useHtml',
          suggestions: [
            {
              messageId: 'suggestReplace',
              output: "import {html} from 'react-strict-dom'\n<div><html.span>x</html.span></div>",
            },
          ],
        },
      ],
    },
    {
      code: "import {css} from 'react-strict-dom'\nconst x = <p>x</p>",
      filename: 'x.tsx',
      errors: [
        {
          messageId: 'useHtml',
          suggestions: [
            {
              messageId: 'suggestReplace',
              output: "import {css, html} from 'react-strict-dom'\nconst x = <html.p>x</html.p>",
            },
          ],
        },
      ],
    },
    {
      code: "import {html as h} from 'react-strict-dom'\nconst x = <div />",
      filename: 'x.tsx',
      errors: [
        {
          messageId: 'useHtml',
          suggestions: [
            {
              messageId: 'suggestReplace',
              output: "import {html as h} from 'react-strict-dom'\nconst x = <h.div />",
            },
          ],
        },
      ],
    },
    {
      code: '<table><caption>x</caption></table>',
      filename: 'x.tsx',
      errors: [{messageId: 'noEquivalent'}, {messageId: 'noEquivalent'}],
    },
    {
      // A non-import binding named `html` shadows the import — no suggestion.
      code: 'const html = 1\nconst x = <div />',
      filename: 'x.tsx',
      errors: [{messageId: 'useHtml', suggestions: []}],
    },
  ],
})
