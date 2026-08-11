import {readFileSync} from 'node:fs'
import type {Registry} from '../registry-types.js'
import {buildManifest, COMMANDS} from '../manifest.js'
import type {CommandResult} from './lookup.js'

export function cliVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
    ) as {
      version?: string
    }
    return pkg.version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
}

export function runManifest(registry: Registry): CommandResult {
  const manifest = buildManifest(registry, cliVersion())
  const text = [
    `duro — ${manifest.description}`,
    '',
    `USAGE  ${manifest.usage}`,
    '',
    ...COMMANDS.map((command) => {
      const flags = command.flags.map((flag) => `--${flag.name}`).join(' ')
      return [
        `  duro ${command.name === 'lookup' ? '<name>' : command.name}${flags ? `  [${flags}]` : ''}`,
        `      ${command.summary}`,
        ...command.examples.map((example) => `      $ ${example}`),
      ].join('\n')
    }),
    '',
    `GLOBAL  ${manifest.globalFlags.map((flag) => `--${flag.name}`).join(' · ')}`,
    `NAMES   ${manifest.enums.names.length} — duro list`,
  ].join('\n')
  return {text, data: manifest}
}
