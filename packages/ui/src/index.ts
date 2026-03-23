import './global-reset.css'
import './strict.css'

// Components
export {ActionBar, type ActionBarProps} from './components/ActionBar/ActionBar'
export {ActionBarProvider} from './components/ActionBar/ActionBarProvider'
export {Alert, type AlertVariant} from './components/Alert/Alert'
export {Icon, type IconName} from './components/Icon'
export {Badge, type BadgeVariant, type BadgeSize} from './components/Badge/Badge'
export {Button, type ButtonVariant, type ButtonSize} from './components/Button/Button'
export {Callout, type CalloutVariant} from './components/Callout/Callout'
export {Card, type CardVariant, type CardSize} from './components/Card/Card'
export {Checkbox} from './components/Checkbox/Checkbox'
export {Dialog, type DialogSize} from './components/Dialog/Dialog'
export {DetailPanel, type DetailPanelSize} from './components/DetailPanel/DetailPanel'
export {Drawer, type DrawerAnchor, type DrawerSize} from './components/Drawer/Drawer'
export {EmptyState} from './components/EmptyState/EmptyState'
export {Heading, type HeadingVariant} from './components/Heading/Heading'
export {List, type ListSelectionMode} from './components/List/List'
export {Field} from './components/Field/Field'
export {Form, type FormProps} from './components/Form/Form'
export {Fieldset, type FieldsetGap} from './components/Fieldset/Fieldset'
export {Input, type InputVariant} from './components/Input/Input'
export {InputGroup} from './components/InputGroup/InputGroup'
export {
  LinkButton,
  type LinkButtonVariant,
  type LinkButtonSize,
} from './components/LinkButton/LinkButton'
export {Menu} from './components/Menu/Menu'
export {Panel} from './components/Panel/Panel'
export {ScrollArea} from './components/ScrollArea/ScrollArea'
export {Select} from './components/Select/Select'
export {SideNav} from './components/SideNav/SideNav'
export {Spinner, type SpinnerSize} from './components/Spinner/Spinner'
export {
  StatusIcon,
  type StatusIconName,
  type StatusIconVariant,
} from './components/StatusIcon/StatusIcon'
export {Table, type TableVariant, type TableSize} from './components/Table/Table'
export {Tabs} from './components/Tabs/Tabs'
export {Textarea, type TextareaVariant} from './components/Textarea/Textarea'
export {ThemeProvider, type ThemeName} from './components/ThemeProvider/ThemeProvider'
export {Text, type TextVariant, type TextColor} from './components/Text/Text'
export {Toggle, type ToggleSize} from './components/Toggle/Toggle'
export {ToggleGroup} from './components/ToggleGroup/ToggleGroup'
export {Tooltip} from './components/Tooltip/Tooltip'
export {Switch} from './components/Switch/Switch'

// Layout primitives
export {Stack, type SpacingKey} from './components/Stack/Stack'
export {Inline} from './components/Inline/Inline'
export {Cluster} from './components/Cluster/Cluster'
export {Grid} from './components/Grid/Grid'
export {PageShell, type PageShellMaxWidth, type PageShellPadding} from './components/PageShell'

// Hooks
export {useContainerQuery, type ContainerSize} from './hooks/useContainerQuery'

// Tokens — import directly from @duro-app/tokens with deep imports:
//   import { colors } from '@duro-app/tokens/tokens/colors.css'
//   import { spacing, radii } from '@duro-app/tokens/tokens/spacing.css'
// Barrel re-exports removed: StyleX's babel plugin cannot resolve
// css.defineVars through barrel re-exports.
