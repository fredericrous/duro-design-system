import type {Meta, StoryObj} from '@storybook/react'
import {expect, waitFor} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {SPACING_PX} from '@duro-app/tokens/keys'
import {Aside} from './Aside'
import {Grid} from '../Grid/Grid'
import {Stack} from '../Stack/Stack'
import {Text} from '../Text/Text'
import {TextLink} from '../TextLink/TextLink'
import {onThemeSurface} from '../../docs/themedSurface'

const meta: Meta = {
  title: 'Layout/Aside',
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
}

export default meta
type Story = StoryObj

const styles = css.create({
  page: {width: sizes.pageLg},
})

const PARAGRAPHS = Array.from({length: 80}, (_, i) => `Paragraph ${i + 1} of a long runbook.`)
const SECTIONS = Array.from({length: 60}, (_, i) => `Section ${i + 1}`)

const asideRef: {current: HTMLElement | null} = {current: null}

function LongPage() {
  return (
    <html.div style={styles.page}>
      <Grid layout="content-aside" gap="xl">
        <Stack gap="md">
          {PARAGRAPHS.map((text) => (
            <Text key={text}>{text}</Text>
          ))}
        </Stack>
        <Aside aria-label="Page outline" ref={asideRef}>
          <Stack gap="xs">
            {SECTIONS.map((name) => (
              <TextLink key={name} href={`#${name}`}>
                {name}
              </TextLink>
            ))}
          </Stack>
        </Aside>
      </Grid>
    </html.div>
  )
}

/**
 * Sticks within the viewport while the page scrolls, and scrolls on its own
 * when it is taller than the viewport; a labelled complementary landmark.
 */
export const StickyAndScrolling: Story = {
  render: () => <LongPage />,
  play: async ({canvas}) => {
    const aside = canvas.getByRole('complementary', {name: 'Page outline'})
    await expect(asideRef.current).toBe(aside)
    await expect(aside.tagName).toBe('ASIDE')

    const cs = getComputedStyle(aside)
    await expect(cs.position).toBe('sticky')
    // outside AppShell there is no bar to clear: the bar's custom property is
    // unset, its fallback is 0, and only the offset remains
    await expect(cs.getPropertyValue('--duro-app-shell-bar')).toBe('')
    await expect(cs.top).toBe(`${SPACING_PX.lg}px`)
    await expect(cs.zIndex).toBe('1')
    // taller than the room it has: it scrolls on its own, inside the viewport
    await expect(aside.clientHeight).toBeLessThanOrEqual(window.innerHeight - 2 * SPACING_PX.lg)
    await expect(aside.scrollHeight).toBeGreaterThan(aside.clientHeight)

    const scroller = document.scrollingElement as HTMLElement
    const start = scroller.scrollTop
    try {
      scroller.scrollTop = start + 600
      await waitFor(() => expect(scroller.scrollTop).toBeGreaterThan(start))
      await waitFor(() => expect(Math.round(aside.getBoundingClientRect().top)).toBe(SPACING_PX.lg))
    } finally {
      scroller.scrollTop = start
    }
  },
}
