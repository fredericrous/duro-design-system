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
  BackHandler,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  type GestureType,
} from 'react-native-gesture-handler'
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
import {DURATION_MS, LAYERS, SIZES_PX, SPACING_PX} from '@duro-app/tokens/keys'
import {ModalContext} from '../../shared/ModalContext'
import {devWarnOnce} from '../../shared/devWarnOnce'
import {OverlayModal} from '../../shared/portal/OverlayModal'
import {Portal as PortalLayer} from '../../shared/portal/PortalHost'
import {focusForAccessibility} from '../../shared/accessibilityFocus'
import {useSafeAreaInsets} from '../../shared/safeArea'
import {useKeyboardHeight} from '../../shared/useKeyboardHeight'
import {withPress} from '../../shared/pressableChild'
import {ControlContextBoundary} from '../Toolbar/ControlContextBoundary'
import {Icon} from '../Icon/Icon'
import {nativeStyles} from './native.css'
import {partStyles} from './parts.css'
import {
  DEFAULT_GRABBER_LABELS,
  DEFAULT_SIDE_GRABBER_LABELS,
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
  CROSS_SLOP,
  DISMISS_DURATION,
  DRAG_SLOP,
  SNAP_DURATION,
  SNAP_MAX_OVERSHOOT,
  cycleDetent,
  detentHeight,
  detentWidth,
  rubberBand,
  settleDetent,
  settleWidth,
  shouldDismissEdge,
} from './sheetPhysics'
import {useDrawerRoot, type DrawerRootProps} from './useDrawerRoot'

export type {DrawerAnchor, DrawerSize, SideSnapPoint, SnapPoint} from './parts'

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
 *
 * `modal={false}` draws the panel in the base portal host instead (no Modal,
 * no backdrop): the app behind stays touchable, and a Dialog opened later
 * covers it without remounting it.
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
  /**
   * `floating`: inset from the screen edge by a spacing token, rounded and bordered all round,
   * instead of `edge` (flush against it). For a non-modal drawer (Pane).
   */
  placement?: 'edge' | 'floating'
  /**
   * `dim` (default): a uniform scrim. `ramp`: clear above, ramping to the scrim colour over the
   * bottom `scrimRampH`. A press on either still dismisses a dismissable drawer. Modal drawers only.
   */
  backdrop?: 'dim' | 'ramp'
  /**
   * Content laid just above the panel's top edge, end-aligned; it moves with the panel but is
   * outside the panel's visual box.
   */
  above?: ReactNode
}

/** The ramp scrim has no gradient primitive on native: it is this many bands, stepped in opacity. */
const RAMP_BANDS = 16
const RAMP_BAND_HEIGHT = SIZES_PX.scrimRampH / RAMP_BANDS
const RAMP_BAND_OPACITIES = Array.from({length: RAMP_BANDS}, (_, band) => (band + 1) / RAMP_BANDS)

const PANEL_WIDTH = {sm: SIZES_PX.panelSm, md: SIZES_PX.panelMd, lg: SIZES_PX.panelLg} as const

/** A content-height bottom drawer is capped at 85% of the window, as the web caps it at 85vh. */
const CONTENT_SHEET_CAP = 0.85

const easeOut = Easing.out(Easing.cubic)
const easeIn = Easing.in(Easing.cubic)

function Portal({
  children,
  size: sizeProp,
  grabberLabels: grabberLabelsProp,
  placement = 'edge',
  backdrop = 'dim',
  above,
}: PortalProps) {
  const drawer = useDrawer()
  const {
    open,
    closing,
    closeDuration,
    anchor,
    dismissable,
    modal,
    swipeDismiss,
    requestClose,
    requestCloseImmediate,
    titleId,
    panelRef,
    snapPoints,
    sideSnapPoints,
    snapIndex,
    setSnapIndex,
  } = drawer
  const triggerRef = useContext(TriggerRefContext)
  const window = useWindowDimensions()
  const insets = useSafeAreaInsets()
  // A bottom drawer rides above the on-screen keyboard: its detents measure
  // from the keyboard's top edge, so a search field and its results stay seen.
  const keyboard = useKeyboardHeight()
  const lift = anchor === 'bottom' ? keyboard : 0
  const availableHeight = window.height - lift
  const bottom = anchor === 'bottom'
  const snapping = snapPoints.length > 0
  const floating = placement === 'floating'
  const size = sizeProp ?? 'md'
  const sizeIgnored = sideSnapPoints.length > 0 && sizeProp !== undefined
  useEffect(() => {
    if (sizeIgnored) {
      devWarnOnce(
        'Drawer',
        'side-snap-size',
        "Portal's size is ignored on a side drawer with snapPoints: the detent sets the width.",
      )
    }
  }, [sizeIgnored])
  // A floating panel keeps off the edge by this inset and by the safe area.
  const gap = floating ? SPACING_PX.md : 0
  // The skirt below a snap sheet that a pull past its top reveals; a floating card has no room for it.
  const overshoot = floating ? 0 : SNAP_MAX_OVERSHOOT
  const sideRoom = window.width - 2 * gap - (floating ? insets.left + insets.right : 0)
  const sideSnapping = sideSnapPoints.length > 0
  const grabberLabels =
    grabberLabelsProp ?? (sideSnapping ? DEFAULT_SIDE_GRABBER_LABELS : DEFAULT_GRABBER_LABELS)
  // A floating panel sits in from the edge: it needs that much more room to be fully off screen.
  const slack = floating
    ? SPACING_PX.md + (bottom ? insets.bottom : Math.max(insets.left, insets.right))
    : 0
  const detentWidths = useMemo(
    () => sideSnapPoints.map((p) => detentWidth(p, sideRoom)),
    [sideSnapPoints, sideRoom],
  )

  const heights = useMemo(
    () =>
      snapPoints.map((p) =>
        detentHeight(p, availableHeight - gap - (floating ? insets.bottom : 0), insets.top + gap),
      ),
    [snapPoints, availableHeight, insets.top, insets.bottom, gap, floating],
  )
  const high = heights.length > 0 ? heights[heights.length - 1] : 0
  // Where the panel rests at its detent: its offset below its own full height.
  const rest = snapping ? high - heights[snapIndex] : 0
  // Off screen: the whole panel past its edge (a snap sheet's overshoot skirt included).
  const hidden = (snapping ? high + overshoot : bottom ? window.height : window.width) + slack

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

  // A side drawer with detents: its width, animated between them.
  const sideWidth = useSharedValue(detentWidths[snapIndex] ?? 0)
  useEffect(() => {
    if (detentWidths.length === 0) return
    sideWidth.value = withTiming(detentWidths[snapIndex] ?? detentWidths[0], {
      duration: DURATION_MS.base,
      easing: easeOut,
    })
  }, [detentWidths, snapIndex, sideWidth])

  // Android back closes a non-modal drawer, as an RN Modal's request does for a modal one.
  useEffect(() => {
    if (!open || modal || !dismissable) return
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      requestClose()
      return true
    })
    return () => subscription.remove()
  }, [open, modal, dismissable, requestClose])

  const widthsShared = useSharedValue(detentWidths)
  useEffect(() => {
    widthsShared.value = detentWidths
  }, [detentWidths, widthsShared])

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
  // A drag on a side drawer's grabber resizes it between its detents. It wins over the swipe
  // that dismisses: the panel's pan waits for this one to fail.
  const growSign = anchor === 'left' ? 1 : -1
  const grabberPan = useMemo(() => {
    const grow = (e: {translationX: number}) => {
      'worklet'
      return growSign * e.translationX
    }
    return Gesture.Pan()
      .enabled(sideSnapping)
      .activeOffsetX([-DRAG_SLOP, DRAG_SLOP])
      .failOffsetY([-CROSS_SLOP, CROSS_SLOP])
      .onStart(() => {
        start.value = sideWidth.value
      })
      .onUpdate((e) => {
        const detents = widthsShared.value
        if (detents.length === 0) return
        sideWidth.value = Math.min(
          detents[detents.length - 1],
          Math.max(detents[0], start.value + grow(e)),
        )
      })
      .onEnd((e) => {
        const detents = widthsShared.value
        if (detents.length === 0) return
        const settled = settleWidth({
          widths: detents,
          from: index.value,
          width: sideWidth.value,
          velocity: (growSign * e.velocityX) / 1000,
        })
        sideWidth.value = withTiming(detents[settled], {duration: SNAP_DURATION, easing: easeOut})
        if (settled !== index.value) {
          index.value = settled
          scheduleOnRN(setSnapIndex, settled)
        }
      })
  }, [growSign, sideSnapping, start, sideWidth, widthsShared, index, setSnapIndex])
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
        if (snapping) offset.value = next < 0 ? -rubberBand(-next, overshoot) : next
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
    if (bottom) {
      return gesture.activeOffsetY([-DRAG_SLOP, DRAG_SLOP]).failOffsetX([-CROSS_SLOP, CROSS_SLOP])
    }
    const sideways = gesture
      .activeOffsetX([-DRAG_SLOP, DRAG_SLOP])
      .failOffsetY([-CROSS_SLOP, CROSS_SLOP])
    return sideSnapping ? sideways.requireExternalGestureToFail(grabberPan) : sideways
  }, [
    sideSnapping,
    grabberPan,
    bottom,
    horizontalSign,
    snapping,
    swipeDismiss,
    canDismiss,
    hidden,
    overshoot,
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

  const panelMotion = useAnimatedStyle(() => {
    if (bottom) return {transform: [{translateY: offset.value}]}
    const slide = {transform: [{translateX: offset.value * horizontalSign}]}
    return sideSnapping ? {...slide, width: sideWidth.value} : slide
  })
  const backdropMotion = useAnimatedStyle(() => {
    if (snapping) {
      const hs = heightsShared.value
      const visible = hs[hs.length - 1] - offset.value
      return {opacity: Math.min(1, Math.max(0, visible / hs[0]))}
    }
    return {opacity: Math.min(1, Math.max(0, 1 - offset.value / extent.value))}
  })

  // A non-modal pane has no Modal to report that it is shown: the first layout is that moment.
  const shown = useRef(false)
  useEffect(() => {
    if (!open) shown.current = false
  }, [open])
  const onPanelLayout = (e: LayoutChangeEvent) => {
    const {width, height} = e.nativeEvent.layout
    extent.value = bottom ? height : width
    if (!modal && open && !shown.current) {
      shown.current = true
      focusForAccessibility(panelRef.current, 'Drawer')
    }
  }

  // A floating panel's frame is its offset from each edge, safe area included.
  const frame = floating
    ? {
        top: gap + insets.top,
        bottom: gap + insets.bottom,
        left: gap + insets.left,
        right: gap + insets.right,
      }
    : null
  const where = bottom
    ? snapping
      ? [
          layout.bottom,
          {
            height: high + overshoot,
            bottom: lift - overshoot + (frame?.bottom ?? 0),
          },
          frame && {left: frame.left, right: frame.right},
        ]
      : [
          layout.bottom,
          {bottom: lift + (frame?.bottom ?? 0), maxHeight: availableHeight * CONTENT_SHEET_CAP},
          frame && {left: frame.left, right: frame.right},
        ]
    : [
        layout.side,
        anchor === 'left' ? layout.left : layout.right,
        sideSnapping ? null : {maxWidth: Math.min(PANEL_WIDTH[size], sideRoom)},
        frame && {
          top: frame.top,
          bottom: frame.bottom,
          ...(anchor === 'left' ? {left: frame.left} : {right: frame.right}),
        },
      ]
  const padTop = bottom || floating ? 0 : insets.top
  const padBottom = (lift > 0 || floating ? 0 : insets.bottom) + (snapping ? overshoot : 0)

  const detentCount = sideSnapping ? sideSnapPoints.length : snapPoints.length
  const nextIndex = cycleDetent(snapIndex, detentCount)
  const onGrabberAction = (e: AccessibilityActionEvent) => {
    if (e.nativeEvent.actionName === 'increment') {
      setSnapIndex(Math.min(snapIndex + 1, detentCount - 1))
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

  const grabberPress = (snapping || sideSnapping) && (
    <Pressable
      accessibilityRole="adjustable"
      accessibilityLabel={nextIndex > snapIndex ? grabberLabels.expand : grabberLabels.collapse}
      accessibilityValue={{text: sideSnapping ? sideSnapPoints[snapIndex] : snapPoints[snapIndex]}}
      accessibilityActions={[{name: 'increment'}, {name: 'decrement'}]}
      onAccessibilityAction={onGrabberAction}
      onPress={() => setSnapIndex(nextIndex)}
      style={
        sideSnapping
          ? [
              layout.sideGrabber,
              anchor === 'left' ? layout.sideGrabberLeft : layout.sideGrabberRight,
            ]
          : undefined
      }
    >
      <html.div style={sideSnapping ? nativeStyles.grabberHitSide : partStyles.grabberHit}>
        <html.div style={sideSnapping ? nativeStyles.grabberVertical : partStyles.grabber} />
      </html.div>
    </Pressable>
  )
  const grabber =
    sideSnapping && grabberPress ? (
      <GestureDetector gesture={grabberPan}>{grabberPress}</GestureDetector>
    ) : (
      grabberPress
    )

  const panel = (
    <GestureDetector gesture={pan}>
      <Animated.View
        ref={panelRef as RefObject<View | null>}
        accessibilityViewIsModal={modal}
        onLayout={onPanelLayout}
        style={[where, panelMotion]}
      >
        {above != null && above !== false && (
          <View style={layout.above} pointerEvents="box-none">
            <ControlContextBoundary>{above}</ControlContextBoundary>
          </View>
        )}
        <html.div
          role="dialog"
          aria-modal={modal ? true : undefined}
          aria-labelledby={titleId}
          style={[
            nativeStyles.panel,
            floating && nativeStyles.panelFloating,
            !floating && bottom && nativeStyles.panelBottom,
            !floating && anchor === 'right' && nativeStyles.panelRight,
            !floating && anchor === 'left' && nativeStyles.panelLeft,
            nativeStyles.insets(padTop, padBottom),
          ]}
        >
          {grabber}
          {modal ? (
            <ModalContext.Provider value={true}>
              <ControlContextBoundary>
                <SheetScrollContext.Provider value={sheetScroll}>
                  {children}
                </SheetScrollContext.Provider>
              </ControlContextBoundary>
            </ModalContext.Provider>
          ) : (
            <ControlContextBoundary>
              <SheetScrollContext.Provider value={sheetScroll}>
                {children}
              </SheetScrollContext.Provider>
            </ControlContextBoundary>
          )}
        </html.div>
      </Animated.View>
    </GestureDetector>
  )

  // Non-modal: no Modal and no backdrop. The panel draws in the base host, below any Dialog opened
  // later and mounted once; the portal carries only the theme, so the Drawer's own contexts are
  // provided again here.
  if (!modal) {
    if (!open) return null
    return (
      <PortalLayer layer={LAYERS.floating} host="base">
        <GestureHandlerRootView style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <DrawerContext.Provider value={drawer}>
            <TriggerRefContext.Provider value={triggerRef}>{panel}</TriggerRefContext.Provider>
          </DrawerContext.Provider>
        </GestureHandlerRootView>
      </PortalLayer>
    )
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
          {backdrop === 'ramp' ? (
            <html.div aria-hidden style={nativeStyles.rampStack}>
              {RAMP_BAND_OPACITIES.map((opacity) => (
                <html.div
                  key={opacity}
                  aria-hidden
                  style={nativeStyles.rampBand(RAMP_BAND_HEIGHT, opacity)}
                />
              ))}
            </html.div>
          ) : (
            <html.div aria-hidden style={[nativeStyles.fill, nativeStyles.scrim]} />
          )}
        </Pressable>
      </Animated.View>
      {panel}
    </OverlayModal>
  )
}

// Layout-only RN styles: where the moving panel sits before it moves.
const layout = StyleSheet.create({
  bottom: {position: 'absolute', left: 0, right: 0, bottom: 0},
  side: {position: 'absolute', top: 0, bottom: 0, width: '100%'},
  left: {left: 0},
  right: {right: 0},
  // The side grabber: a strip down the panel's inner edge.
  sideGrabber: {position: 'absolute', top: 0, bottom: 0, zIndex: 1},
  sideGrabberLeft: {right: 0},
  sideGrabberRight: {left: 0},
  // The above slot: just over the panel's top edge, end-aligned, riding with the panel.
  above: {position: 'absolute', bottom: '100%', right: 0, paddingBottom: SPACING_PX.sm},
  body: {flexGrow: 0, flexShrink: 1},
  bodyFill: {flex: 1},
})

/**
 * Native Body: a ScrollView, since a native div does not scroll its
 * overflow. In a bottom sheet the drag defers to it: the list scrolls, and
 * moves the sheet only from its top.
 */
interface BodyProps {
  children: ReactNode
  /** No side padding: rows that run to the panel's edges, as a picker's list. */
  flush?: boolean
}

function Body({children, flush = false}: BodyProps) {
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
        // Presses inside the sheet keep the keyboard up. A ScrollView above the
        // sheet's Modal can still take the first touch, which is why picker
        // rows use Gesture Handler's Pressable (Listbox.native).
        keyboardShouldPersistTaps="handled"
        style={snapPoints.length > 0 ? layout.bodyFill : layout.body}
      >
        <html.div
          style={[
            nativeStyles.bodyContent,
            flush && nativeStyles.bodyFlush,
            nativeStyles.hiddenBelow(sheet.hiddenBelow),
          ]}
        >
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
