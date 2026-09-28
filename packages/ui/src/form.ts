/**
 * `@duro-app/ui/form` — Form, the react-hook-form + Effect Schema half.
 *
 * Form reaches `react-hook-form` and `@hookform/resolvers/effect-ts`, peer
 * dependencies a consumer only has if they asked for them. Keeping it out of
 * the package root is what makes those peers genuinely optional: a bundler
 * must RESOLVE every static import before tree-shaking can drop the code
 * behind it, so one `import ... from 'react-hook-form'` anywhere in the
 * root's graph fails the build of an app that never renders a form.
 *
 * Field, Input and the other controls stay on the root and work standalone.
 * Inside a Form, `Field.Root name="…"` binds to it through FormContext — the
 * react-hook-form binding is supplied from here, never imported by Field:
 *
 *   import {Field, Input} from '@duro-app/ui'
 *   import {Form} from '@duro-app/ui/form'
 */
export {Form, type FormProps} from './components/Form/Form'
export type {LabelPosition, NecessityIndicator} from './components/Form/FormContext'
