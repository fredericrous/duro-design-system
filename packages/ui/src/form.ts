/**
 * `@duro-app/ui/form` — Form, the schema-validated wrapper.
 *
 * Form resolves an Effect Schema through `@hookform/resolvers/effect-ts`, and
 * both `@hookform/resolvers` and `effect` are peer dependencies an app only
 * has if it validates with them. Keeping Form out of the package root is what
 * makes those peers genuinely optional: a bundler must RESOLVE every static
 * import before tree-shaking can drop the code behind it, so a single
 * `import ... from '@hookform/resolvers/effect-ts'` in the root's graph fails
 * the build of an app that never renders a Form. (Same reasoning as
 * `@duro-app/ui/table` for TanStack.)
 *
 *   -import {Form, Field, Input} from '@duro-app/ui'
 *   +import {Field, Input} from '@duro-app/ui'
 *   +import {Form} from '@duro-app/ui/form'
 *
 * Field, Input and the rest stay on the root. They bind to a surrounding
 * Form through react-hook-form's context, which is why `react-hook-form`
 * itself is a required peer.
 */
export {Form, type FormProps} from './components/Form/Form'
