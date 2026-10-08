import {describe, expect, it} from 'vitest'
import {relative} from '../src/components/Time/relative'

const NOW = Date.UTC(2026, 9, 8, 12, 0, 0)
const ago = (ms: number) => NOW - ms
const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

describe('relative', () => {
  it('picks the largest unit that keeps the count at least 1', () => {
    expect(relative(ago(30_000), {now: NOW, locale: 'en'})).toBe('30 seconds ago')
    expect(relative(ago(5 * MIN), {now: NOW, locale: 'en'})).toBe('5 minutes ago')
    expect(relative(ago(3 * HOUR), {now: NOW, locale: 'en'})).toBe('3 hours ago')
    expect(relative(ago(3 * DAY), {now: NOW, locale: 'en'})).toBe('3 days ago')
    expect(relative(ago(14 * DAY), {now: NOW, locale: 'en'})).toBe('2 weeks ago')
    expect(relative(ago(90 * DAY), {now: NOW, locale: 'en'})).toBe('3 months ago')
    expect(relative(ago(800 * DAY), {now: NOW, locale: 'en'})).toBe('2 years ago')
    expect(relative(NOW + 2 * DAY, {now: NOW, locale: 'en'})).toBe('in 2 days')
  })

  it('speaks the locale it is given', () => {
    expect(relative(ago(3 * DAY), {now: NOW, locale: 'fr'})).toBe('il y a 3 jours')
    expect(relative(ago(DAY), {now: NOW, locale: 'fr'})).toBe('hier')
    expect(relative(ago(3 * DAY), {now: NOW, locale: 'de'})).toBe('vor 3 Tagen')
  })

  it('uses the locale word where there is one, unless numeric is always', () => {
    expect(relative(ago(DAY), {now: NOW, locale: 'en'})).toBe('yesterday')
    expect(relative(NOW, {now: NOW, locale: 'en'})).toBe('now')
    expect(relative(ago(DAY), {now: NOW, locale: 'en', numeric: 'always'})).toBe('1 day ago')
    expect(relative(NOW, {now: NOW, locale: 'en', numeric: 'always'})).toBe('in 0 seconds')
  })

  it('takes a Date, an ISO string or a number, and a Date for now', () => {
    const iso = new Date(ago(3 * DAY)).toISOString()
    const expected = '3 days ago'
    expect(relative(iso, {now: new Date(NOW), locale: 'en'})).toBe(expected)
    expect(relative(new Date(iso), {now: NOW, locale: 'en'})).toBe(expected)
  })

  it('is a pure function of its arguments: the same now gives the same text', () => {
    const a = relative(ago(3 * DAY), {now: NOW, locale: 'en'})
    const b = relative(ago(3 * DAY), {now: NOW, locale: 'en'})
    expect(a).toBe(b)
  })

  it('throws a RangeError on an unparseable date', () => {
    expect(() => relative('not a date', {now: NOW, locale: 'en'})).toThrow(RangeError)
  })
})
