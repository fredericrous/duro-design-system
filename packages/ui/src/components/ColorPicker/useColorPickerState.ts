import {useState} from 'react'
import {
  BLACK,
  formatColor,
  hsvaToRgba,
  parseColor,
  rgbaToHsva,
  type Hsva,
  type Rgba,
} from './colorModel'

/** The lowest alpha when transparency is not allowed. */
const MIN_OPAQUE_ALPHA = 0.01

interface ColorPickerStateOptions {
  value: string | undefined
  defaultValue: string | undefined
  allowTransparent: boolean
  onChange: ((value: string) => void) | undefined
  onChangeComplete: ((value: string) => void) | undefined
}

function acceptable(color: Rgba | null, allowTransparent: boolean): Rgba | null {
  if (!color) return null
  if (allowTransparent || color.a > 0) return color
  return null
}

/**
 * The colour a picker holds, kept as hue, saturation, brightness and alpha so
 * that dragging through grey or black does not lose the hue, plus the text
 * field's draft. A new `value` from outside replaces the held colour only
 * when it is a different colour.
 */
export function useColorPickerState({
  value,
  defaultValue,
  allowTransparent,
  onChange,
  onChangeComplete,
}: ColorPickerStateOptions) {
  const [held, setHeld] = useState<Hsva>(() =>
    rgbaToHsva(acceptable(parseColor(value ?? defaultValue ?? ''), allowTransparent) ?? BLACK),
  )
  const [draft, setDraft] = useState<string | null>(null)
  const [seen, setSeen] = useState(value)

  let hsva = held
  if (value !== seen) {
    setSeen(value)
    const incoming = acceptable(parseColor(value ?? ''), allowTransparent)
    if (incoming && formatColor(incoming) !== formatColor(hsvaToRgba(held))) {
      hsva = rgbaToHsva(incoming)
      setHeld(hsva)
    }
  }

  const current = formatColor(hsvaToRgba(hsva))

  const emit = (next: Hsva) => {
    const bounded = allowTransparent ? next : {...next, a: Math.max(MIN_OPAQUE_ALPHA, next.a)}
    setHeld(bounded)
    setDraft(null)
    const text = formatColor(hsvaToRgba(bounded))
    if (text !== current) onChange?.(text)
    return text
  }

  const move = (change: Partial<Hsva>) => {
    emit({...hsva, ...change})
  }

  const complete = (change?: Partial<Hsva>) => {
    const text = change ? emit({...hsva, ...change}) : current
    onChangeComplete?.(text)
  }

  const pick = (color: string): boolean => {
    const parsed = acceptable(parseColor(color), allowTransparent)
    if (!parsed) return false
    const text = emit(rgbaToHsva(parsed))
    onChangeComplete?.(text)
    return true
  }

  const editText = (text: string) => setDraft(text)

  const commitText = () => {
    if (draft !== null) pick(draft)
  }

  return {
    hsva,
    color: hsvaToRgba(hsva),
    current,
    text: draft ?? current,
    invalid: draft !== null && acceptable(parseColor(draft), allowTransparent) === null,
    move,
    complete,
    pick,
    editText,
    commitText,
  }
}
