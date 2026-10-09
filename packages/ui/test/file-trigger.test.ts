import {describe, expect, it, vi} from 'vitest'
import {openPicker, takeFiles} from '../src/components/FileTrigger/pick'

const file = (name: string) => ({name}) as unknown as File

describe('FileTrigger', () => {
  it('open() clicks the native input', () => {
    const click = vi.fn()
    openPicker({click})
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('open() with no input is a no-op', () => {
    expect(() => openPicker(null)).not.toThrow()
  })

  it('onSelect receives the File array', () => {
    const onSelect = vi.fn()
    const files = [file('a'), file('b')]
    takeFiles({files, value: 'C:\\fakepath\\a', click: vi.fn()}, onSelect)
    expect(onSelect).toHaveBeenCalledWith(files)
  })

  it('resets the input value so the same file can be picked again', () => {
    const input = {files: [file('a')], value: 'C:\\fakepath\\a', click: vi.fn()}
    takeFiles(input, vi.fn())
    expect(input.value).toBe('')
  })

  it('does not call onSelect when nothing was chosen', () => {
    const onSelect = vi.fn()
    takeFiles({files: [], value: '', click: vi.fn()}, onSelect)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
