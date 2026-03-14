import './strict.css'

// Components
export {Alert, type AlertVariant} from './components/Alert/Alert'
export {Icon, type IconName} from './components/Icon'
export {Badge, type BadgeVariant, type BadgeSize} from './components/Badge/Badge'
export {Button, type ButtonVariant, type ButtonSize} from './components/Button/Button'
export {Callout, type CalloutVariant} from './components/Callout/Callout'
export {Card, type CardVariant, type CardSize} from './components/Card/Card'
export {Checkbox} from './components/Checkbox/Checkbox'
export {EmptyState} from './components/EmptyState/EmptyState'
export {Heading, type HeadingVariant} from './components/Heading/Heading'
export {Field} from './components/Field/Field'
export {Input, type InputVariant} from './components/Input/Input'
export {InputGroup} from './components/InputGroup/InputGroup'
export {
  LinkButton,
  type LinkButtonVariant,
  type LinkButtonSize,
} from './components/LinkButton/LinkButton'
export {Menu} from './components/Menu/Menu'
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
export {Tooltip} from './components/Tooltip/Tooltip'

// Layout primitives
export {Stack, type SpacingKey} from './components/Stack/Stack'
export {Inline} from './components/Inline/Inline'
export {Cluster} from './components/Cluster/Cluster'
export {Grid} from './components/Grid/Grid'

// Hooks
export {useContainerQuery, type ContainerSize} from './hooks/useContainerQuery'

// Tokens (re-exported from @duro/tokens for backward compatibility)
export {
  colors,
  spacing,
  radii,
  typography,
  typeScale,
  typePresets,
  shadows,
  layoutSpacing,
} from '@duro-app/tokens'
export {lightTheme, lightShadows, highContrastTheme, highContrastShadows} from '@duro-app/tokens'
