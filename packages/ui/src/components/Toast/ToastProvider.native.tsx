import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import {AccessibilityInfo, type LayoutChangeEvent, Pressable, StyleSheet} from 'react-native'
import {Gesture, GestureDetector} from 'react-native-gesture-handler'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import {scheduleOnRN} from 'react-native-worklets'
import {html} from 'react-strict-dom'
import {DURATION_MS, LAYERS, SPACING_PX} from '@duro-app/tokens/keys'
import {Icon} from '../Icon/Icon'
import {Portal} from '../../shared/portal/PortalHost'
import {useSafeAreaInsets} from '../../shared/safeArea'
import {useKeyboardHeight} from '../../shared/useKeyboardHeight'
import {useScreenReaderEnabled} from '../../shared/useScreenReaderEnabled'
import {DISMISS_DURATION, SNAP_DURATION, shouldDismissEdge} from '../Drawer/sheetPhysics'
import {nativeStyles} from './native.css'
import {createToastStore, type ToastContextValue, type ToastEntry, type ToastStore} from './store'

export type {ToastAction, ToastContextValue, ToastOptions, ToastVariant} from './store'

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>')
  return ctx
}

const easeOut = Easing.out(Easing.cubic)

function ToastItem({
  entry,
  store,
  onDismiss,
  dismissLabel,
  screenReader,
}: {
  entry: ToastEntry
  store: ToastStore
  onDismiss: (id: string) => void
  dismissLabel: string
  screenReader: boolean
}) {
  const {id, variant, message, action, duration} = entry
  const [pressed, setPressed] = useState(false)
  // A press holds the toast as hover does on the web; a screen reader holds
  // it for as long as it is on (WCAG 2.2.1).
  const paused = pressed || screenReader

  // The store keeps what is left, so a toast that moves to another host
  // (a Dialog above it closed) carries on where it was.
  useEffect(() => {
    if (duration <= 0 || paused) return
    const started = Date.now()
    const timer = setTimeout(() => onDismiss(id), Math.max(store.remaining(id), 0))
    return () => {
      clearTimeout(timer)
      store.spend(id, Date.now() - started)
    }
  }, [id, duration, paused, onDismiss, store])

  // iOS has no live regions: announce the message once.
  const announced = useRef(false)
  useEffect(() => {
    if (announced.current || typeof message !== 'string') return
    announced.current = true
    AccessibilityInfo.announceForAccessibility(message)
  }, [message])

  const x = useSharedValue(0)
  const shown = useSharedValue(0)
  const width = useSharedValue(1)
  useEffect(() => {
    shown.value = withTiming(1, {duration: DURATION_MS.brisk, easing: easeOut})
  }, [shown])

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-8, 8])
        .failOffsetY([-8, 8])
        .onUpdate((e) => {
          x.value = e.translationX
        })
        .onEnd((e) => {
          const distance = Math.abs(e.translationX)
          if (shouldDismissEdge(distance, width.value, Math.abs(e.velocityX) / 1000)) {
            const off = Math.sign(e.translationX || e.velocityX) * width.value
            x.value = withTiming(off, {duration: DISMISS_DURATION}, (done) => {
              if (done) scheduleOnRN(onDismiss, id)
            })
          } else {
            x.value = withTiming(0, {duration: SNAP_DURATION, easing: easeOut})
          }
        }),
    [id, onDismiss, x, width],
  )

  const motion = useAnimatedStyle(() => ({
    opacity: shown.value * (1 - Math.min(1, Math.abs(x.value) / width.value)),
    transform: [{translateX: x.value}, {translateY: (1 - shown.value) * SPACING_PX.sm}],
  }))

  const onLayout = (e: LayoutChangeEvent) => {
    width.value = e.nativeEvent.layout.width
  }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View onLayout={onLayout} style={[layout.row, motion]}>
        <Pressable
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          accessible={false}
          style={layout.row}
        >
          <html.div
            role={variant === 'error' ? 'alert' : 'status'}
            aria-live={variant === 'error' ? 'assertive' : 'polite'}
            style={[nativeStyles.toast, nativeStyles[variant]]}
          >
            <html.div style={nativeStyles.message}>{message}</html.div>
            {action ? (
              <html.button
                type="button"
                style={nativeStyles.action}
                onClick={() => {
                  action.onClick()
                  onDismiss(id)
                }}
              >
                {action.label}
              </html.button>
            ) : null}
            <html.button
              type="button"
              aria-label={dismissLabel}
              style={nativeStyles.close}
              onClick={() => onDismiss(id)}
            >
              <Icon name="x" size="sm" color="textMuted" />
            </html.button>
          </html.div>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  )
}

// Layout-only: each toast row spans the region and centres its card.
const layout = StyleSheet.create({row: {width: '100%', alignItems: 'center'}})

export interface ToastProviderProps {
  /** Accessible name of each toast's close button, e.g. from the app's message catalog. */
  dismissLabel?: string
  children: ReactNode
}

/**
 * Native ToastProvider (plan N0, Slice B): the same store and countdown as
 * the web, drawn through the portal host at `LAYERS.toast`, so a toast shows
 * above the app, every open Duro overlay (a sheet included) and the
 * keyboard. A sideways swipe or the close button dismisses it.
 */
export function ToastProvider({dismissLabel = 'Dismiss', children}: ToastProviderProps) {
  const storeRef = useRef<ToastStore>(null)
  if (storeRef.current === null) storeRef.current = createToastStore()
  const store = storeRef.current
  const entries = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const insets = useSafeAreaInsets()
  const keyboard = useKeyboardHeight()
  const screenReader = useScreenReaderEnabled()

  const value = useMemo<ToastContextValue>(
    () => ({toast: (opts) => store.add(opts), dismiss: (id) => store.remove(id)}),
    [store],
  )
  const dismiss = useCallback((id: string) => store.remove(id), [store])
  const bottom = Math.max(insets.bottom, keyboard) + SPACING_PX.md

  return (
    <ToastContext.Provider value={value}>
      {children}
      {entries.length > 0 && (
        <Portal layer={LAYERS.toast}>
          <html.div
            role="region"
            aria-label="Notifications"
            style={[nativeStyles.region, nativeStyles.regionBottom(bottom)]}
          >
            {entries.map((entry) => (
              <ToastItem
                key={entry.id}
                entry={entry}
                store={store}
                onDismiss={dismiss}
                dismissLabel={dismissLabel}
                screenReader={screenReader}
              />
            ))}
          </html.div>
        </Portal>
      )}
    </ToastContext.Provider>
  )
}
