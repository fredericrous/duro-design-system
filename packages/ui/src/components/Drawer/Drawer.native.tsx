import {
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import {
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type View,
} from 'react-native'
import {Gesture, GestureDetector, type GestureType} from 'react-native-gesture-handler'
import Animated, {
  type AnimatedRef,
  Easing,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import {scheduleOnRN} from 'react-native-worklets'
import {html} from 'react-strict-dom'
import {DURATION_MS, SIZES_PX} from '@duro-app/tokens/keys'
import {ModalContext} from '../../shared/ModalContext'
import {OverlayModal} from '../../shared/portal/OverlayModal'
import {focusForAccessibility} from '../../shared/accessibilityFocus'
import {useSafeAreaInsets} from '../../shared/safeArea'
import {withPress} from '../../shared/pressableChild'
import {ControlContextBoundary} from '../Toolbar/ControlContextBoundary'
import {Icon} from '../Icon/Icon'
import {nativeStyles} from './native.css'
import {partStyles} from './parts.css'
import {
  DEFAULT_GRABBER_LABELS,
  Description,
  DrawerContext,
  Footer,
  Header,
  Title,
  useDrawer,
  type DrawerSize,
  type GrabberLabels,
} from './parts'
import {
  DISMISS_DURATION,
  SNAP_DURATION,
  SNAP_MAX_OVERSHOOT,
  cycleDetent,
  detentHeight,
  rubberBand,
  settleDetent,
  shouldDismissEdge,
} from './sheetPhysics'
import {useDrawerRoot, type DrawerRootProps} from './useDrawerRoot'

export type {DrawerAnchor, DrawerSize, SnapPoint} from './parts'

/** Native-only wiring: where accessibility focus returns on close. */
const TriggerRefContext = createContext<RefObject<unknown> | null>(null)

/** What Drawer.Body needs from its sheet: the scroll the drag defers to. */
interface SheetScroll {
  scrollRef: AnimatedRef<Animated.ScrollView>
  scrollGesture: GestureType
  onScroll: ReturnType<typeof useAnimatedScrollHandler>
  /** px of a snap sheet below the screen's bottom edge at its detent */
  hiddenBelow: number
}

const SheetScrollContext = createContext<SheetScroll | null>(null)

/**
 * Native Drawer (plan N0, Slice B): the same compound API, in an
 * OverlayModal. The panel follows the finger on the UI thread (Gesture
 * Handler + Reanimated); a bottom drawer with `snapPoints` rests at its
 * detents and dismisses below the lowest. The backdrop press and Android's
 * back button close it; the screen reader's focus moves into the panel on
 * open and back to the trigger on close.
 */
function Root({children, ...props}: DrawerRootProps) {
  const ctx = useDrawerRoot(props)
  const triggerRef = useRef<unknown>(null)

  // Back to the trigger once the drawer is gone.
  const wasOpen = useRef(ctx.open)
  useEffect(() => {
    if (wasOpen.current && !ctx.open) focusForAccessibility(triggerRef.current, 'Drawer')
    wasOpen.current = ctx.open
  }, [ctx.open])

  return (
    <DrawerContext.Provider value={ctx}>
      <TriggerRefContext.Provider value={triggerRef}>{children}</TriggerRefContext.Provider>
    </DrawerContext.Provider>
  )
}

/** Opens the drawer from its one child (a Button), whose host gets focus back on close. */
function Trigger({children}: {children: ReactNode}) {
  const {requestOpen} = useDrawer()
  const triggerRef = useContext(TriggerRefContext)
  return withPress(children, requestOpen, triggerRef ?? undefined)
}

interface PortalProps {
  children: ReactNode
  size?: DrawerSize
  /** The grabber's accessible names, by what a press does next. Snap sheets only */
  grabberLabels?: GrabberLabels
}

const PANEL_WIDTH = {sm: SIZES_PX.panelSm, md: SIZES_PX.panelMd, lg: SIZES_PX.panelLg} as const

/** A content-height bottom drawer is capped at 85% of the window, as the web caps it at 85vh. */
const CONTENT_SHEET_CAP = 0.85

const easeOut = Easing.out(Easing.cubic)
const easeIn = Easing.in(Easing.cubic)

function Portal({children, size = 'md', grabberLabels = DEFAULT_GRABBER_LABELS}: PortalProps) {
  const {
    open,
    closing,
    closeDuration,
    anchor,
    dismissable,
    swipeDismiss,
    requestClose,
    requestCloseImmediate,
    titleId,
    panelRef,
    snapPoints,
    snapIndex,
    setSnapIndex,
  } = useDrawer()
  const window = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const bottom = anchor === 'bottom'
  const snapping = snapPoints.length > 0

  const heights = useMemo(
    () => snapPoints.map((p) => detentHeight(p, window.height, insets.top)),
    [snapPoints, window.height, insets.top],
  )
  const high = heights.length > 0 ? heights[heights.length - 1] : 0
  // Where the panel rests at its detent: its offset below its own full height.
  const rest = snapping ? high - heights[snapIndex] : 0
  // Off screen: the whole panel past its edge (a snap sheet's overshoot skirt included).
  const hidden = snapping ? high + SNAP_MAX_OVERSHOOT : bottom ? window.height : window.width

  // The panel's displacement toward its edge, in px: 0 shows it whole; a
  // snap sheet rests at restOf(detent); negative only while pulled past its
  // largest detent.
  const offset = useSharedValue(hidden)
  const start = useSharedValue(0)
  const extent = useSharedValue(bottom ? window.height : window.width)
  const index = useSharedValue(snapIndex)
  const owns = useSharedValue(false)
  const inBody = useSharedValue(false)
  const scrollY = useSharedValue(0)
  const scrollRef = useAnimatedRef<Animated.ScrollView>()

  // Enter, exit, and a detent chosen from React (the grabber): animate there.
  useEffect(() => {
    if (!open) {
      offset.value = hidden
      return
    }
    if (closing) {
      offset.value = withTiming(hidden, {duration: DURATION_MS[closeDuration], easing: easeIn})
      return
    }
    index.value = snapIndex
    offset.value = withTiming(rest, {duration: DURATION_MS.base, easing: easeOut})
    // `rest` and `hidden` follow the window: a rotation re-seats the panel too.
  }, [open, closing, closeDuration, snapIndex, rest, hidden, index, offset])

  const heightsShared = useSharedValue(heights)
  useEffect(() => {
    heightsShared.value = heights
  }, [heights, heightsShared])

  const scrollGesture = useMemo(
    () =>
      Gesture.Native().onBegin(() => {
        inBody.value = true
      }),
    [inBody],
  )

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y
  })

  const horizontalSign = anchor === 'left' ? -1 : 1
  const canDismiss = swipeDismiss && dismissable
  const pan = useMemo(() => {
    const toEdge = (x: number, y: number) => {
      'worklet'
      return bottom ? y : x * horizontalSign
    }
    const settleTo = (target: number) => {
      'worklet'
      offset.value = withTiming(target, {duration: SNAP_DURATION, easing: easeOut})
    }
    const dismiss = () => {
      'worklet'
      offset.value = withTiming(hidden, {duration: DISMISS_DURATION, easing: easeIn}, (done) => {
        if (done) scheduleOnRN(requestCloseImmediate)
      })
    }
    const gesture = Gesture.Pan()
      .enabled(swipeDismiss || snapping)
      .onStart((e) => {
        start.value = offset.value
        const t = toEdge(e.translationX, e.translationY)
        // From the content, the sheet takes the drag only with the list at its
        // top: toward the edge, or upward while a larger detent remains.
        owns.value =
          !bottom || !inBody.value
            ? true
            : scrollY.value <= 0 &&
              (t > 0 || (snapping && index.value < heightsShared.value.length - 1))
      })
      .onUpdate((e) => {
        if (!owns.value) return
        if (inBody.value) scrollTo(scrollRef, 0, 0, false)
        const next = start.value + toEdge(e.translationX, e.translationY)
        if (snapping) offset.value = next < 0 ? -rubberBand(-next, SNAP_MAX_OVERSHOOT) : next
        else offset.value = Math.max(0, next)
      })
      .onEnd((e) => {
        if (!owns.value) return
        const velocity = toEdge(e.velocityX, e.velocityY) / 1000
        if (snapping) {
          const hs = heightsShared.value
          const top = hs[hs.length - 1]
          const settled = settleDetent({
            heights: hs,
            from: index.value,
            height: top - offset.value,
            velocity,
          })
          if (settled === 'dismiss') {
            if (canDismiss) dismiss()
            else settleTo(top - hs[0])
            return
          }
          settleTo(top - hs[settled])
          if (settled !== index.value) {
            index.value = settled
            scheduleOnRN(setSnapIndex, settled)
          }
          return
        }
        if (canDismiss && shouldDismissEdge(offset.value, extent.value, velocity)) dismiss()
        else settleTo(0)
      })
      .onFinalize(() => {
        inBody.value = false
        owns.value = false
      })
      .simultaneousWithExternalGesture(scrollGesture)
    return bottom
      ? gesture.activeOffsetY([-8, 8]).failOffsetX([-16, 16])
      : gesture.activeOffsetX([-8, 8]).failOffsetY([-16, 16])
  }, [
    bottom,
    horizontalSign,
    snapping,
    swipeDismiss,
    canDismiss,
    hidden,
    requestCloseImmediate,
    setSnapIndex,
    scrollGesture,
    offset,
    start,
    extent,
    index,
    owns,
    inBody,
    scrollY,
    scrollRef,
    heightsShared,
  ])

  const panelMotion = useAnimatedStyle(() =>
    bottom
      ? {transform: [{translateY: offset.value}]}
      : {transform: [{translateX: offset.value * horizontalSign}]},
  )
  const backdropMotion = useAnimatedStyle(() => {
    if (snapping) {
      const hs = heightsShared.value
      const visible = hs[hs.length - 1] - offset.value
      return {opacity: Math.min(1, Math.max(0, visible / hs[0]))}
    }
    return {opacity: Math.min(1, Math.max(0, 1 - offset.value / extent.value))}
  })

  const onPanelLayout = (e: LayoutChangeEvent) => {
    const {width, height} = e.nativeEvent.layout
    extent.value = bottom ? height : width
  }

  const placement = bottom
    ? snapping
      ? [layout.bottom, {height: high + SNAP_MAX_OVERSHOOT, bottom: -SNAP_MAX_OVERSHOOT}]
      : [layout.bottom, {maxHeight: window.height * CONTENT_SHEET_CAP}]
    : [layout.side, anchor === 'left' ? layout.left : layout.right, {maxWidth: PANEL_WIDTH[size]}]
  const padTop = bottom ? 0 : insets.top
  const padBottom = insets.bottom + (snapping ? SNAP_MAX_OVERSHOOT : 0)

  const nextIndex = cycleDetent(snapIndex, snapPoints.length)
  const onGrabberAction = (e: AccessibilityActionEvent) => {
    if (e.nativeEvent.actionName === 'increment') {
      setSnapIndex(Math.min(snapIndex + 1, snapPoints.length - 1))
    } else if (e.nativeEvent.actionName === 'decrement') {
      setSnapIndex(Math.max(snapIndex - 1, 0))
    }
  }

  const sheetScroll: SheetScroll = {
    scrollRef,
    scrollGesture,
    onScroll,
    hiddenBelow: snapping ? high - heights[snapIndex] : 0,
  }

  return (
    <OverlayModal
      visible={open}
      onRequestClose={() => {
        if (dismissable) requestClose()
      }}
      onShow={() => focusForAccessibility(panelRef.current, 'Drawer')}
    >
      <Animated.View style={[StyleSheet.absoluteFill, backdropMotion]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissable ? requestClose : undefined}
          accessible={false}
          importantForAccessibility="no"
        >
          <html.div aria-hidden style={[nativeStyles.fill, nativeStyles.scrim]} />
        </Pressable>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View
          ref={panelRef as RefObject<View | null>}
          accessibilityViewIsModal
          onLayout={onPanelLayout}
          style={[placement, panelMotion]}
        >
          <html.div
            role="dialog"
            aria-modal
            aria-labelledby={titleId}
            style={[
              nativeStyles.panel,
              bottom && nativeStyles.panelBottom,
              anchor === 'right' && nativeStyles.panelRight,
              anchor === 'left' && nativeStyles.panelLeft,
              nativeStyles.insets(padTop, padBottom),
            ]}
          >
            {snapping && (
              <Pressable
                accessibilityRole="adjustable"
                accessibilityLabel={
                  nextIndex > snapIndex ? grabberLabels.expand : grabberLabels.collapse
                }
                accessibilityValue={{text: snapPoints[snapIndex]}}
                accessibilityActions={[{name: 'increment'}, {name: 'decrement'}]}
                onAccessibilityAction={onGrabberAction}
                onPress={() => setSnapIndex(nextIndex)}
              >
                <html.div style={partStyles.grabberHit}>
                  <html.div style={partStyles.grabber} />
                </html.div>
              </Pressable>
            )}
            <ModalContext.Provider value={true}>
              <ControlContextBoundary>
                <SheetScrollContext.Provider value={sheetScroll}>
                  {children}
                </SheetScrollContext.Provider>
              </ControlContextBoundary>
            </ModalContext.Provider>
          </html.div>
        </Animated.View>
      </GestureDetector>
    </OverlayModal>
  )
}

// Layout-only RN styles: where the moving panel sits before it moves.
const layout = StyleSheet.create({
  bottom: {position: 'absolute', left: 0, right: 0, bottom: 0},
  side: {position: 'absolute', top: 0, bottom: 0, width: '100%'},
  left: {left: 0},
  right: {right: 0},
  body: {flexGrow: 0, flexShrink: 1},
  bodyFill: {flex: 1},
})

/**
 * Native Body: a ScrollView, since a native div does not scroll its
 * overflow. In a bottom sheet the drag defers to it: the list scrolls, and
 * moves the sheet only from its top.
 */
function Body({children}: {children: ReactNode}) {
  const sheet = useContext(SheetScrollContext)
  const {snapPoints} = useDrawer()
  if (!sheet) return null
  return (
    <GestureDetector gesture={sheet.scrollGesture}>
      <Animated.ScrollView
        ref={sheet.scrollRef}
        onScroll={sheet.onScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={snapPoints.length > 0 ? layout.bodyFill : layout.body}
      >
        <html.div style={[nativeStyles.bodyContent, nativeStyles.hiddenBelow(sheet.hiddenBelow)]}>
          {children}
        </html.div>
      </Animated.ScrollView>
    </GestureDetector>
  )
}

interface CloseProps {
  children?: ReactNode
  'aria-label'?: string
}

function Close({children, 'aria-label': ariaLabel = 'Close'}: CloseProps) {
  const {requestClose} = useDrawer()
  if (children) return withPress(children, requestClose)
  return (
    <html.button onClick={requestClose} aria-label={ariaLabel} style={partStyles.closeButton}>
      <Icon name="x" size="sm" color="textMuted" />
    </html.button>
  )
}

export const Drawer = {
  Root,
  Trigger,
  Portal,
  Header,
  Title,
  Description,
  Body,
  Footer,
  Close,
}
