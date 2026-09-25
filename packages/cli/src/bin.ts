#!/usr/bin/env node
import {parseArgs} from 'node:util'
import {loadRegistry} from './registry.js'
import {runLookup, type CommandResult} from './commands/lookup.js'
import {runList} from './commands/list.js'
import {runHook} from './commands/hook.js'
import {runMockup} from './commands/mockup.js'
import {runSkill} from './commands/skill.js'
import {runDoctor, uiVersionSkew} from './commands/doctor.js'
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
    `${message}\nUsage: duro <name|list|manifest|hook|skill|mockup|doctor|mcp> [flags] — duro manifest for details\n`,
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
        check: {type: 'boolean', default: false},
        session: {type: 'boolean', default: false},
        out: {type: 'string'},
        name: {type: 'string'},
        theme: {type: 'string'},
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

  const [first, ...rest] = positionals

  // Version-skew guard: the registry documents the lockstep-released ui
  // version; warn (stderr only) when a locally installed ui differs. doctor
  // reports the same skew as one of its findings instead.
  if (!values.json && first !== 'doctor') {
    const skew = uiVersionSkew(process.cwd())
    if (skew) {
      process.stderr.write(
        `duro: docs are for @duro-app/ui@${skew.own}, you have ${skew.installed} — npm i -D @duro-app/cli@${skew.installed}\n`,
      )
    }
  }

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
  if (first === 'hook') {
    if (rest.length > 1) usageError('duro hook takes exactly one event')
    emit(runHook(registry, rest[0], {check: values.check}), values.json)
  }
  if (first === 'skill') {
    if (rest.length > 1) usageError('duro skill takes exactly one action')
    emit(runSkill(rest[0], {check: values.check}), values.json)
  }
  if (first === 'mockup') {
    const [sub, ...files] = rest
    emit(
      runMockup(registry, sub, files, {out: values.out, name: values.name, theme: values.theme}),
      values.json,
    )
  }
  if (first === 'doctor') {
    if (rest.length > 0) usageError('duro doctor takes no arguments — run it from the package root')
    emit(runDoctor({session: values.session}), values.json)
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
