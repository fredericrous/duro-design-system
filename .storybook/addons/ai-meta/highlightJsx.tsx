import React from 'react'

// Colors matching a VS Code dark+ theme
const C = {
  tag: '#569cd6',      // blue — JSX tag names
  attr: '#9cdcfe',     // light blue — prop names
  string: '#ce9178',   // orange — string values
  punct: '#808080',    // gray — < > / = { }
  comment: '#6a9955',  // green — comments
  keyword: '#c586c0',  // purple — keywords
  text: '#d4d4d4',     // default text
} as const

interface Token { text: string; color: string }

/**
 * Minimal JSX tokenizer. Produces colored spans for:
 * - JSX tags (<Component.Name>)
 * - Prop names (key=)
 * - String literals ("..." or '...')
 * - Template literals (`...`)
 * - Comments ({/* ... *\/})
 * - Braces/punctuation
 * - Keywords (const, return, function, import, from, export)
 */
export function HighlightedCode({code}: {code: string}) {
  const tokens = tokenize(code)
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} style={{color: t.color}}>{t.text}</span>
      ))}
    </>
  )
}

function tokenize(code: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < code.length) {
    // Comments: {/* ... */}  or  // ...
    if (code[i] === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i)
      const slice = end === -1 ? code.slice(i) : code.slice(i, end)
      tokens.push({text: slice, color: C.comment})
      i += slice.length
      continue
    }

    // Block comments inside JSX: {/* ... */}
    if (code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2)
      const slice = end === -1 ? code.slice(i) : code.slice(i, end + 2)
      tokens.push({text: slice, color: C.comment})
      i += slice.length
      continue
    }

    // Strings: "..." or '...'
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i]
      let j = i + 1
      while (j < code.length && code[j] !== quote) {
        if (code[j] === '\\') j++ // skip escaped
        j++
      }
      tokens.push({text: code.slice(i, j + 1), color: C.string})
      i = j + 1
      continue
    }

    // Template literals
    if (code[i] === '`') {
      let j = i + 1
      while (j < code.length && code[j] !== '`') {
        if (code[j] === '\\') j++
        j++
      }
      tokens.push({text: code.slice(i, j + 1), color: C.string})
      i = j + 1
      continue
    }

    // JSX opening/closing tags: <Component.Name or </Component
    if (code[i] === '<' && (code[i + 1] === '/' || /[A-Za-z]/.test(code[i + 1] || ''))) {
      // < or </
      const hasSlash = code[i + 1] === '/'
      tokens.push({text: hasSlash ? '</' : '<', color: C.punct})
      i += hasSlash ? 2 : 1

      // Tag name (may include dots like Component.Sub)
      let j = i
      while (j < code.length && /[A-Za-z0-9._]/.test(code[j])) j++
      if (j > i) {
        tokens.push({text: code.slice(i, j), color: C.tag})
        i = j
      }
      continue
    }

    // Self-close /> or close >
    if (code[i] === '/' && code[i + 1] === '>') {
      tokens.push({text: '/>', color: C.punct})
      i += 2
      continue
    }
    if (code[i] === '>') {
      tokens.push({text: '>', color: C.punct})
      i++
      continue
    }

    // Punctuation: { } ( ) = ... =>
    if (/[{}()=,;]/.test(code[i])) {
      // => arrow
      if (code[i] === '=' && code[i + 1] === '>') {
        tokens.push({text: '=>', color: C.punct})
        i += 2
        continue
      }
      tokens.push({text: code[i], color: C.punct})
      i++
      continue
    }

    // ... spread
    if (code[i] === '.' && code[i + 1] === '.' && code[i + 2] === '.') {
      tokens.push({text: '...', color: C.punct})
      i += 3
      continue
    }

    // Words (identifiers, keywords, prop names)
    if (/[A-Za-z_$]/.test(code[i])) {
      let j = i
      while (j < code.length && /[A-Za-z0-9_$.]/.test(code[j])) j++
      const word = code.slice(i, j)

      // Check if followed by = (prop name)
      const afterWord = code.slice(j).match(/^\s*=/)
      if (afterWord && !code.slice(j).startsWith('=>')) {
        tokens.push({text: word, color: C.attr})
      } else if (/^(const|let|var|function|return|import|from|export|default|if|else|new|typeof|true|false|null|undefined|async|await)$/.test(word)) {
        tokens.push({text: word, color: C.keyword})
      } else {
        tokens.push({text: word, color: C.text})
      }
      i = j
      continue
    }

    // Whitespace and everything else
    tokens.push({text: code[i], color: C.text})
    i++
  }

  return tokens
}
