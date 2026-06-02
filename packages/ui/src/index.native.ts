/**
 * Native (React Native / Expo) entry — resolved via the `react-native` export
 * condition (see package.json). Metro reads THIS instead of the web `index.ts`.
 *
 * Why a separate barrel: the web `index.ts` re-exports interactive/overlay
 * components (Dialog, Drawer, Menu, Tabs, Select, Combobox, Form, ScrollArea,
 * TagGroup, ThemeProvider's portal) that use web-only DOM APIs — and Combobox
 * imports `react-dom`, so pulling the full barrel crashes on Metro. This barrel
 * re-exports ONLY the components whose source is RN-safe (pure react-strict-dom
 * `html` + `css`, audited 2026-06-02). The rest get RN variants in a later pass.
 *
 * Tokens resolve fine on native already: @duro-app/tokens's subpath exports
 * (`./tokens/*.css`, `./themes/*.css`) point straight at their `.css.ts`
 * source, so Metro/StyleX-native compile them directly.
 */

// Leaf primitives
export {Badge, type BadgeVariant, type BadgeSize} from './components/Badge/Badge'
export {Button, type ButtonVariant, type ButtonSize} from './components/Button/Button'
export {Card, type CardVariant, type CardSize} from './components/Card/Card'
export {Checkbox} from './components/Checkbox/Checkbox'
export {Heading, type HeadingVariant} from './components/Heading/Heading'
export {Input, type InputVariant} from './components/Input/Input'
export {Switch} from './components/Switch/Switch'
export {Text, type TextVariant, type TextColor} from './components/Text/Text'
export {Textarea, type TextareaVariant} from './components/Textarea/Textarea'

// Form field wrappers (RN-safe — used by Input/Textarea/Checkbox)
export {Field} from './components/Field/Field'
export {InputGroup} from './components/InputGroup/InputGroup'

// Layout primitives
export {Stack, type SpacingKey} from './components/Stack/Stack'
export {Inline} from './components/Inline/Inline'
export {Cluster} from './components/Cluster/Cluster'
export {Grid} from './components/Grid/Grid'
