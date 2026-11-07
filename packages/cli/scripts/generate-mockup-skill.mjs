#!/usr/bin/env node
// Writes skills/duro-mockup/SKILL.md from src/skill-template.ts (via the build),
// so the template stays the one source and the file grh copies never drifts.
// Usage: pnpm --filter @duro-app/cli run build && node scripts/generate-mockup-skill.mjs
import {mkdirSync, writeFileSync} from 'node:fs'
import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {SKILL} from '../dist/skill-template.js'

const target = fileURLToPath(new URL('../skills/duro-mockup/SKILL.md', import.meta.url))
mkdirSync(dirname(target), {recursive: true})
writeFileSync(target, SKILL, 'utf8')
