import {type ReactNode, type RefObject, useEffect, useState} from 'react'
import {
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import {SPACING_PX} from '@duro-app/tokens/keys'
import {
  computePopoverPosition,
  type PopoverAlign,
  type PopoverRect,
  type PopoverSide,
  type PopoverSize,
} from '../../components/Popover/position'
import {OverlayModal} from './OverlayModal'

interface Measurable {
  measureInWindow?: (cb: (x: number, y: number, width: number, height: number) => void) => void
}

interface AnchoredOverlayProps {
  visible: boolean
  /** The trigger's host: it is measured in window coordinates when the overlay opens */
  anchorRef: RefObject<unknown>
  side: PopoverSide
  align: PopoverAlign
  /** A backdrop press or Android's back button */
  onRequestClose: () => void
  /** The Modal has been presented: move accessibility focus in */
  onShow?: () => void
  /** iOS: the Modal has finished dismissing */
  onDismiss?: () => void
  children: ReactNode
}

/**
 * A popup placed against its trigger on native (plan N0, Decision 3): the
 * trigger is measured with `measureInWindow`, the popup with `onLayout`, and
 * `computePopoverPosition` places it exactly as on the web. The OverlayModal
 * is transparent and translucent, so its coordinates are window coordinates.
 * Until both are measured the popup is laid out but not shown.
 */
export function AnchoredOverlay({
  visible,
  anchorRef,
  side,
  align,
  onRequestClose,
  onShow,
  onDismiss,
  children,
}: AnchoredOverlayProps) {
  const window = useWindowDimensions()
  const [anchor, setAnchor] = useState<PopoverRect | null>(null)
  const [size, setSize] = useState<PopoverSize | null>(null)

  useEffect(() => {
    if (!visible) {
      setAnchor(null)
      setSize(null)
      return
    }
    const host = anchorRef.current as Measurable | null
    host?.measureInWindow?.((left, top, width, height) => setAnchor({top, left, width, height}))
  }, [visible, anchorRef, window.width, window.height])

  const onLayout = (e: LayoutChangeEvent) => {
    const {width, height} = e.nativeEvent.layout
    setSize((prev) => (prev?.width === width && prev.height === height ? prev : {width, height}))
  }

  const position =
    anchor && size
      ? computePopoverPosition({
          anchor,
          popup: size,
          viewport: {width: window.width, height: window.height},
          side,
          align,
          offset: SPACING_PX.xs,
        })
      : null

  return (
    <OverlayModal
      visible={visible}
      onRequestClose={onRequestClose}
      onShow={onShow}
      onDismiss={onDismiss}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onRequestClose}
        accessible={false}
        importantForAccessibility="no"
      />
      <View
        onLayout={onLayout}
        style={[
          layout.popup,
          {maxWidth: window.width - 2 * SPACING_PX.sm},
          position ? {top: position.top, left: position.left} : layout.unplaced,
        ]}
      >
        {children}
      </View>
    </OverlayModal>
  )
}

// Layout-only: where the popup sits, and hidden until it has been placed.
const layout = StyleSheet.create({
  popup: {position: 'absolute'},
  unplaced: {top: 0, left: 0, opacity: 0},
})
