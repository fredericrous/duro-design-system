#!/usr/bin/env node
import {parseArgs} from 'node:util'
import {loadRegistry} from './registry.js'
import {runLookup, type CommandResult} from './commands/lookup.js'
import {runList} from './commands/list.js'
import {runManifest, cliVersion} from './commands/manifest.js'

function emit(result: CommandResult, json: boolean): never {
  if (json) {
    process.stdout.write(JSON.stringify(result.data, null, 2) + '\n')
  } else {
    process.stdout.write(result.text + '\n')
  }
  process.exit(result.exitCode ?? 0)
}

function usageError(message: string): never {
  process.stderr.write(
    `${message}\nUsage: duro <name|list|manifest|mcp> [flags] — duro manifest for details\n`,
  )
  process.exit(2)
}

async function main(): Promise<void> {
  let parsed
  try {
    parsed = parseArgs({
      allowPositionals: true,
      options: {
        json: {type: 'boolean', default: false},
        part: {type: 'string'},
        props: {type: 'boolean', default: false},
        'source-only': {type: 'boolean', default: false},
        'no-color': {type: 'boolean', default: false},
        help: {type: 'boolean', short: 'h', default: false},
        version: {type: 'boolean', short: 'v', default: false},
      },
    })
  } catch (error) {
    usageError(`duro: ${error instanceof Error ? error.message : String(error)}`)
  }
  const {values, positionals} = parsed

  if (values.version) {
    process.stdout.write(cliVersion() + '\n')
    process.exit(0)
  }

  const registry = loadRegistry()

  // Version-skew guard: the registry documents the lockstep-released ui
  // version; warn (stderr only) when a locally installed ui differs.
  if (!values.json) {
    try {
      const {createRequire} = await import('node:module')
      const require = createRequire(process.cwd() + '/')
      const uiPkg = require('@duro-app/ui/package.json') as {version?: string}
      const own = cliVersion()
      if (uiPkg.version && own !== '0.0.0' && uiPkg.version !== own) {
        process.stderr.write(
          `duro: docs are for @duro-app/ui@${own}, you have ${uiPkg.version} — npm i -D @duro-app/cli@${uiPkg.version}\n`,
        )
      }
    } catch {
      // No local ui — nothing to compare.
    }
  }

  const [first, ...rest] = positionals

  if (values.help || first === undefined) {
    emit(runManifest(registry), values.json)
  }
  if (first === 'manifest') {
    emit(runManifest(registry), values.json)
  }
  if (first === 'list') {
    if (rest.length > 1) usageError('duro list takes at most one kind')
    emit(runList(registry, rest[0]), values.json)
  }
  if (first === 'mcp') {
    const {runMcp} = await import('./commands/mcp.js')
    await runMcp(registry)
    return
  }

  // Everything else is a lookup — multiple positionals become a search query.
  const query = [first, ...rest].join(' ')
  emit(
    runLookup(registry, query, {
      part: values.part,
      propsOnly: values.props,
      sourceOnly: values['source-only'],
    }),
    values.json,
  )
}

main().catch((error: unknown) => {
  const exitCode = (error as {exitCode?: number}).exitCode ?? 1
  process.stderr.write(`duro: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(exitCode)
})
