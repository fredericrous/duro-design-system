/** Colour calculations behind ColorPicker, shared by the web and native components. */

export interface Rgba {
  /** Red, 0 to 255. */
  r: number
  /** Green, 0 to 255. */
  g: number
  /** Blue, 0 to 255. */
  b: number
  /** Opacity, 0 to 1. */
  a: number
}

export interface Hsva {
  /** Hue in degrees, 0 up to 360. */
  h: number
  /** Saturation, 0 to 1. */
  s: number
  /** Brightness (value), 0 to 1. */
  v: number
  /** Opacity, 0 to 1. */
  a: number
}

export const TRANSPARENT: Rgba = {r: 0, g: 0, b: 0, a: 0}
export const BLACK: Rgba = {r: 0, g: 0, b: 0, a: 1}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function roundAlpha(alpha: number): number {
  return Number(clamp(alpha, 0, 1).toFixed(2))
}

function channel(value: number): number {
  return Math.round(clamp(value, 0, 255))
}

const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)$/

/** A number, or a percentage read against `scale`; null when it is neither. */
function component(token: string, scale: number): number | null {
  if (token.endsWith('%')) {
    const percent = token.slice(0, -1)
    return NUMBER.test(percent) ? (Number(percent) / 100) * scale : null
  }
  return NUMBER.test(token) ? Number(token) : null
}

function parseHex(digits: string): Rgba | null {
  if (!/^(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(digits)) return null
  const full = digits.length <= 4 ? [...digits].map((digit) => digit + digit).join('') : digits
  const byte = (index: number) => parseInt(full.slice(index * 2, index * 2 + 2), 16)
  return {
    r: byte(0),
    g: byte(1),
    b: byte(2),
    a: full.length === 8 ? roundAlpha(byte(3) / 255) : 1,
  }
}

function functionArguments(text: string): {name: string; tokens: string[]} | null {
  const match = /^([a-z]+)\(([^()]*)\)$/.exec(text)
  if (!match) return null
  const tokens = match[2].split(/[\s,/]+/).filter(Boolean)
  return {name: match[1], tokens}
}

function parseAlpha(token: string | undefined): number | null {
  if (token === undefined) return 1
  const alpha = component(token, 1)
  return alpha === null ? null : clamp(alpha, 0, 1)
}

function parseRgbFunction(tokens: string[]): Rgba | null {
  if (tokens.length !== 3 && tokens.length !== 4) return null
  const channels = tokens.slice(0, 3).map((token) => component(token, 255))
  const alpha = parseAlpha(tokens[3])
  if (alpha === null || channels.some((value) => value === null)) return null
  const [r, g, b] = channels as number[]
  return {r: channel(r), g: channel(g), b: channel(b), a: roundAlpha(alpha)}
}

function parseHslFunction(tokens: string[]): Rgba | null {
  if (tokens.length !== 3 && tokens.length !== 4) return null
  const hue = component(tokens[0].replace(/deg$/, ''), 360)
  const saturation = tokens[1].endsWith('%') ? component(tokens[1], 1) : null
  const lightness = tokens[2].endsWith('%') ? component(tokens[2], 1) : null
  const alpha = parseAlpha(tokens[3])
  if (hue === null || saturation === null || lightness === null || alpha === null) return null
  return hslaToRgba({
    h: hue,
    s: clamp(saturation, 0, 1),
    l: clamp(lightness, 0, 1),
    a: roundAlpha(alpha),
  })
}

/**
 * Reads a CSS colour: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`,
 * `hsl()`, `hsla()` and `transparent`. Returns null for anything else.
 */
export function parseColor(input: string): Rgba | null {
  const text = input.trim().toLowerCase()
  if (text === 'transparent') return TRANSPARENT
  if (text.startsWith('#')) return parseHex(text.slice(1))
  const call = functionArguments(text)
  if (!call) return null
  if (call.name === 'rgb' || call.name === 'rgba') return parseRgbFunction(call.tokens)
  if (call.name === 'hsl' || call.name === 'hsla') return parseHslFunction(call.tokens)
  return null
}

const hexByte = (value: number) => channel(value).toString(16).padStart(2, '0')

/** `#rrggbb`, or `#rrggbbaa` when the colour is not opaque. */
export function formatHex({r, g, b, a}: Rgba): string {
  const alpha = a < 1 ? hexByte(a * 255) : ''
  return `#${hexByte(r)}${hexByte(g)}${hexByte(b)}${alpha}`
}

/** `rgb(r, g, b)`, or `rgba(r, g, b, a)` when the colour is not opaque. */
export function formatRgb({r, g, b, a}: Rgba): string {
  const parts = [channel(r), channel(g), channel(b)]
  return a < 1 ? `rgba(${parts.join(', ')}, ${roundAlpha(a)})` : `rgb(${parts.join(', ')})`
}

/** `hsl(h, s%, l%)`, or `hsla(h, s%, l%, a)` when the colour is not opaque. */
export function formatHsl(color: Rgba): string {
  const {h, s, l, a} = rgbaToHsla(color)
  const parts = `${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`
  return a < 1 ? `hsla(${parts}, ${roundAlpha(a)})` : `hsl(${parts})`
}

/**
 * The string ColorPicker emits: `transparent` for a fully clear black, hex for
 * an opaque colour and `rgba()` for the rest.
 */
export function formatColor(color: Rgba): string {
  if (color.a <= 0 && channel(color.r) === 0 && channel(color.g) === 0 && channel(color.b) === 0) {
    return 'transparent'
  }
  return color.a < 1 ? formatRgb({...color, a: color.a}) : formatHex(color)
}

export function hsvaToRgba({h, s, v, a}: Hsva): Rgba {
  const hue = ((h % 360) + 360) % 360
  const sector = hue / 60
  const chroma = v * s
  const second = chroma * (1 - Math.abs((sector % 2) - 1))
  const floor = v - chroma
  const [r, g, b] = [
    [chroma, second, 0],
    [second, chroma, 0],
    [0, chroma, second],
    [0, second, chroma],
    [second, 0, chroma],
    [chroma, 0, second],
  ][Math.min(5, Math.floor(sector))]
  return {
    r: channel((r + floor) * 255),
    g: channel((g + floor) * 255),
    b: channel((b + floor) * 255),
    a,
  }
}

export function rgbaToHsva({r, g, b, a}: Rgba): Hsva {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const delta = max - Math.min(red, green, blue)
  let hue = 0
  if (delta > 0) {
    if (max === red) hue = ((green - blue) / delta) % 6
    else if (max === green) hue = (blue - red) / delta + 2
    else hue = (red - green) / delta + 4
    hue = (hue * 60 + 360) % 360
  }
  return {h: hue, s: max === 0 ? 0 : delta / max, v: max, a}
}

export interface Hsla {
  h: number
  s: number
  l: number
  a: number
}

export function hslaToRgba({h, s, l, a}: Hsla): Rgba {
  const v = l + s * Math.min(l, 1 - l)
  return hsvaToRgba({h, s: v === 0 ? 0 : 2 * (1 - l / v), v, a})
}

export function rgbaToHsla(color: Rgba): Hsla {
  const {h, s, v, a} = rgbaToHsva(color)
  const l = v * (1 - s / 2)
  return {h, s: l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l), l, a}
}

/** The opaque colour at full saturation and brightness for a hue, as hex. */
export function hueColor(hue: number): string {
  return formatHex(hsvaToRgba({h: hue, s: 1, v: 1, a: 1}))
}

/** The hue track's background: a stop every 60 degrees from red round to red. */
export function hueGradient(): string {
  return `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360].map(hueColor).join(', ')})`
}
