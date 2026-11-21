import {beforeEach, describe, expect, it, vi} from 'vitest'

// A one-component hook runtime: enough React to call the native Combobox's
// Root and Input as functions and drive their state. It follows Root's hook
// order through fixed slots (Input starts at slot 1000), so a hook added to
// Root.native or Input.native needs no change here unless it reorders them;
// a react-native test renderer would remove that coupling.
interface Ctx {
  _cur: unknown
}
const runtime = vi.hoisted(() => {
  const state = {
    slots: [] as unknown[],
    cursor: 0,
    effects: [] as Array<() => void>,
  }
  return state
})

vi.mock('react', () => {
  const slot = <T>(init: () => T) => {
    const index = runtime.cursor++
    if (!(index in runtime.slots)) runtime.slots[index] = init()
    return index
  }
  return {
    createContext: (initial: unknown) => {
      const context: Ctx & {Provider?: unknown} = {_cur: initial}
      context.Provider = {context}
      return context
    },
    useContext: (context: Ctx) => context._cur,
    useId: () => 'id',
    useMemo: <T>(make: () => T) => make(),
    useCallback: <T>(callback: T) => callback,
    useRef: <T>(initial: T) => {
      const index = slot(() => ({current: initial}))
      return runtime.slots[index]
    },
    useState: <T>(initial: T | (() => T)) => {
      const index = slot(() => (typeof initial === 'function' ? (initial as () => T)() : initial))
      const set = (next: T | ((previous: T) => T)) => {
        runtime.slots[index] =
          typeof next === 'function'
            ? (next as (previous: T) => T)(runtime.slots[index] as T)
            : next
      }
      return [runtime.slots[index], set]
    },
    useEffect: (effect: () => void) => {
      runtime.effects.push(effect)
    },
    useLayoutEffect: (effect: () => void) => {
      runtime.effects.push(effect)
    },
  }
})
vi.mock('react-native', () => ({Pressable: 'NativePressable', View: 'View'}))
vi.mock('react-native-gesture-handler', () => ({Pressable: 'Pressable'}))
vi.mock('react-strict-dom', () => ({html: new Proxy({}, {get: (_t, name) => String(name)})}))
vi.mock('@greenharness/greenrack-tokens/keys', () => ({DURATION_MS: {base: 0}}))
const emptyStyles = {styles: new Proxy({}, {get: () => ({})})}
vi.mock('../src/components/Combobox/styles.css', () => emptyStyles)
vi.mock('../src/components/Combobox/native.css', () => ({nativeStyles: emptyStyles.styles}))
vi.mock('../src/components/Select/native.css', () => ({nativeStyles: emptyStyles.styles}))
vi.mock('../src/components/Listbox/native.css', () => ({sheetStyles: emptyStyles.styles}))
vi.mock('../src/components/Drawer/Drawer', () => ({Drawer: {Root: 'Drawer.Root'}}))
vi.mock('../src/components/Listbox/Listbox', () => ({Listbox: {}}))
vi.mock('../src/components/Button/Button', () => ({Button: 'Button'}))
vi.mock('../src/components/Icon/Icon', () => ({Icon: 'Icon'}))
vi.mock('../src/components/SideNav/Chevron', () => ({Chevron: 'Chevron'}))
vi.mock('../src/shared/accessibilityFocus.native', () => ({focusForAccessibility: vi.fn()}))
vi.mock('../src/shared/focusInput.native', () => ({focusInput: vi.fn()}))

const {Combobox} = await import('../src/components/Combobox/Combobox.native')

interface El {
  type: unknown
  props: Record<string, any>
}
const isEl = (node: unknown): node is El =>
  typeof node === 'object' && node !== null && 'props' in node
function walk(node: unknown, out: El[] = []): El[] {
  if (!isEl(node)) return out
  out.push(node)
  const children = node.props.children
  for (const child of children == null ? [] : [children].flat(5)) walk(child, out)
  return out
}

function renderRoot(props: Record<string, unknown> = {}) {
  runtime.cursor = 0
  runtime.effects = []
  const tree = (Combobox.Root as (props: unknown) => El)({children: null, ...props})
  for (const effect of runtime.effects) {
    effect()
  }
  // Hand the Input the context the Root provides.
  ;(tree.type as {context: Ctx}).context._cur = tree.props.value
  const drawer = walk(tree).find((el) => el.type === 'Drawer.Root')!
  return {context: tree.props.value, drawer}
}

function renderInput(props: Record<string, unknown> = {}) {
  runtime.cursor = 1000
  runtime.effects = []
  const tree = (Combobox.Input as (props: unknown) => El)(props)
  return walk(tree).find((el) => el.type === 'NativePressable')!
}

beforeEach(() => {
  runtime.slots = []
})

describe('Combobox.native onOpenChange', () => {
  it('fires once on press and once on sheet dismiss, not on a repeat', () => {
    const onOpenChange = vi.fn()
    const {drawer} = renderRoot({onOpenChange})
    const press = renderInput({placeholder: 'Pick'})
    press.props.onPress()
    press.props.onPress()
    expect(onOpenChange.mock.calls).toEqual([[true]])
    drawer.props.onOpenChange(false)
    drawer.props.onOpenChange(false)
    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })
})

describe('Combobox.native Input accessibility', () => {
  it('names the field by aria-label, else the shown value, else the placeholder', () => {
    renderRoot({defaultValue: 'b', initialLabels: {b: 'Banana'}})
    const named = renderInput({placeholder: 'Pick', 'aria-label': 'Fruit'})
    expect(named.props.accessibilityLabel).toBe('Fruit')
    expect(named.props.accessibilityValue).toEqual({text: 'Banana'})

    const unnamed = renderInput({placeholder: 'Pick'})
    expect(unnamed.props.accessibilityLabel).toBe('Banana')
    expect(unnamed.props.accessibilityValue).toBeUndefined()

    runtime.slots = []
    renderRoot()
    const empty = renderInput({placeholder: 'Pick'})
    expect(empty.props.accessibilityLabel).toBe('Pick')
    const emptyNamed = renderInput({placeholder: 'Pick', 'aria-label': 'Fruit'})
    expect(emptyNamed.props.accessibilityLabel).toBe('Fruit')
    expect(emptyNamed.props.accessibilityValue).toBeUndefined()
  })
})
