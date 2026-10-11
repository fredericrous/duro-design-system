import type {ReactNode} from 'react'
import {Modal, StyleSheet} from 'react-native'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import {PortalHost} from './PortalHost'

interface OverlayModalProps {
  visible: boolean
  /** Android back button: the dismissal Escape is on the web. */
  onRequestClose: () => void
  /** iOS: the Modal has finished dismissing (presenting another one is safe). */
  onDismiss?: () => void
  children: ReactNode
}

/**
 * The window every interactive native overlay renders in (plan N0,
 * Decision 2). RN `Modal` is a React portal, so the app's contexts reach the
 * content, and it presents above natively presented routes. Duro draws its own
 * backdrop and motion, so the Modal's own animation is off.
 *
 * Content gets its own GestureHandlerRootView: on Android a Modal is a
 * separate window that the app's root view does not cover. A PortalHost on
 * top lets toasts raised while it is open draw above it.
 */
export function OverlayModal({visible, onRequestClose, onDismiss, children}: OverlayModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="none"
      onRequestClose={onRequestClose}
      onDismiss={onDismiss}
    >
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        {children}
        <PortalHost />
      </GestureHandlerRootView>
    </Modal>
  )
}
