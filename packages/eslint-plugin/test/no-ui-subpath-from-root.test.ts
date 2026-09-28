import {RuleTester} from '@typescript-eslint/rule-tester'
import {noUiSubpathFromRoot} from '../src/rules/no-ui-subpath-from-root.js'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {ecmaVersion: 2022, sourceType: 'module'},
  },
})

tester.run('no-ui-subpath-from-root', noUiSubpathFromRoot, {
  valid: [
    "import {Field, Input} from '@duro-app/ui'",
    "import {Form} from '@duro-app/ui/form'",
    "import {Table, useDataTable} from '@duro-app/ui/table'",
    // Table and the Form layout types exist on the root too
    "import {Table, type LabelPosition} from '@duro-app/ui'",
    "import {Form} from 'some-other-lib'",
  ],
  invalid: [
    {
      code: "import {Form} from '@duro-app/ui'",
      errors: [
        {
          messageId: 'subpathFromRoot',
          data: {
            name: 'Form',
            target: '@duro-app/ui/form',
            peers: 'react-hook-form, @hookform/resolvers',
          },
        },
      ],
      output: "import {Form} from '@duro-app/ui/form'",
    },
    {
      // The recipe shape: the rest stays on the root
      code: "import {Form, Field, Input, Button} from '@duro-app/ui'",
      errors: [{messageId: 'subpathFromRoot'}],
      output:
        "import {Field, Input, Button} from '@duro-app/ui'\nimport {Form} from '@duro-app/ui/form'",
    },
    {
      // Aliases, inline type markers and semicolons survive; both subpaths
      code: 'import {Form as F, type FormProps, Stack, useDataTable} from "@duro-app/ui";',
      errors: [
        {messageId: 'subpathFromRoot'},
        {messageId: 'subpathFromRoot'},
        {messageId: 'subpathFromRoot'},
      ],
      output:
        'import {Stack} from "@duro-app/ui";\nimport {Form as F, type FormProps} from "@duro-app/ui/form";\nimport {useDataTable} from "@duro-app/ui/table";',
    },
    {
      // An existing subpath import is extended
      code: "import {Table} from '@duro-app/ui/table'\nimport {VirtualTable, Badge} from '@duro-app/ui'",
      errors: [{messageId: 'subpathFromRoot'}],
      output:
        "import {Table, VirtualTable} from '@duro-app/ui/table'\nimport {Badge} from '@duro-app/ui'",
    },
    {
      // Declaration-level type import
      code: "import type {FormProps} from '@duro-app/ui'",
      errors: [{messageId: 'subpathFromRoot'}],
      output: "import type {FormProps} from '@duro-app/ui/form'",
    },
    {
      // Re-export: reported, not fixed
      code: "export {Form} from '@duro-app/ui'",
      errors: [{messageId: 'subpathFromRoot'}],
      output: null,
    },
  ],
})
