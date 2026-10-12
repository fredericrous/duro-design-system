import {Children, type ComponentProps, type ReactNode, type Ref} from 'react'
import {Pressable} from 'react-native'
import {html} from 'react-strict-dom'
import {useTooltipHint} from '../components/Tooltip/TooltipHint'

export type ButtonHostProps = ComponentProps<typeof html.button>

/**
 * The host element of Button and Toggle on native. Inside a Tooltip it is an
 * RN Pressable, which carries the Tooltip's text as its own accessibility hint
 * (plan N0, Decision 5: RSD drops `accessibilityHint` on html.*); the visual
 * styles move to a div inside it. Elsewhere it is RSD's button, as before.
 *
 * holds-until: react-strict-dom maps aria-description to accessibilityHint
 * (https://github.com/react/react-strict-dom/issues/524); then html.button
 * carries the hint itself and this swap goes.
 */
export function ButtonHost(props: ButtonHostProps) {
  const hint = useTooltipHint()
  const content = textInSpans(props.children)
  if (!hint) {
    return (
      <html.button {...props} style={props.style}>
        {content}
      </html.button>
    )
  }
  const {
    ref,
    style,
    disabled,
    onClick,
    'aria-label': label,
    'aria-pressed': pressed,
    'aria-expanded': expanded,
  } = props
  return (
    <Pressable
      ref={ref as Ref<never>}
      onPress={disabled ? undefined : () => onClick?.(undefined as never)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label ?? undefined}
      accessibilityHint={hint}
      accessibilityState={{
        disabled: !!disabled,
        ...(pressed !== undefined ? {checked: !!pressed} : {}),
        ...(expanded !== undefined ? {expanded: !!expanded} : {}),
      }}
    >
      <html.div style={style}>{content}</html.div>
    </Pressable>
  )
}

/**
 * A label beside an icon (`<Icon/> Menu`): RSD wraps a button's text only
 * when it is the sole child, and React Native refuses bare text in a view.
 */
function textInSpans(children: ReactNode): ReactNode {
  const items = Children.toArray(children)
  if (items.length < 2) return children
  return items.map((child, i) =>
    typeof child === 'string' || typeof child === 'number' ? (
      <html.span key={i}>{child}</html.span>
    ) : (
      child
    ),
  )
}
