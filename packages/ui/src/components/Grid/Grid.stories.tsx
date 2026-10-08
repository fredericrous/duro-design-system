import {useRef} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, waitFor} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Grid} from './Grid'
import {Stack} from '../Stack/Stack'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {SIZES_PX, SPACING_KEYS} from '@duro-app/tokens/keys'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {useContainerQuery} from '../../hooks/useContainerQuery'
import {useContainerBelow} from '../../hooks/useContainerBelow'
import {Aside} from '../Aside/Aside'
import {onThemeSurface} from '../../docs/themedSurface'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  argTypes: {
    gap: {
      control: 'select',
      options: [...SPACING_KEYS],
    },
    columns: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
      description: 'A count, or weights such as [1, 2] for a one-third / two-thirds split',
    },
    minColumnWidth: {control: 'text'},
    layout: {control: 'select', options: [undefined, 'split', 'split-wide', 'content-aside']},
  },
}

export default meta
type Story = StoryObj<typeof Grid>

const localStyles = css.create({
  cell: {
    backgroundColor: colors.accent,
    color: colors.accentContrast,
    padding: spacing.md,
    borderRadius: radii.xs,
    textAlign: 'center',
    fontSize: typography.fontSizeSm,
  },
  label: {
    fontSize: typography.fontSizeXs,
    color: colors.textMuted,
  },
  frame: (width: number) => ({
    width,
    borderWidth: borders.hairline,
    borderStyle: 'dashed',
    borderColor: colors.border,
  }),
})

const Cell = ({children}: {children: string}) => (
  <html.div style={localStyles.cell}>{children}</html.div>
)

export const FixedColumns: Story = {
  args: {
    gap: 'md',
    columns: 3,
  },
  render: (args) => (
    <Grid {...args}>
      <Cell>1</Cell>
      <Cell>2</Cell>
      <Cell>3</Cell>
      <Cell>4</Cell>
      <Cell>5</Cell>
      <Cell>6</Cell>
    </Grid>
  ),
}

export const AutoFit: Story = {
  render: () => (
    <Grid gap="md" minColumnWidth="gridColSm">
      <Cell>Card A</Cell>
      <Cell>Card B</Cell>
      <Cell>Card C</Cell>
      <Cell>Card D</Cell>
      <Cell>Card E</Cell>
    </Grid>
  ),
}

export const TwoColumns: Story = {
  render: () => (
    <Grid gap="lg" columns={2}>
      <Cell>Left</Cell>
      <Cell>Right</Cell>
    </Grid>
  ),
}

export const Split: Story = {
  render: () => (
    <Stack gap="sm">
      <html.span style={localStyles.label}>
        layout=&quot;split&quot; — list ≥ 240px beside the detail, one column when the container is
        narrower than sm; split-wide collapses below md
      </html.span>
      <Grid layout="split" gap="lg">
        <Cell>list</Cell>
        <Cell>detail</Cell>
      </Grid>
      <Grid layout="split-wide" gap="lg">
        <Cell>nav</Cell>
        <Cell>content</Cell>
      </Grid>
    </Stack>
  ),
}

/**
 * A split inside a split: a list/detail board in the content column of a
 * nav/content shell. Each collapses on its OWN container: at 1120 both split;
 * at 900 the shell still splits (≥ md) while the board — left 588px, under
 * sm — stacks; at 700 the shell stacks and the board, now given the whole
 * width, splits again; at 600 both stack. Keyed on the viewport, both would
 * open at 768 and leave the detail pane ~150px.
 */
export const NestedSplits: Story = {
  render: () => (
    <Stack gap="lg">
      {[1120, 900, 700, 600].map((width) => (
        <Stack key={width} gap="sm">
          <html.span style={localStyles.label}>frame {width}px</html.span>
          <html.div style={localStyles.frame(width)} data-testid={`frame-${width}`}>
            <Grid layout="split-wide" gap="xl">
              <Cell>nav</Cell>
              <Grid layout="split" gap="md">
                <Cell>list</Cell>
                <Cell>detail</Cell>
              </Grid>
            </Grid>
          </html.div>
        </Stack>
      ))}
    </Stack>
  ),
  play: async ({canvas}) => {
    const tracks = (frame: HTMLElement, text: string) => {
      const grid = canvas.getAllByText(text).find((el) => frame.contains(el))
        ?.parentElement as HTMLElement
      return getComputedStyle(grid).gridTemplateColumns.split(' ').length
    }
    const expected: Record<number, [number, number]> = {
      1120: [2, 2],
      900: [2, 1],
      700: [1, 2],
      600: [1, 1],
    }
    for (const [width, [outer, inner]] of Object.entries(expected)) {
      const frame = canvas.getByTestId(`frame-${width}`)
      await expect(tracks(frame, 'nav'), `shell at ${width}`).toBe(outer)
      await expect(tracks(frame, 'list'), `board at ${width}`).toBe(inner)
    }
  },
}

/**
 * Weighted columns: the portable form of `grid-template-columns: 1fr 2fr`.
 * Weights are what the native Grid can honour too (as flex bases), where a
 * CSS template string would be dropped.
 */
export const WeightedColumns: Story = {
  render: () => (
    <Grid gap="md" columns={[1, 2]}>
      <Cell>Sidebar (1)</Cell>
      <Cell>Content (2)</Cell>
      <Cell>Sidebar (1)</Cell>
      <Cell>Content (2)</Cell>
    </Grid>
  ),
  play: async ({canvas}) => {
    // The grid is the cells' parent (Storybook wraps the story in its own
    // divs). The browser resolves `1fr 2fr` to pixel tracks, so assert the
    // ratio rather than the string.
    const root = canvas.getAllByText('Sidebar (1)')[0].parentElement as HTMLElement
    const tracks = getComputedStyle(root).gridTemplateColumns.split(' ').map(Number.parseFloat)
    await expect(tracks).toHaveLength(2)
    // Second track is twice the first, within a pixel of rounding.
    await expect(Math.abs(tracks[1] - 2 * tracks[0])).toBeLessThan(1.5)
  },
}

export const WithContainerQuery: Story = {
  render: function Render() {
    const {ref, size} = useContainerQuery<HTMLDivElement>()
    const gap = size === 'compact' ? 'sm' : size === 'spacious' ? 'xl' : 'md'
    const cols = size === 'compact' ? 1 : size === 'spacious' ? 4 : 2

    return (
      <html.div ref={ref}>
        <Stack gap="sm">
          <html.span style={localStyles.label}>
            Container size: {size} — columns: {cols} — gap: {gap}
          </html.span>
          <Grid gap={gap} columns={cols as 1 | 2 | 3 | 4}>
            <Cell>1</Cell>
            <Cell>2</Cell>
            <Cell>3</Cell>
            <Cell>4</Cell>
          </Grid>
        </Stack>
      </html.div>
    )
  },
}

// A track list with a fixed aside: the content column takes the rest, the
// aside is sizes.asideW.
export const TracksWithAside: Story = {
  render: () => (
    <html.div style={trackStyles.frame}>
      <Grid tracks={['1fr', 'asideW']} gap="md">
        <html.div role="region" aria-label="Content" style={trackStyles.cell}>
          Content
        </html.div>
        <html.div role="region" aria-label="Aside" style={trackStyles.cell}>
          Aside
        </html.div>
      </Grid>
    </html.div>
  ),
  play: async ({canvas}) => {
    const aside = canvas.getByRole('region', {name: 'Aside'})
    await expect(aside.getBoundingClientRect().width).toBe(SIZES_PX.asideW)
    const content = canvas.getByRole('region', {name: 'Content'})
    await expect(content.getBoundingClientRect().width).toBeGreaterThan(SIZES_PX.asideW)
  },
}

export const TracksWithMinmax: Story = {
  render: () => (
    <html.div style={trackStyles.frame}>
      <Grid tracks={['minmax(gridColXs, 1fr)', 'minmax(gridColXs, 1fr)', 'minmax(gridColXs, 1fr)']}>
        <html.div style={trackStyles.cell}>One</html.div>
        <html.div style={trackStyles.cell}>Two</html.div>
        <html.div role="region" aria-label="Three" style={trackStyles.cell}>
          Three
        </html.div>
      </Grid>
    </html.div>
  ),
  play: async ({canvas}) => {
    const third = canvas.getByRole('region', {name: 'Three'})
    await expect(third.getBoundingClientRect().width).toBeGreaterThanOrEqual(SIZES_PX.gridColXs)
  },
}

const trackStyles = css.create({
  frame: {
    width: sizes.pageMd,
  },
  cell: {
    padding: spacing.sm,
    backgroundColor: colors.bgCard,
  },
})

// --- content-aside --------------------------------------------------------

const asideStyles = css.create({
  // pageLg (1200px) and pageSm (600px): either side of md (768px)
  wide: {width: sizes.pageLg},
  narrow: {width: sizes.pageSm},
  cell: {
    padding: spacing.sm,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
  },
})

// Each page's Grid ref, for the play functions to compare with the DOM.
const gridRefs = new Map<string, {current: HTMLDivElement | null}>()

/** Reports, beside the grid, what `useContainerBelow` sees on the Grid's ref. */
function ReadingPage({name}: {name: string}) {
  const ref = useRef<HTMLDivElement | null>(null)
  gridRefs.set(name, ref)
  const below = useContainerBelow(ref, 'md')
  return (
    <html.div role="group" aria-label={name}>
      <Grid ref={ref} layout="content-aside" gap="xl">
        <html.div role="region" aria-label={`${name} content`} style={asideStyles.cell}>
          {below ? 'below md' : 'md or wider'}
        </html.div>
        <Aside aria-label={`${name} outline`}>
          <html.div style={asideStyles.cell}>On this page</html.div>
        </Aside>
      </Grid>
    </html.div>
  )
}

/** A reading column beside an Aside (asideW); one column below md, measured
 *  on the Grid's own container. */
export const ContentAside: Story = {
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
  render: () => (
    <Stack gap="lg">
      <html.div style={asideStyles.wide}>
        <ReadingPage name="Wide" />
      </html.div>
      <html.div style={asideStyles.narrow}>
        <ReadingPage name="Narrow" />
      </html.div>
    </Stack>
  ),
  play: async ({canvas}) => {
    const wideContent = canvas.getByRole('region', {name: 'Wide content'})
    const wideAside = canvas.getByRole('complementary', {name: 'Wide outline'})
    await expect(wideAside.getBoundingClientRect().width).toBe(SIZES_PX.asideW)
    await expect(wideAside.getBoundingClientRect().left).toBeGreaterThan(
      wideContent.getBoundingClientRect().right,
    )
    const narrowContent = canvas.getByRole('region', {name: 'Narrow content'})
    const narrowAside = canvas.getByRole('complementary', {name: 'Narrow outline'})
    await expect(narrowAside.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      narrowContent.getBoundingClientRect().bottom,
    )
  },
}

/**
 * The collapse and `useContainerBelow` follow the Grid's container, not the
 * window: in a 1440px viewport the 600px page stacks and reports "below md",
 * the 1200px one does not. The forwarded ref is the container the query
 * measures. Sizes the browser through Vitest, so it runs as a test only.
 */
export const ContentAsideFollowsItsContainer: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
  render: () => (
    <Stack gap="lg">
      <html.div style={asideStyles.wide}>
        <ReadingPage name="Wide" />
      </html.div>
      <html.div style={asideStyles.narrow}>
        <ReadingPage name="Narrow" />
      </html.div>
    </Stack>
  ),
  play: async ({canvas}) => {
    const {page} = await import('vitest/browser')
    const before = {width: window.innerWidth, height: window.innerHeight}
    await page.viewport(1440, 900)
    try {
      await waitFor(() => expect(window.innerWidth).toBe(1440))
      const narrow = canvas.getByRole('group', {name: 'Narrow'})
      const wide = canvas.getByRole('group', {name: 'Wide'})
      // the ref resolves to the container element the query measures
      const narrowContainer = narrow.firstElementChild as HTMLElement
      await expect(gridRefs.get('Narrow')?.current).toBe(narrowContainer)
      await expect(gridRefs.get('Wide')?.current).toBe(wide.firstElementChild)
      await expect(getComputedStyle(narrowContainer).containerType).toBe('inline-size')
      await expect(narrowContainer.getBoundingClientRect().width).toBe(SIZES_PX.pageSm)
      await waitFor(() =>
        expect(canvas.getByRole('region', {name: 'Narrow content'})).toHaveTextContent('below md'),
      )
      await expect(canvas.getByRole('region', {name: 'Wide content'})).toHaveTextContent(
        'md or wider',
      )
      // and the CSS collapse agrees with it
      const narrowAside = canvas.getByRole('complementary', {name: 'Narrow outline'})
      await expect(narrowAside.getBoundingClientRect().width).toBe(SIZES_PX.pageSm)
      const wideAside = canvas.getByRole('complementary', {name: 'Wide outline'})
      await expect(wideAside.getBoundingClientRect().width).toBe(SIZES_PX.asideW)
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}

const plainGrid: {current: HTMLDivElement | null} = {current: null}

/** `ref` reaches the grid element itself when there is no named layout. */
export const RefWithoutLayout: Story = {
  render: () => (
    <Grid ref={plainGrid} columns={2} gap="sm">
      <Cell>One</Cell>
      <Cell>Two</Cell>
    </Grid>
  ),
  play: async ({canvas}) => {
    const grid = canvas.getByText('One').parentElement as HTMLElement
    await expect(getComputedStyle(grid).display).toBe('grid')
    await expect(plainGrid.current).toBe(grid)
  },
}
