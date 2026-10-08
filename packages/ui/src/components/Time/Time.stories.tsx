import type {Meta, StoryObj} from '@storybook/react'
import {expect, waitFor} from 'storybook/test'
import {html} from 'react-strict-dom'
import {renderToString} from 'react-dom/server'
import {hydrateRoot} from 'react-dom/client'
import {Time} from './Time'
import {relative} from './relative'
import {Stack} from '../Stack/Stack'
import {Text} from '../Text/Text'
import {onThemeSurface} from '../../docs/themedSurface'

// A fixed instant, as a loader would pass it: never the clock during render.
const NOW = Date.UTC(2026, 9, 8, 12, 0, 0)
const COMMIT = '2026-10-05T09:30:00.000Z'
const DAY_MS = 24 * 60 * 60 * 1000

type Locale = 'en' | 'fr' | 'de'

interface TimeArgs {
  /** The instant shown, in days from `now` (negative: in the past). */
  offsetDays: number
  /** The locale `relative` and the title use. */
  locale: Locale
  /** `auto` says "yesterday" where the locale has a word; `always` keeps the number. */
  numeric: 'auto' | 'always'
  /** The text before the date. */
  label: string
}

const meta = {
  title: 'Components/Time',
  args: {offsetDays: -3, locale: 'en', numeric: 'auto', label: 'Updated'},
  argTypes: {
    offsetDays: {control: {type: 'range', min: -400, max: 400, step: 1}},
    locale: {
      control: {type: 'select', labels: {en: 'English', fr: 'Français', de: 'Deutsch'}},
      options: ['en', 'fr', 'de'],
    },
    numeric: {control: 'radio', options: ['auto', 'always']},
    label: {control: 'text'},
  },
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
  render: ({offsetDays, locale, numeric, label}) => {
    const iso = new Date(NOW + offsetDays * DAY_MS).toISOString()
    return (
      <Text variant="bodySm" color="muted">
        {label}{' '}
        <Time dateTime={iso} title={full(iso, locale)}>
          {relative(iso, {now: NOW, locale, numeric})}
        </Time>
      </Text>
    )
  },
} satisfies Meta<TimeArgs>

export default meta
type Story = StoryObj<typeof meta>

const TEST_ONLY = ['!dev', '!autodocs']

function full(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(iso))
}

function Updated({locale, label}: {locale: string; label: string}) {
  return (
    <Text variant="bodySm" color="muted">
      {label}{' '}
      <Time dateTime={COMMIT} title={full(COMMIT, locale)}>
        {relative(COMMIT, {now: NOW, locale})}
      </Time>
    </Text>
  )
}

/**
 * A date relative to a fixed `now` (2026-10-08 12:00 UTC). Move `offsetDays`
 * to walk through the units (days, weeks, months, years), switch `locale`, and
 * `numeric` to always for "1 day ago" instead of "yesterday". Hover the date
 * for the exact instant (title).
 */
export const Playground: Story = {
  play: async ({args, canvasElement}) => {
    const time = canvasElement.querySelector('time')!
    const iso = new Date(NOW + args.offsetDays * DAY_MS).toISOString()
    await expect(time).toHaveAttribute('datetime', iso)
    await expect(time).toHaveAttribute('title', full(iso, args.locale))
  },
}

/** The words come from the locale; the exact instant stays in dateTime and title. */
export const TwoLocales: Story = {
  render: () => (
    <Stack gap="sm">
      <Updated locale="en" label="Updated" />
      <Updated locale="fr" label="Mis à jour" />
    </Stack>
  ),
  play: async ({canvasElement}) => {
    const times = [...canvasElement.querySelectorAll('time')]
    await expect(times).toHaveLength(2)
    await expect(times[0]).toHaveTextContent('3 days ago')
    await expect(times[1]).toHaveTextContent('il y a 3 jours')
    for (const time of times) {
      await expect(time).toHaveAttribute('datetime', COMMIT)
    }
    await expect(times[0]).toHaveAttribute('title', full(COMMIT, 'en'))
    await expect(times[1]).toHaveAttribute('title', full(COMMIT, 'fr'))
  },
}

/** A Date is written as its ISO string. */
export const FromDate: Story = {
  tags: TEST_ONLY,
  render: () => (
    <Text>
      <Time dateTime={new Date(NOW)}>{relative(NOW, {now: NOW, locale: 'en'})}</Time>
    </Text>
  ),
  play: async ({canvasElement}) => {
    const time = canvasElement.querySelector('time')!
    await expect(time).toHaveAttribute('datetime', new Date(NOW).toISOString())
    await expect(time).toHaveTextContent('now')
  },
}

/** Server and client render the same text from the same `now`: hydration
 *  reports nothing. It replaces the canvas's content, so it runs as a test only. */
export const ServerRender: Story = {
  tags: TEST_ONLY,
  render: () => <html.div data-ssr-host="" />,
  play: async ({canvasElement}) => {
    const host = canvasElement.querySelector('[data-ssr-host]') as HTMLElement
    const tree = <Updated locale="en" label="Updated" />
    host.innerHTML = renderToString(tree)
    const serverText = host.textContent
    await expect(host.querySelector('time')).toHaveTextContent('3 days ago')

    const errors: unknown[] = []
    const consoleError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args)
      consoleError(...args)
    }
    const root = hydrateRoot(host, tree, {onRecoverableError: (error) => errors.push(error)})
    try {
      // let React finish hydrating before reading the result
      await waitFor(() => expect(host.querySelector('time')).toHaveTextContent('3 days ago'))
      await new Promise((resolve) => setTimeout(resolve, 50))
      await expect(host.textContent).toBe(serverText)
      await expect(errors).toEqual([])
    } finally {
      console.error = consoleError
      root.unmount()
    }
  },
}
