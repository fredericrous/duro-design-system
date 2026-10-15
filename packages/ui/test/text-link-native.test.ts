import {afterEach, describe, expect, it, vi} from 'vitest'

const followLink = vi.fn()
vi.mock('../src/shared/followLink.native', () => ({followLink}))
vi.mock('react-strict-dom', () => ({html: {a: 'a'}}))
vi.mock('../src/components/TextLink/native.css', () => ({
  nativeStyles: {base: {}, default: {}, subtle: {}},
}))

const {TextLink} = await import('../src/components/TextLink/TextLink.native')

afterEach(() => followLink.mockReset())

function press(props: Partial<Parameters<typeof TextLink>[0]>) {
  const element = TextLink({href: '/docs', children: 'Docs', ...props})
  expect(element.props.href).toBeUndefined()
  element.props.onClick()
}

describe('TextLink.native', () => {
  const onNavigate = vi.fn()

  it('passes onNavigate to followLink without a target', () => {
    press({onNavigate})
    expect(followLink).toHaveBeenCalledWith('/docs', onNavigate, 'TextLink')
  })

  it('does not pass onNavigate when target is set', () => {
    press({onNavigate, target: '_blank'})
    expect(followLink).toHaveBeenCalledWith('/docs', undefined, 'TextLink')
  })
})
