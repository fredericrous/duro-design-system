/**
 * Offset-preserving text helpers shared by the file checkers (mockup check,
 * doctor). They scan with regexes over masked source rather than parse, which
 * keeps the CLI free of runtime dependencies — it runs under npx at session
 * start, where every dependency is install time.
 */

/** 1-based line number of an offset. */
export function lineOf(source: string, index: number): number {
  let line = 1
  for (let i = 0; i < index && i < source.length; i++) if (source[i] === '\n') line++
  return line
}

const blank = (text: string) => text.replace(/[^\n]/g, ' ')

/**
 * Blank out comments, keeping offsets, so prose that mentions a setting
 * ("never set runtimeInjection: true") is never read as the setting.
 * `line` also masks `//` comments (JS/TS); CSS has only block comments.
 * String literals are skipped over, not masked, so a `//` inside a URL
 * survives while the string's own content stays matchable.
 */
export function maskComments(source: string, {line}: {line: boolean}): string {
  const re = line
    ? /("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g
    : /("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|\/\*[\s\S]*?\*\//g
  return source.replace(re, (match, literal: string | undefined) =>
    literal === undefined ? blank(match) : match,
  )
}
