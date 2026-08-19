import {readFileSync, readdirSync} from 'node:fs'
import {join} from 'node:path'
import {Node} from 'ts-morph'
import {staticEval} from './static-eval.mjs'
import {repoRoot} from './project.mjs'

const PLUGIN_SRC = 'packages/eslint-plugin/src'
const RULES_START = '<!-- duro:rules:start -->'
const RULES_END = '<!-- duro:rules:end -->'

function findProperty(objectLiteral, name) {
  const prop = objectLiteral.getProperty(name)
  if (!prop || !Node.isPropertyAssignment(prop)) return null
  return prop.getInitializer()
}

export function extractRules(project) {
  // Severities from configs.recommended in src/index.ts.
  const indexFile = project.getSourceFileOrThrow(join(repoRoot, PLUGIN_SRC, 'index.ts'))
  const severities = {}
  indexFile.forEachDescendant((node) => {
    if (Node.isPropertyAssignment(node) && /^'duro\//.test(node.getNameNode().getText())) {
      const id = node.getNameNode().getText().slice(1, -1)
      severities[id] = staticEval(node.getInitializerOrThrow(), `index.ts#${id}`)
    }
  })

  const lint = []
  const ruleFiles = readdirSync(join(repoRoot, PLUGIN_SRC, 'rules'))
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
    .sort()
  for (const file of ruleFiles) {
    const sourceFile = project.getSourceFileOrThrow(join(repoRoot, PLUGIN_SRC, 'rules', file))
    const ruleVar = sourceFile.getVariableDeclarations().find((decl) => decl.isExported())
    if (!ruleVar) throw new Error(`${file}: no exported rule found`)
    const ruleObject = ruleVar.getInitializerOrThrow()
    const meta = findProperty(ruleObject, 'meta')
    if (!meta) throw new Error(`${file}: rule has no meta`)
    const docs = findProperty(meta, 'docs')
    const description = docs
      ? staticEval(findProperty(docs, 'description'), `${file}#description`)
      : ''
    const messages = staticEval(findProperty(meta, 'messages'), `${file}#messages`)
    const hasFix = findProperty(meta, 'fixable') !== null
    const hasSuggestions = findProperty(meta, 'hasSuggestions') !== null
    const id = `duro/${file.replace(/\.ts$/, '')}`
    const severity = severities[id]
    if (!severity)
      throw new Error(`${file}: ${id} missing from configs.recommended in ${PLUGIN_SRC}/index.ts`)
    lint.push({
      id,
      severity,
      description,
      fixable: hasFix ? 'autofix' : hasSuggestions ? 'suggestion' : 'none',
      messages,
    })
  }

  // Critical-rules prose sliced from CLAUDE.md between the duro:rules markers.
  const claudeMd = readFileSync(join(repoRoot, 'CLAUDE.md'), 'utf8')
  const start = claudeMd.indexOf(RULES_START)
  const end = claudeMd.indexOf(RULES_END)
  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `CLAUDE.md is missing the ${RULES_START} / ${RULES_END} markers around the Critical Rules section — add them (the generator reads, never writes, that region)`,
    )
  }
  const critical = claudeMd.slice(start + RULES_START.length, end).trim()
  if (critical.length === 0) throw new Error('CLAUDE.md duro:rules region is empty')

  return {critical, lint}
}

export {RULES_START, RULES_END}
