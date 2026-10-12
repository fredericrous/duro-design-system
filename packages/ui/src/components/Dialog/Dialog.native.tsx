import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import {html} from 'react-strict-dom'
import type {DurationToken} from '@duro-app/tokens/keys'
import {mergeRefs} from '../../shared/mergeRefs'
import {ModalContext} from '../../shared/ModalContext'
import {OverlayModal} from '../../shared/portal/OverlayModal'
import {focusForAccessibility} from '../../shared/accessibilityFocus'
import {useOverlayOpenState} from '../../shared/useOverlayOpenState'
import {ControlContextBoundary} from '../Toolbar/ControlContextBoundary'
import {Icon} from '../Icon/Icon'
import {nativeStyles} from './native.css'
import {partStyles} from './parts.css'
import {
  Description,
  DialogContext,
  Footer,
  Header,
  Title,
  useDialog,
  type DialogSize,
} from './parts'

export type {DialogSize}

const exitDurationMap = {
  instant: nativeStyles.exitInstant,
  minimal: nativeStyles.exitMinimal,
  quick: nativeStyles.exitQuick,
  fast: nativeStyles.exitFast,
  brisk: nativeStyles.exitBrisk,
  base: nativeStyles.exitBase,
  slow: nativeStyles.exitSlow,
} as const satisfies Record<DurationToken, unknown>

/** Native-only wiring: where accessibility focus goes on open and returns on close. */
interface NativeDialogContextValue {
  triggerRef: RefObject<unknown>
  panelRef: RefObject<View | null>
  closeOnEscape: boolean
}

const NativeDialogContext = createContext<NativeDialogContextValue | null>(null)

function useNativeDialog() {
  const ctx = useContext(NativeDialogContext)
  if (!ctx) throw new Error('Dialog compound components must be used within Dialog.Root')
  return ctx
}

interface RootProps {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Whether pressing the backdrop closes the dialog. Default: true */
  dismissable?: boolean
  /** Whether Android's back button closes the dialog (Escape on the web). Default: true */
  closeOnEscape?: boolean
  /** Web only: on native, screen-reader focus moves to the dialog itself. */
  initialFocus?: RefObject<HTMLElement | null>
  closeAnimationDuration?: DurationToken
}

/**
 * Native Dialog (plan N0, Slice A): the same compound API, rendered in an
 * OverlayModal. The backdrop press and Android's back button close it; the
 * screen reader's focus moves into the panel on open and back to the trigger
 * on close.
 */
function Root({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  dismissable = true,
  closeOnEscape = true,
  closeAnimationDuration = 'fast',
}: RootProps) {
  const {present, closing, requestOpen, requestClose} = useOverlayOpenState({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    exitDuration: closeAnimationDuration,
    closeNotice: 'after-exit',
  })
  const titleId = useId()
  const descriptionId = useId()
  const popupRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<unknown>(null)
  const panelRef = useRef<View>(null)
  const registerClose = useCallback(() => () => {}, [])

  // Back to the trigger once the dialog is gone.
  const wasPresent = useRef(present)
  useEffect(() => {
    if (wasPresent.current && !present) focusForAccessibility(triggerRef.current, 'Dialog')
    wasPresent.current = present
  }, [present])

  return (
    <DialogContext.Provider
      value={{
        open: present,
        closing,
        closeDuration: closeAnimationDuration,
        dismissable,
        requestOpen,
        requestClose,
        titleId,
        descriptionId,
        popupRef,
        registerClose,
      }}
    >
      <NativeDialogContext.Provider value={{triggerRef, panelRef, closeOnEscape}}>
        {children}
      </NativeDialogContext.Provider>
    </DialogContext.Provider>
  )
}

interface PressableChildProps {
  onClick?: () => void
  ref?: Ref<unknown>
}

/**
 * Opens the dialog from its one child (a Button). Native presses do not
 * bubble to a wrapper as web clicks do, so the child gets the handler, and
 * its ref is where focus returns on close.
 */
function Trigger({children}: {children: ReactNode}) {
  const {requestOpen} = useDialog()
  const {triggerRef} = useNativeDialog()
  const child = Children.only(children)
  if (!isValidElement<PressableChildProps>(child)) return null
  const own = child.props.onClick
  return cloneElement(child as ReactElement<PressableChildProps>, {
    ref: mergeRefs(child.props.ref, triggerRef),
    onClick: () => {
      own?.()
      requestOpen()
    },
  })
}

interface PortalProps {
  children: ReactNode
  size?: DialogSize
}

function Portal({children, size = 'md'}: PortalProps) {
  const {open, closing, closeDuration, dismissable, requestClose, titleId} = useDialog()
  const {panelRef, closeOnEscape} = useNativeDialog()
  // First frame hidden, then shown: the enter transition has a start state.
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    if (!open) {
      setEntered(false)
      return
    }
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [open])

  // 85% of the window, as the web caps the panel at 85vh.
  const maxPanelHeight = useWindowDimensions().height * 0.85
  const shown = entered && !closing
  const visibility = shown ? nativeStyles.shown : nativeStyles.hidden
  return (
    <OverlayModal
      visible={open}
      onRequestClose={() => {
        if (closeOnEscape) requestClose()
      }}
      onShow={() => focusForAccessibility(panelRef.current, 'Dialog')}
    >
      <html.div
        aria-hidden
        onClick={dismissable ? requestClose : undefined}
        style={[
          nativeStyles.fill,
          nativeStyles.backdrop,
          shown ? nativeStyles.shown : nativeStyles.hidden,
          closing && exitDurationMap[closeDuration],
        ]}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={StyleSheet.absoluteFill}
        pointerEvents="box-none"
      >
        <View style={localStyles.viewport} pointerEvents="box-none">
          <html.div style={nativeStyles.inset}>
            <View ref={panelRef} accessibilityViewIsModal style={localStyles.panelHost}>
              <html.div
                role="dialog"
                aria-modal
                aria-labelledby={titleId}
                style={[
                  nativeStyles.popup,
                  nativeStyles.maxHeight(maxPanelHeight),
                  partStyles[size],
                  visibility,
                  closing && exitDurationMap[closeDuration],
                ]}
              >
                <ModalContext.Provider value={true}>
                  <ControlContextBoundary>{children}</ControlContextBoundary>
                </ModalContext.Provider>
              </html.div>
            </View>
          </html.div>
        </View>
      </KeyboardAvoidingView>
    </OverlayModal>
  )
}

// Layout-only RN views: the centring viewport lets presses outside the panel
// through to the backdrop (`box-none`, which RSD styles cannot express), and
// the panel host spans the width so the panel's size cap applies.
const localStyles = StyleSheet.create({
  viewport: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  panelHost: {width: '100%', alignItems: 'center'},
  body: {flexGrow: 0, flexShrink: 1},
})

/** Native Body: a ScrollView, since a native div does not scroll its overflow. */
function Body({children}: {children: ReactNode}) {
  return (
    <ScrollView style={localStyles.body}>
      <html.div style={nativeStyles.bodyContent}>{children}</html.div>
    </ScrollView>
  )
}

interface CloseProps {
  children?: ReactNode
  'aria-label'?: string
}

function Close({children, 'aria-label': ariaLabel = 'Close'}: CloseProps) {
  const {requestClose} = useDialog()
  if (children) {
    const child = Children.only(children)
    if (!isValidElement<PressableChildProps>(child)) return null
    const own = child.props.onClick
    return cloneElement(child as ReactElement<PressableChildProps>, {
      onClick: () => {
        own?.()
        requestClose()
      },
    })
  }
  return (
    <html.button onClick={requestClose} aria-label={ariaLabel} style={partStyles.closeButton}>
      <Icon name="x" size="sm" color="textMuted" />
    </html.button>
  )
}

export const Dialog = {
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
