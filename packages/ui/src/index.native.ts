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
export {Heading, type HeadingSize, type HeadingVariant} from './components/Heading/Heading'
export {Input, type InputVariant} from './components/Input/Input'
export {Switch} from './components/Switch/Switch'
export {Text, type TextVariant, type TextColor} from './components/Text/Text'
export {TextLink, type TextLinkVariant} from './components/TextLink/TextLink'
export {Textarea, type TextareaVariant} from './components/Textarea/Textarea'

// Text and layout
export {CodeBlock, type CodeBlockProps} from './components/CodeBlock/CodeBlock'
export type {CodeBlockLineAction, DiffLineInfo} from './components/CodeBlock/types'
export {Prose} from './components/Prose/Prose'
export {Toolbar, type ToolbarProps} from './components/Toolbar/Toolbar'

// Form field wrappers (RN-safe — used by Input/Textarea/Checkbox)
export {Field} from './components/Field/Field'
export {InputGroup} from './components/InputGroup/InputGroup'

// Status and feedback (5.12: Icon draws with react-native-svg on native)
export {Alert, type AlertVariant} from './components/Alert/Alert'
export {Callout, type CalloutVariant} from './components/Callout/Callout'
export {EmptyState} from './components/EmptyState/EmptyState'
export {Icon, type IconName} from './components/Icon'
export {
  Avatar,
  type AvatarProps,
  type AvatarShape,
  type AvatarSize,
} from './components/Avatar/Avatar'
export {Meter, type MeterProps, type MeterTone} from './components/Meter/Meter'
export {QrCode, type QrCodeProps} from './components/QrCode/QrCode'
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
export {Tag, type TagVariant} from './components/Tag/Tag'
export {SideNav} from './components/SideNav/SideNav'
export {Tabs} from './components/Tabs/Tabs'
export {Tree} from './components/Tree/Tree'
// 5.14: pickers open a bottom sheet (a Drawer at the medium and large detents)
export {Select} from './components/Select/Select'
export {Combobox} from './components/Combobox/Combobox'
export {Listbox} from './components/Listbox/Listbox'
// A FlatList with the web props; prepend keeps position.
export {VirtualList, type VirtualListProps} from './components/VirtualList/VirtualList'
// The platform's own scroll indicator: Scrollbar and Thumb draw nothing.
export {ScrollArea} from './components/ScrollArea/ScrollArea'
export type {ListboxAnchorProps, ListboxMaxHeight} from './components/Listbox/Listbox'
// Always stacked on native: a phone is below every collapseBelow.
export {SplitPane} from './components/SplitPane/SplitPane'
// Always the phone shape on native: the bar on top, the rail in a left Drawer.
export {
  AppShell,
  type AppShellCollapse,
  type AppShellScroll,
  type AppShellRailState,
} from './components/AppShell/AppShell'

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
export {Menu, type MenuTriggerVariant} from './components/Menu/Menu'
export {Popover, type PopoverHandle} from './components/Popover/Popover'
// Touch has no hover: a Tooltip's text is its trigger's accessibility hint.
export {Tooltip} from './components/Tooltip/Tooltip'
// Drawn through the portal host, above every open overlay and the keyboard.
export {
  ToastProvider,
  useToast,
  type ToastVariant,
  type ToastOptions,
  type ToastAction,
  type ToastContextValue,
  type ToastProviderProps,
} from './components/Toast'

// Layout primitives
export {PageShell, type PageShellMaxWidth, type PageShellPadding} from './components/PageShell'
export {Panel} from './components/Panel/Panel'
export {Stack, type SpacingKey} from './components/Stack/Stack'
export {Inline} from './components/Inline/Inline'
export {Cluster} from './components/Cluster/Cluster'
export {Grid} from './components/Grid/Grid'
export type {GridTrack} from './shared/length'
// ADR-0002: the shape a link part's onNavigate receives (native: followLink)
export type {LinkClickEvent, OnNavigate} from './shared/navigate'

// Theming — resolves to ThemeProvider.native.tsx on Metro (RN-safe variant:
// no display:contents / portal mount; applies the theme to a flex container).
export {
  ThemeProvider,
  type ColorOverrides,
  type FontOverrides,
  type RadiusOverrides,
  usePortalMount,
  useResolvedColors,
  type ThemeName,
} from './components/ThemeProvider/ThemeProvider'
// 'system' follows RN Appearance; persistence is the app's (preference + onPreferenceChange).
export {
  ColorModeProvider,
  ColorModeToggle,
  useColorMode,
  type ColorModePreference,
} from './components/ColorMode'
// Where toasts draw on native: mount one inside a natively presented route.
export {PortalHost} from './shared/portal/PortalHost'
