import {beforeEach, describe, expect, it, vi} from 'vitest'

const followLink = vi.fn()
vi.mock('../src/shared/followLink.native', () => ({followLink}))
vi.mock('react-strict-dom', () => ({html: {li: 'li', ul: 'ul', div: 'div', span: 'span'}}))
vi.mock('../src/components/Tree/styles.css', () => ({
  styles: new Proxy({indentPx: () => ({})}, {get: (t, k) => (k in t ? (t as never)[k] : {})}),
}))

const {TreeRow} = await import('../src/components/Tree/TreeRow.native')

interface El {
  type: unknown
  props: Record<string, any>
}
const isEl = (n: unknown): n is El => typeof n === 'object' && n !== null && 'props' in n

function kids(n: El): unknown[] {
  const c = n.props.children
  return c == null ? [] : Array.isArray(c) ? c.flat() : [c]
}
function walk(n: unknown, out: El[] = []): El[] {
  if (!isEl(n)) return out
  out.push(n)
  for (const k of kids(n)) walk(k, out)
  return out
}

function render(over: Partial<Parameters<typeof TreeRow>[0]> = {}) {
  const onSelect = vi.fn()
  const onToggle = vi.fn()
  const root = TreeRow({
    value: 'v',
    level: 1,
    label: 'Operations',
    meta: '31',
    text: 'Operations',
    hasChildren: false,
    open: false,
    selected: false,
    tabStop: false,
    ringed: false,
    labelId: 'l',
    metaId: 'm',
    onSelect,
    onToggle,
    branch: null,
    ...over,
  }) as unknown as El
  const all = walk(root)
  const press = all.find(
    (e) => e.props.role === 'link' || (e.props.role === 'button' && !('aria-expanded' in e.props)),
  )!
  const chevron = all.find((e) => 'aria-expanded' in e.props)
  return {root, all, press, chevron, onSelect, onToggle}
}

beforeEach(() => followLink.mockReset())

describe('TreeRow.native', () => {
  for (const hasChildren of [false, true]) {
    for (const href of [undefined, '/docs']) {
      const name = `${hasChildren ? 'branch' : 'leaf'} ${href ? 'with' : 'without'} href`
      it(`${name}: role, selection state, press`, () => {
        const onNavigate = vi.fn()
        const {press, onSelect, root} = render({hasChildren, href, onNavigate, selected: true})
        expect(press.props.role).toBe(href ? 'link' : 'button')
        expect(press.props['aria-selected']).toBe(true)
        expect('aria-expanded' in press.props).toBe(false)
        expect('aria-labelledby' in press.props).toBe(false)
        expect(root.props.role).toBe('none')
        press.props.onClick()
        expect(onSelect).toHaveBeenCalledTimes(1)
        if (href) {
          expect(followLink).toHaveBeenCalledTimes(1)
          expect(followLink).toHaveBeenCalledWith('/docs', onNavigate, 'Tree.Item')
        } else {
          expect(followLink).not.toHaveBeenCalled()
        }
      })
    }
  }

  it('a branch has a chevron control, a sibling of the press target', () => {
    const {root, press, chevron, onToggle, onSelect} = render({hasChildren: true, open: true})
    expect(chevron).toBeDefined()
    expect(chevron!.props.role).toBe('button')
    expect(chevron!.props['aria-expanded']).toBe(true)
    expect(chevron!.props['aria-label']).toBe('Operations')
    expect(walk(press)).not.toContain(chevron)
    expect(walk(chevron!)).not.toContain(press)
    const row = walk(root).find((e) => kids(e).includes(press))!
    expect(kids(row)).toContain(chevron)
    chevron!.props.onClick()
    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('expandLabel names the chevron control', () => {
    const {chevron} = render({hasChildren: true, expandLabel: (l) => `Toggle ${l}`})
    expect(chevron!.props['aria-label']).toBe('Toggle Operations')
  })

  it('a leaf has no chevron control and its spacer is inside the press target', () => {
    const {chevron, press, all} = render()
    expect(chevron).toBeUndefined()
    const inside = walk(press)
    const spacers = all.filter((e) => e.type === 'div' && kids(e).length === 0)
    expect(spacers).toHaveLength(1)
    expect(inside).toContain(spacers[0])
  })

  it('wraps no span around the meta node', () => {
    const meta = {type: 'meta-node', props: {}}
    const {all} = render({meta: meta as never})
    const holder = all.find((e) => kids(e).includes(meta))!
    expect(holder.type).toBe('div')
  })

  it('warns once for an href without onNavigate', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render({href: '/a'})
    render({href: '/b'})
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('onNavigate'))).toHaveLength(1)
    warn.mockRestore()
  })
})
