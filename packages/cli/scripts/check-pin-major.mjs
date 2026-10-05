#!/usr/bin/env node
// The release refuses a tag whose major differs from the CLI floors the
// session hook and the skill pin (HOOK_MIN_CLI, SKILL_MIN_CLI). A caret on an
// older major never reaches the new one, so consumers would be served the old
// docs: 3.4.0 kept every 4.x consumer on 3.x. package.json cannot say this —
// it reads 1.0.0 in source and the release writes the tag's version.
// Usage: check-pin-major.mjs <version>
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

const src = (f) => readFileSync(fileURLToPath(new URL(`../src/${f}`, import.meta.url)), 'utf8')

/** The floor a source file declares, e.g. '4.4.0'. */
export function floorIn(text, name) {
  const m = new RegExp(`export const ${name} = '(\\d+)\\.\\d+\\.\\d+'`).exec(text)
  if (!m) throw new Error(`${name} not found`)
  return Number(m[1])
}

/** Problems for `version`: none when both floors share its major. */
export function pinMajorProblems(version, hookSrc, skillSrc) {
  const major = Number(String(version).replace(/^v/, '').split('.')[0])
  const floors = {
    HOOK_MIN_CLI: floorIn(hookSrc, 'HOOK_MIN_CLI'),
    SKILL_MIN_CLI: floorIn(skillSrc, 'SKILL_MIN_CLI'),
  }
  return Object.entries(floors)
    .filter(([, f]) => f !== major)
    .map(
      ([n, f]) =>
        `${n} is ^${f}.x but this release is ${major}.x — raise it, or no ${major}.x consumer gets this release's docs`,
    )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const version = process.argv[2]
  if (!version) {
    console.error('usage: check-pin-major.mjs <version>')
    process.exit(2)
  }
  const problems = pinMajorProblems(version, src('hook-script.ts'), src('skill-template.ts'))
  for (const p of problems) console.error(`check-pin-major: ${p}`)
  process.exit(problems.length ? 1 : 0)
}
