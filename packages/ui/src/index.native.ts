/**
 * Native (React Native / Expo) entry — resolved via the `react-native` export
 * condition (see package.json). Metro reads THIS instead of the web `index.ts`.
 *
 * Why a separate barrel: the web `index.ts` re-exports interactive/overlay
 * components (Dialog, Drawer, Menu, Tabs, Select, Combobox, Form, ScrollArea,
 * TagGroup, ThemeProvider's portal) that use web-only DOM APIs — and Combobox
 * imports `react-dom`, so pulling the full barrel crashes on Metro. This barrel
 * re-exports ONLY the components whose source is RN-safe (pure react-strict-dom
 * `html` + `css`) or that have a `.native` variant; `pnpm typecheck:native` and
 * `scripts/check-native-graph.mjs` hold the line (plan N0).
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

// Status and feedback (5.12: Icon draws with react-native-svg on native)
export {Alert, type AlertVariant} from './components/Alert/Alert'
export {Callout, type CalloutVariant} from './components/Callout/Callout'
export {EmptyState} from './components/EmptyState/EmptyState'
export {Icon, type IconName} from './components/Icon'
export {Meter, type MeterProps, type MeterTone} from './components/Meter/Meter'
export {Spinner, type SpinnerSize} from './components/Spinner/Spinner'
export {
  StatusIcon,
  type StatusIconName,
  type StatusIconVariant,
} from './components/StatusIcon/StatusIcon'

// Choice and collection
export {List, type ListSelectionMode} from './components/List/List'
export {RadioGroup} from './components/RadioGroup/RadioGroup'
export {Toggle, type ToggleSize} from './components/Toggle/Toggle'

// Overlays (5.12: rendered in an OverlayModal on native)
export {ConfirmDialog} from './components/ConfirmDialog/ConfirmDialog'
export {Dialog, type DialogSize} from './components/Dialog/Dialog'
// 5.13: the panel follows the finger on the UI thread (Gesture Handler + Reanimated)
export {
  Drawer,
  type DrawerAnchor,
  type DrawerSize,
  type SnapPoint,
} from './components/Drawer/Drawer'

// Layout primitives
export {PageShell, type PageShellMaxWidth, type PageShellPadding} from './components/PageShell'
export {Stack, type SpacingKey} from './components/Stack/Stack'
export {Inline} from './components/Inline/Inline'
export {Cluster} from './components/Cluster/Cluster'
export {Grid} from './components/Grid/Grid'
export type {GridTrack} from './shared/length'

// Theming — resolves to ThemeProvider.native.tsx on Metro (RN-safe variant:
// no display:contents / portal mount; applies the theme to a flex container).
export {
  ThemeProvider,
  usePortalMount,
  useResolvedColors,
  type ThemeName,
} from './components/ThemeProvider/ThemeProvider'
// Where toasts draw on native: mount one inside a natively presented route.
export {PortalHost} from './shared/portal/PortalHost'
