/** Translate a glob (`**`, `*`, `?`, `{a,b}`) into an anchored RegExp. */
export function globToRegExp(glob: string): RegExp {
  let out = ''
  let depth = 0
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]!
    if (c === '*') {
      if (glob[i + 1] === '*') {
        i++
        if (glob[i + 1] === '/') {
          i++
          out += '(?:.*/)?'
        } else {
          out += '.*'
        }
      } else {
        out += '[^/]*'
      }
    } else if (c === '?') {
      out += '[^/]'
    } else if (c === '{') {
      depth++
      out += '(?:'
    } else if (c === '}' && depth > 0) {
      depth--
      out += ')'
    } else if (c === ',' && depth > 0) {
      out += '|'
    } else {
      out += c.replace(/[.+^$()|[\]\\{}]/g, '\\$&')
    }
  }
  return new RegExp(`^${out}$`)
}

const normalize = (path: string) => path.replace(/\\/g, '/')

/** Does `filename` match any glob, relative to `cwd` or as an absolute path? */
export function matchesAnyGlob(filename: string, cwd: string, globs: readonly string[]): boolean {
  if (globs.length === 0) return false
  const abs = normalize(filename)
  const base = normalize(cwd).replace(/\/+$/, '')
  const rel = abs.startsWith(`${base}/`) ? abs.slice(base.length + 1) : abs
  return globs.some((glob) => {
    const re = globToRegExp(normalize(glob))
    return re.test(rel) || re.test(abs)
  })
}
