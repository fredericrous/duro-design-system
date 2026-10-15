import {Profiler, useEffect, useLayoutEffect, useRef, useState} from 'react'
import {flushSync} from 'react-dom'
import {html} from 'react-strict-dom'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {Tree} from './Tree'
import {Badge} from '../Badge/Badge'
import {Inline} from '../Inline/Inline'
import {Text} from '../Text/Text'
import {clickLink} from '../../docs/clickLink'
import {onThemeSurface} from '../../docs/themedSurface'
import type {OnNavigate} from '../../shared/navigate'

const meta: Meta = {
  title: 'Components/Tree',
}

export default meta
type Story = StoryObj

function Landscape(props: {
  defaultExpanded?: string[]
  onValueChange?: (v: string) => void
  value?: string | null
}) {
  return (
    <Tree.Root
      aria-label="Blocs"
      defaultExpanded={props.defaultExpanded}
      onValueChange={props.onValueChange}
      value={props.value}
    >
      <Tree.Item value="energy" label="Core business — Energy" meta="3 zones">
        <Tree.Item value="generation" label="Generation" meta="4 apps" />
        <Tree.Item value="network" label="Network operations">
          <Tree.Item value="scada" label="SCADA supervision" />
          <Tree.Item value="outage" label="Outage management" />
        </Tree.Item>
        <Tree.Item value="metering" label="Metering & data" />
      </Tree.Item>
      <Tree.Item value="market" label="Market & field">
        <Tree.Item value="trading" label="Trading" />
      </Tree.Item>
      <Tree.Item value="finance" label="Finance & steering" />
    </Tree.Root>
  )
}

export const Default: Story = {
  render: () => <Landscape defaultExpanded={['energy']} />,
  play: async ({canvas, userEvent}) => {
    const tree = canvas.getByRole('tree', {name: 'Blocs'})
    await expect(tree).toBeInTheDocument()

    const energy = canvas.getByRole('treeitem', {name: /Core business/})
    await expect(energy).toHaveAttribute('aria-expanded', 'true')
    await expect(energy).toHaveAttribute('aria-level', '1')
    const generation = canvas.getByRole('treeitem', {name: /Generation/})
    await expect(generation).toHaveAttribute('aria-level', '2')
    // a leaf has no expanded state at all
    await expect(generation).not.toHaveAttribute('aria-expanded')
    // a closed branch renders no children
    await expect(canvas.queryByRole('treeitem', {name: /SCADA/})).toBeNull()

    // one tab stop: the first item
    await expect(energy).toHaveAttribute('tabindex', '0')
    await expect(generation).toHaveAttribute('tabindex', '-1')

    // a click selects the row
    await userEvent.click(canvas.getByText('Generation'))
    await expect(generation).toHaveAttribute('aria-selected', 'true')
    await expect(energy).toHaveAttribute('aria-selected', 'false')
  },
}

export const KeyboardNavigation: Story = {
  render: () => <Landscape />,
  play: async ({canvas, userEvent}) => {
    const item = (name: RegExp) => canvas.getByRole('treeitem', {name})
    await userEvent.tab()
    await expect(item(/Core business/)).toHaveFocus()

    // → opens the branch, → again goes to its first child
    await userEvent.keyboard('{ArrowRight}')
    await expect(item(/Core business/)).toHaveAttribute('aria-expanded', 'true')
    await expect(item(/Core business/)).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(item(/Generation/)).toHaveFocus()

    // ↓ walks the visible items; ↓ onto a closed branch, → opens it
    await userEvent.keyboard('{ArrowDown}')
    await expect(item(/Network operations/)).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}{ArrowDown}')
    await expect(item(/SCADA/)).toHaveFocus()
    await expect(item(/SCADA/)).toHaveAttribute('aria-level', '3')

    // ← on a leaf goes to the parent; ← on an open branch closes it
    await userEvent.keyboard('{ArrowLeft}')
    await expect(item(/Network operations/)).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect(item(/Network operations/)).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.queryByRole('treeitem', {name: /SCADA/})).toBeNull()

    // Home / End
    await userEvent.keyboard('{End}')
    await expect(item(/Finance/)).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect(item(/Core business/)).toHaveFocus()

    // Enter selects; the tab stop follows focus
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect(item(/Generation/)).toHaveAttribute('aria-selected', 'true')
    await expect(item(/Generation/)).toHaveAttribute('tabindex', '0')
    await expect(item(/Core business/)).toHaveAttribute('tabindex', '-1')
  },
}

export const Typeahead: Story = {
  render: () => <Landscape defaultExpanded={['energy']} />,
  play: async ({canvas, userEvent}) => {
    const item = (name: RegExp) => canvas.getByRole('treeitem', {name})
    await userEvent.tab()
    // a letter jumps to the next visible item starting with it
    await userEvent.keyboard('m')
    await expect(item(/Metering/)).toHaveFocus()
    // the same letter again cycles to the next match
    await userEvent.keyboard('m')
    await expect(item(/Market/)).toHaveFocus()
    // a pause starts a new search; a prefix typed in one go narrows
    await new Promise((r) => setTimeout(r, 600))
    await userEvent.keyboard('fi')
    await expect(item(/Finance/)).toHaveFocus()
  },
}

function ControlledTree() {
  const [value, setValue] = useState<string | null>('trading')
  return (
    <>
      <Landscape defaultExpanded={['market']} value={value} onValueChange={setValue} />
      <html.span role="status" aria-label="Selected">
        {value}
      </html.span>
    </>
  )
}

export const Controlled: Story = {
  render: () => <ControlledTree />,
  play: async ({canvas, userEvent}) => {
    const trading = canvas.getByRole('treeitem', {name: /Trading/})
    await expect(trading).toHaveAttribute('aria-selected', 'true')
    // the selection holds the tab stop
    await expect(trading).toHaveAttribute('tabindex', '0')
    await userEvent.click(canvas.getByText('Finance & steering'))
    await expect(canvas.getByLabelText('Selected')).toHaveTextContent('finance')
  },
}

function DocsTree(props: {onNavigate?: OnNavigate; defaultValue?: string}) {
  const {onNavigate} = props
  return (
    <Tree.Root
      aria-label="Docs"
      defaultExpanded={['architecture', 'operations']}
      defaultValue={props.defaultValue}
    >
      <Tree.Item value="start" label="Start here" href="#start" onNavigate={onNavigate} />
      <Tree.Item value="architecture" label="Architecture" meta="4">
        <Tree.Item
          value="clusters"
          label="Clusters and bootstrap"
          href="#clusters"
          onNavigate={onNavigate}
        />
        <Tree.Item value="ai-ops" label="AI-ops platform" href="#ai-ops" onNavigate={onNavigate} />
        <Tree.Item
          value="secrets"
          label="Secrets and Vault"
          href="#secrets"
          onNavigate={onNavigate}
        />
      </Tree.Item>
      <Tree.Item value="operations" label="Operations" meta="31">
        <Tree.Item value="runbooks" label="Runbooks" href="#runbooks" onNavigate={onNavigate} />
      </Tree.Item>
    </Tree.Root>
  )
}

/**
 * Items with `href`: each row is a real link (cmd-click opens a tab, "Copy
 * link" works) that stays out of the tab order, so the tree keeps one tab stop
 * and its keyboard. Enter follows the link through `onNavigate`.
 */
export const WithLinks: StoryObj<{onNavigate: OnNavigate}> = {
  parameters: {
    a11y: {
      test: 'error',
      // holds-until: https://github.com/fredericrous/duro-design-system/issues/79
      // — the selected row's accent on bgCardHover is 6.76:1, under AAA's
      // 7:1 (AA passes). Re-enable this rule when that pair reaches 7:1.
      options: {rules: {'color-contrast-enhanced': {enabled: false}}},
    },
  },
  decorators: [onThemeSurface],
  args: {onNavigate: fn()},
  render: (args) => <DocsTree onNavigate={args.onNavigate} defaultValue="ai-ops" />,
  play: async ({args, canvas, userEvent}) => {
    const onNavigate = args.onNavigate as unknown as ReturnType<typeof fn>
    onNavigate.mockImplementation((_href: string, event: {preventDefault(): void}) =>
      event.preventDefault(),
    )
    const item = (name: RegExp) => canvas.getByRole('treeitem', {name})

    // the name is the label then the meta; a leaf without meta is its label
    await expect(canvas.getByRole('treeitem', {name: 'Operations 31'})).toBeInTheDocument()
    await expect(canvas.getByRole('treeitem', {name: 'Start here'})).toBeInTheDocument()

    // a real link, outside the tab order
    const link = canvas.getByRole('link', {name: /Clusters and bootstrap/})
    await expect(link).toHaveAttribute('href', '#clusters')
    await expect(link).toHaveAttribute('tabindex', '-1')

    // one tab stop (the selection), and the arrow keys still move focus
    await userEvent.tab()
    await expect(item(/AI-ops platform/)).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    await expect(item(/Clusters and bootstrap/)).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await expect(item(/Secrets and Vault/)).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect(item(/Start here/)).toHaveFocus()

    // Enter follows the link: onNavigate, then the item is selected
    await userEvent.keyboard('{End}{ArrowUp}{ArrowUp}{Enter}')
    await expect(onNavigate).toHaveBeenCalledTimes(1)
    await expect(onNavigate.mock.calls[0][0]).toBe('#secrets')
    await expect(item(/Secrets and Vault/)).toHaveAttribute('aria-selected', 'true')

    // a plain click goes to the router; a meta-click keeps the browser
    // default and does not select
    await expect(clickLink(link).defaultPrevented).toBe(true)
    await expect(onNavigate).toHaveBeenCalledTimes(2)
    await expect(onNavigate.mock.calls[1][0]).toBe('#clusters')
    const runbooks = canvas.getByRole('link', {name: /Runbooks/})
    await expect(clickLink(runbooks, {metaKey: true}).defaultPrevented).toBe(false)
    await expect(onNavigate).toHaveBeenCalledTimes(2)
    await expect(item(/Runbooks/)).toHaveAttribute('aria-selected', 'false')
  },
}

// --- Perf: 300 leaves (measurement harness, plan 2026-10-15 section 3) ---

const BRANCHES = 20
const LEAVES_PER_BRANCH = 15
const BRANCH_VALUES = Array.from({length: BRANCHES}, (_, b) => `branch-${b}`)
const PERF_REMOUNT_CEILING_MS = 2000

interface TreePerf {
  mountTimes: number[]
  keyTimes: number[]
  eventEntries: number[]
  renders: number
  resetRenders: () => void
  remount: (n: number) => Promise<number[]>
  scroll: () => Promise<{worstFrameGap: number; longTasks: number}>
}

declare global {
  interface Window {
    __treeRenders?: number
    __treePerf?: TreePerf
  }
}

const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve))

function countCommit() {
  window.__treeRenders = (window.__treeRenders ?? 0) + 1
}

function PerfTree() {
  let leaf = 0
  // the default virtualizeThreshold (150) applies: the tree has 320 items
  return (
    <Profiler id="tree" onRender={countCommit}>
      <Tree.Root aria-label="Sessions" defaultExpanded={BRANCH_VALUES} maxHeight="listMaxH">
        {BRANCH_VALUES.map((branch, b) => (
          <Tree.Item key={branch} value={branch} label={`Project ${b}`}>
            {Array.from({length: LEAVES_PER_BRANCH}, () => {
              const i = leaf++
              return (
                <Tree.Item
                  key={i}
                  value={`leaf-${i}`}
                  label={`Session ${i}`}
                  href={`/s/${i}`}
                  onNavigate={(_href, event) => event.preventDefault()}
                  meta={
                    <Inline gap="sm">
                      <Text variant="caption" color="muted">
                        {`${i}m ago`}
                      </Text>
                      <Badge size="sm">Running</Badge>
                    </Inline>
                  }
                />
              )
            })}
          </Tree.Item>
        ))}
      </Tree.Root>
    </Profiler>
  )
}

function CommitProbe({onCommit}: {onCommit: () => void}) {
  useLayoutEffect(() => {
    onCommit()
  })
  return null
}

function PerfHarness() {
  const [mounted, setMounted] = useState(true)
  const hostRef = useRef<HTMLDivElement>(null)
  const commitRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (host === null) return
    const longTaskTimes: number[] = []
    const observers: PerformanceObserver[] = []
    const observe = (
      init: PerformanceObserverInit,
      onEntries: (e: PerformanceEntryList) => void,
    ) => {
      try {
        const observer = new PerformanceObserver((list) => onEntries(list.getEntries()))
        observer.observe(init)
        observers.push(observer)
      } catch {
        // an entry type this browser lacks: that measure stays empty
      }
    }
    const perf: TreePerf = {
      mountTimes: [],
      keyTimes: [],
      eventEntries: [],
      renders: 0,
      resetRenders: () => {
        window.__treeRenders = 0
      },
      remount: async (n) => {
        const times: number[] = []
        for (let k = 0; k < n; k++) {
          // commit the unmount before the frame: batched with the mount below, the
          // two updates would cancel out and no commit would follow
          flushSync(() => setMounted(false))
          await nextFrame()
          const started = performance.now()
          const done = new Promise<void>((resolve) => {
            commitRef.current = () => {
              commitRef.current = null
              requestAnimationFrame(() => {
                times.push(performance.now() - started)
                resolve()
              })
            }
          })
          setMounted(true)
          await done
        }
        perf.mountTimes.push(...times)
        return times
      },
      scroll: async () => {
        const viewport = host.querySelector<HTMLElement>('[role="tree"]')
        if (viewport === null) return {worstFrameGap: 0, longTasks: 0}
        const before = longTaskTimes.length
        const distance = viewport.scrollHeight - viewport.clientHeight
        let worst = 0
        let last = await nextFrame()
        for (let frame = 1; frame <= 60; frame++) {
          viewport.scrollTop = (distance * frame) / 60
          const now = await nextFrame()
          worst = Math.max(worst, now - last)
          last = now
        }
        return {worstFrameGap: worst, longTasks: longTaskTimes.length - before}
      },
    }
    Object.defineProperty(perf, 'renders', {get: () => window.__treeRenders ?? 0})
    window.__treePerf = perf

    observe({type: 'longtask'}, (entries) => longTaskTimes.push(...entries.map((e) => e.startTime)))
    observe(
      {type: 'event', durationThreshold: 16, buffered: false} as PerformanceObserverInit,
      (entries) => {
        for (const entry of entries)
          if (entry.name === 'keydown') perf.eventEntries.push(entry.duration)
      },
    )

    // keydown dispatch to the next frame after a row's tabindex flips
    let pending: number | null = null
    const onKeyDown = () => {
      pending = performance.now()
    }
    const flips = new MutationObserver((records) => {
      if (pending === null) return
      if (!records.some((r) => (r.target as Element).getAttribute('tabindex') === '0')) return
      const started = pending
      pending = null
      requestAnimationFrame(() => perf.keyTimes.push(performance.now() - started))
    })
    host.addEventListener('keydown', onKeyDown, true)
    flips.observe(host, {subtree: true, attributes: true, attributeFilter: ['tabindex']})

    return () => {
      host.removeEventListener('keydown', onKeyDown, true)
      flips.disconnect()
      for (const observer of observers) observer.disconnect()
      delete window.__treePerf
    }
  }, [])

  return (
    <html.div ref={hostRef}>
      {mounted ? (
        <>
          <PerfTree />
          <CommitProbe onCommit={() => commitRef.current?.()} />
        </>
      ) : null}
    </html.div>
  )
}

/**
 * Measurement harness for the cost of a 300-leaf tree (20 branches of 15 links,
 * Happier-shaped meta). Read `window.__treePerf` from a benchmark run; the play
 * function only proves the harness works, with a generous ceiling.
 */
export const Perf300: Story = {
  name: 'Perf: 300 leaves',
  render: () => <PerfHarness />,
  play: async ({canvas}) => {
    // windowed: the 320 rows are not all in the DOM
    const mounted = canvas.getAllByRole('treeitem').length
    await expect(mounted).toBeGreaterThan(0)
    await expect(mounted).toBeLessThan(BRANCHES + BRANCHES * LEAVES_PER_BRANCH)
    const perf = window.__treePerf
    await expect(perf).toBeDefined()
    const times = (await perf?.remount(5)) ?? []
    await expect(times).toHaveLength(5)
    for (const time of times) await expect(time).toBeLessThan(PERF_REMOUNT_CEILING_MS)
  },
}

// --- Windowing above the threshold ---

const WINDOW_BRANCHES = 10
const WINDOW_LEAVES = 30
const WINDOW_ROWS = WINDOW_BRANCHES * (1 + WINDOW_LEAVES)
const windowBranchValues = Array.from({length: WINDOW_BRANCHES}, (_, b) => `group-${b}`)

function WindowedTree() {
  return (
    <Tree.Root
      aria-label="Files"
      defaultExpanded={windowBranchValues}
      virtualizeThreshold={100}
      maxHeight="listMaxH"
    >
      {windowBranchValues.map((group, b) => (
        <Tree.Item key={group} value={group} label={`Folder${String(b).padStart(2, '0')}`}>
          {Array.from({length: WINDOW_LEAVES}, (_, l) => (
            <Tree.Item
              key={l}
              value={`${group}-file-${l}`}
              label={`File-${String(b).padStart(2, '0')}-${String(l).padStart(2, '0')}`}
            />
          ))}
        </Tree.Item>
      ))}
    </Tree.Root>
  )
}

/** Above virtualizeThreshold only the rows in view mount, as flat treeitems. */
export const Windowed: Story = {
  decorators: [onThemeSurface],
  render: () => <WindowedTree />,
  parameters: {a11y: {test: 'error'}},
  play: async ({canvas, userEvent}) => {
    const tree = canvas.getByRole('tree', {name: 'Files'})
    const mounted = canvas.getAllByRole('treeitem')
    await expect(mounted.length).toBeGreaterThan(0)
    await expect(mounted.length).toBeLessThan(WINDOW_ROWS)

    // the first rows: a branch, then its first leaves, with level, size and position
    const first = canvas.getByRole('treeitem', {name: 'Folder00'})
    await expect(first).toHaveAttribute('aria-level', '1')
    await expect(first).toHaveAttribute('aria-setsize', String(WINDOW_BRANCHES))
    await expect(first).toHaveAttribute('aria-posinset', '1')
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    const leaf = canvas.getByRole('treeitem', {name: 'File-00-02'})
    await expect(leaf).toHaveAttribute('aria-level', '2')
    await expect(leaf).toHaveAttribute('aria-setsize', String(WINDOW_LEAVES))
    await expect(leaf).toHaveAttribute('aria-posinset', '3')
    await expect(leaf).not.toHaveAttribute('aria-expanded')
    await expect(leaf).toHaveAttribute('aria-selected', 'false')

    // one tab stop
    await expect(tree.querySelectorAll('[role="treeitem"][tabindex="0"]')).toHaveLength(1)
    await userEvent.tab()
    await expect(first).toHaveFocus()

    // End reaches the last row, which is not mounted yet
    await expect(canvas.queryByRole('treeitem', {name: 'File-09-29'})).toBeNull()
    await userEvent.keyboard('{End}')
    const last = await canvas.findByRole('treeitem', {name: 'File-09-29'})
    await expect(last).toHaveFocus()
    await expect(last).toHaveAttribute('aria-posinset', String(WINDOW_LEAVES))
    await expect(canvas.getAllByRole('treeitem').length).toBeLessThan(WINDOW_ROWS)

    // Home goes back to the first row
    await userEvent.keyboard('{Home}')
    await expect(await canvas.findByRole('treeitem', {name: 'Folder00'})).toHaveFocus()

    // typeahead reaches an off-screen row
    await expect(canvas.queryByRole('treeitem', {name: 'Folder08'})).toBeNull()
    await userEvent.keyboard('Folder08')
    const folder = await canvas.findByRole('treeitem', {name: 'Folder08'}, {timeout: 5000})
    await expect(folder).toHaveFocus()
    await expect(folder).toHaveAttribute('aria-posinset', '9')

    // Left closes the branch, and the rows below shift up
    await userEvent.keyboard('{ArrowLeft}')
    await expect(folder).toHaveAttribute('aria-expanded', 'false')
  },
}

/** A branch whose rows come from a component: the collect pass cannot see them. */
function WrappedRows({branch}: {branch: number}) {
  return Array.from({length: 40}, (_, i) => (
    <Tree.Item key={i} value={`w-${branch}-${i}`} label={`Wrapped ${branch}-${i}`} />
  ))
}

/**
 * Past the threshold, but one branch's rows sit inside a component: the tree
 * falls back to rendering every row, so none of them vanish.
 */
export const WindowedFallback: Story = {
  name: 'Windowed: wrapped rows fall back',
  render: () => (
    <Tree.Root
      aria-label="Fallback"
      defaultExpanded={Array.from({length: 5}, (_, b) => `wb-${b}`)}
      virtualizeThreshold={3}
    >
      {Array.from({length: 5}, (_, b) => (
        <Tree.Item key={b} value={`wb-${b}`} label={`Wrapped branch ${b}`}>
          <WrappedRows branch={b} />
        </Tree.Item>
      ))}
    </Tree.Root>
  ),
  play: async ({canvas}) => {
    // 5 branches + 5 x 40 wrapped rows, all mounted: no row lost to the window
    await expect(canvas.getAllByRole('treeitem')).toHaveLength(205)
    await expect(canvas.getByRole('treeitem', {name: 'Wrapped 4-39'})).toBeInTheDocument()
  },
}

/** A branch with no link toggles on a click of its row (a folder); Enter too. */
export const BranchRowToggles: Story = {
  name: 'Branch row toggles',
  render: () => (
    <Tree.Root aria-label="Folders">
      <Tree.Item value="src" label="src">
        <Tree.Item value="app" label="app.ts" />
      </Tree.Item>
    </Tree.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const branch = canvas.getByRole('treeitem', {name: 'src'})
    await expect(branch).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(canvas.getByText('src'))
    await expect(branch).toHaveAttribute('aria-expanded', 'true')
    await expect(branch).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{Enter}')
    await expect(branch).toHaveAttribute('aria-expanded', 'false')
  },
}
