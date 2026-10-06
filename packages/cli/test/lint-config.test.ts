import {fileURLToPath} from 'node:url'
import {ESLint} from 'eslint'
import {spawnSync} from 'node:child_process'
import {existsSync} from 'node:fs'
import {beforeAll, describe, expect, it} from 'vitest'
import {readFileSync} from 'node:fs'
import {TOKEN_DEEP_PATHS} from '../../eslint-plugin/src/util/tokens.js'

// Duro's own eslint.config.js applies duro/no-raw-design-values to every
// component source (ADR-0027). A glob typo there would silently lint nothing;
// this lints seeded code at real paths through the real config.
const root = fileURLToPath(new URL('../../..', import.meta.url))
const eslint = new ESLint({cwd: root, overrideConfigFile: `${root}/eslint.config.js`})

// eslint.config.js imports the BUILT plugin (as `pnpm lint` does after its
// build step); a clean checkout has no dist yet, so build it once here.
beforeAll(() => {
  if (existsSync(`${root}/packages/eslint-plugin/dist/index.js`)) return
  const build = spawnSync('pnpm', ['--filter', '@duro-app/eslint-plugin', 'run', 'build'], {
    cwd: root,
    encoding: 'utf8',
  })
  if (build.status !== 0) throw new Error(`eslint-plugin build failed: ${build.stderr}`)
}, 120_000)
const seeded = `import {css} from 'react-strict-dom'\nexport const s = css.create({a: {width: 44}})\n`
const hidden = `import {css} from 'react-strict-dom'\nexport const s = css.create({a: {width: 1, height: 1}})\n`

async function ruleIds(code: string, filePath: string) {
  const [result] = await eslint.lintText(code, {filePath: `${root}/${filePath}`})
  return result!.messages.map((m) => m.ruleId)
}

describe('token groups', () => {
  it('TOKEN_DEEP_PATHS covers every token group the barrel exports', () => {
    // Read the barrel as text: importing it would pull react-strict-dom.
    const barrel = readFileSync(
      fileURLToPath(new URL('../../tokens/src/index.ts', import.meta.url)),
      'utf8',
    )
    const groups = [
      ...barrel.matchAll(/export \{([^}]*)\} from '\.\/tokens\/([\w-]+)\.css'/g),
    ].flatMap(([, names, file]) =>
      names.split(',').map((n) => [n.replace(/^\s*type\s+/, '').trim(), file]),
    )
    expect(groups.map(([name]) => name)).toEqual(
      expect.arrayContaining(['sizes', 'borders', 'microSpacing']),
    )
    for (const [name, file] of groups) {
      expect(TOKEN_DEEP_PATHS[name], `deep path for ${name}`).toBe(`tokens/${file}.css`)
    }
  })
})

describe("Duro's eslint.config.js", () => {
  it('reports a raw width in a component source', async () => {
    expect(await ruleIds(seeded, 'packages/ui/src/components/Seeded/styles.css.ts')).toContain(
      'duro/no-raw-design-values',
    )
  })

  it('exempts only the visually-hidden module', async () => {
    expect(await ruleIds(hidden, 'packages/ui/src/styles/visually-hidden.css.ts')).not.toContain(
      'duro/no-raw-design-values',
    )
    expect(await ruleIds(hidden, 'packages/ui/src/styles/x.css.ts')).toContain(
      'duro/no-raw-design-values',
    )
  })
})
