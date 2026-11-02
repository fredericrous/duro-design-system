import {
  type ReactNode,
  type RefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import {html} from 'react-strict-dom'
import type {Length} from '../../shared/length'
import {Button} from '../Button/Button'
import {List} from '../List/List'
import {focusFirstIn} from './focus'
import {Scroller} from './Scroller'
import {styles} from './styles.css'

// --- Context ---

interface SteppedListContextValue {
  /** Step ids from the first step to the one on top. */
  stack: readonly string[]
  backLabel: string
  maxHeight: Length
  /** Opens `step`; `opener` is the row that asked, which gets focus back on pop. */
  push: (step: string, opener: HTMLElement | null) => void
  pop: () => void
  /** Set once a step was pushed: the first step never takes focus on mount. */
  navigated: RefObject<boolean>
}

const SteppedListContext = createContext<SteppedListContextValue | null>(null)

function useSteppedListContext(part: string) {
  const ctx = useContext(SteppedListContext)
  if (!ctx) throw new Error(`SteppedList.${part} must be used within SteppedList.Root`)
  return ctx
}

// --- Root ---

interface RootProps {
  /** The Steps. The one named by `defaultStep` shows first. */
  children: ReactNode
  /** The id of the Step shown first. */
  defaultStep: string
  /** Text of the back control, from the caller (the catalog's entry). */
  backLabel: string
  /** Cap of a step's rows, a `sizes` token key: taller rows scroll. Default: `listMaxH`. */
  maxHeight?: Length
}

function Root({children, defaultStep, backLabel, maxHeight = 'listMaxH'}: RootProps) {
  const [stack, setStack] = useState<readonly string[]>([defaultStep])
  const stackRef = useRef(stack)
  const openers = useRef<Array<HTMLElement | null>>([])
  const navigated = useRef(false)
  const refocus = useRef<HTMLElement | null>(null)

  const push = useCallback((step: string, opener: HTMLElement | null) => {
    navigated.current = true
    openers.current[stackRef.current.length - 1] = opener
    stackRef.current = [...stackRef.current, step]
    setStack(stackRef.current)
  }, [])

  const pop = useCallback(() => {
    if (stackRef.current.length < 2) return
    refocus.current = openers.current[stackRef.current.length - 2] ?? null
    stackRef.current = stackRef.current.slice(0, -1)
    setStack(stackRef.current)
  }, [])

  // Back on the lower step: focus returns to the row that opened the one just closed.
  useEffect(() => {
    const row = refocus.current
    refocus.current = null
    focusFirstIn(row)
  }, [stack])

  const value = useMemo(
    () => ({stack, backLabel, maxHeight, push, pop, navigated}),
    [stack, backLabel, maxHeight, push, pop],
  )
  return (
    <SteppedListContext.Provider value={value}>
      <html.div style={styles.root}>{children}</html.div>
    </SteppedListContext.Provider>
  )
}

// --- Step ---

interface StepProps {
  /** Names the Step for `defaultStep` and for an Item's `to`. */
  id: string
  /** The step's heading, which also names the group. */
  title: string
  /** An input row between the heading and the rows (a search field). */
  input?: ReactNode
  /** The step's rows: a List.Root with SteppedList.Items. */
  children: ReactNode
}

function Step({id, title, input, children}: StepProps) {
  const {stack, backLabel, maxHeight, pop, navigated} = useSteppedListContext('Step')
  const titleId = useId()
  const rowsHost = useRef<HTMLDivElement>(null)
  const index = stack.indexOf(id)
  const mounted = index !== -1

  // A step opened from a row takes focus on its first row.
  useEffect(() => {
    if (mounted && navigated.current) focusFirstIn(rowsHost.current)
  }, [mounted, navigated])

  if (!mounted) return null
  const isTop = index === stack.length - 1
  return (
    <html.div
      role="group"
      aria-labelledby={titleId}
      style={[styles.step, !isTop && styles.stepHidden]}
    >
      <html.div style={styles.header}>
        {index > 0 ? (
          <Button variant="secondary" size="small" onClick={pop}>
            {backLabel}
          </Button>
        ) : null}
        <html.p id={titleId} style={styles.title}>
          {title}
        </html.p>
      </html.div>
      {input != null ? <html.div style={styles.input}>{input}</html.div> : null}
      <html.div ref={rowsHost}>
        <Scroller maxHeight={maxHeight}>{children}</Scroller>
      </html.div>
    </html.div>
  )
}

// --- Item ---

interface ItemProps {
  /** The id of the Step this row opens. */
  to: string
  children: ReactNode
  selected?: boolean
  disabled?: boolean
}

/** A List.Item whose press pushes the step named by `to`. */
function Item({to, children, selected, disabled}: ItemProps) {
  const {push} = useSteppedListContext('Item')
  const row = useRef<HTMLDivElement>(null)
  return (
    <List.Item
      ref={row}
      selected={selected}
      disabled={disabled}
      onClick={() => push(to, row.current)}
    >
      {children}
    </List.Item>
  )
}

export const SteppedList = {
  Root,
  Step,
  Item,
}
