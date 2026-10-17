import {readFileSync, readdirSync} from 'node:fs'
import {join} from 'node:path'

/**
 * The packaged interface skills (packages/cli/skills) as registry `guides`:
 * skill name -> relative POSIX path -> file text. `duro skill install` walks
 * the same directory (src/commands/skill.ts `listFiles`); a test asserts both
 * list the same files in the same order.
 */

/** Byte-wise order of the UTF-8 paths, the order skill.ts sorts by. */
function byBytes(a, b) {
  return Buffer.compare(Buffer.from(a), Buffer.from(b))
}

/** Every file under `dir`, relative POSIX paths, sorted byte-wise. */
export function listGuideFiles(dir) {
  const out = []
  const walk = (prefix) => {
    for (const entry of readdirSync(join(dir, prefix), {withFileTypes: true})) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) walk(rel)
      else if (entry.isFile()) out.push(rel)
    }
  }
  walk('')
  return out.sort(byBytes)
}

export function extractGuides(skillsDir) {
  const guides = {}
  const skills = readdirSync(skillsDir, {withFileTypes: true})
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(byBytes)
  for (const skill of skills) {
    const files = {}
    for (const rel of listGuideFiles(join(skillsDir, skill))) {
      files[rel] = readFileSync(join(skillsDir, skill, rel), 'utf8')
    }
    guides[skill] = files
  }
  return guides
}
