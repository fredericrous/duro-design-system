import {afterEach, describe, expect, it, vi} from 'vitest'

const openURL = vi.fn<(url: string) => Promise<void>>()
vi.mock('react-native', () => ({Linking: {openURL: (url: string) => openURL(url)}}))

const {followLink} = await import('../src/shared/followLink.native')

afterEach(() => {
  openURL.mockReset()
  vi.restoreAllMocks()
})

describe('followLink', () => {
  it('opens the URL once when onNavigate is undefined', () => {
    openURL.mockResolvedValue()
    followLink('https://example.com', undefined, 'Test')
    expect(openURL).toHaveBeenCalledTimes(1)
    expect(openURL).toHaveBeenCalledWith('https://example.com')
  })

  it('hands onNavigate a plain primary event and opens when not prevented', () => {
    openURL.mockResolvedValue()
    const onNavigate = vi.fn()
    followLink('/x', onNavigate, 'Test')
    const [href, event] = onNavigate.mock.calls[0]
    expect(href).toBe('/x')
    expect(event).toMatchObject({
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      defaultPrevented: false,
    })
    expect(openURL).toHaveBeenCalledWith('/x')
  })

  it('does not open when onNavigate prevents the default', () => {
    const onNavigate = vi.fn((_href: string, event: {preventDefault(): void}) =>
      event.preventDefault(),
    )
    followLink('/x', onNavigate, 'Test')
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(openURL).not.toHaveBeenCalled()
  })

  it('warns once when openURL rejects', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    openURL.mockRejectedValue(new Error('nope'))
    followLink('/x', undefined, 'Test')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0][0])).toContain('Test')
  })
})
