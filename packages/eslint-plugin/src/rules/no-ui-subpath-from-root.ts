import type {TSESLint, TSESTree} from '@typescript-eslint/utils'
import {UI_SUBPATH_EXPORTS} from '../util/ui-subpaths.js'

type MessageIds = 'subpathFromRoot'
type Options = []

const UI = '@duro-app/ui'

/**
 * Names that live only behind an `@duro-app/ui` subpath, imported from the
 * package root. `Form` moved to `@duro-app/ui/form` in 4.0 (react-hook-form
 * and @hookform/resolvers stay optional peers only if the root never reaches
 * them); the TanStack pieces moved to `@duro-app/ui/table` in 3.0. From the
 * root they are simply missing — a type error, or `undefined` at runtime.
 *
 * The fix moves those specifiers to the subpath (extending an existing import
 * of it when there is one) and keeps the rest on the root, preserving aliases
 * and inline `type` markers.
 */
export const noUiSubpathFromRoot: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: 'problem',
    docs: {
      description:
        'Import Form from @duro-app/ui/form and the TanStack table pieces from @duro-app/ui/table, not the package root',
    },
    fixable: 'code',
    schema: [],
    messages: {
      subpathFromRoot:
        '`{{name}}` is not exported from @duro-app/ui — import it from {{target}}. The subpath keeps its optional peers ({{peers}}) out of every app that imports the root.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode

    function importedName(spec: TSESTree.ImportSpecifier | TSESTree.ExportSpecifier): string {
      const node = 'imported' in spec ? spec.imported : spec.local
      return node.type === 'Identifier' ? node.name : String(node.value)
    }

    function checkImport(node: TSESTree.ImportDeclaration) {
      if (node.source.value !== UI) return
      const named = node.specifiers.filter(
        (spec): spec is TSESTree.ImportSpecifier => spec.type === 'ImportSpecifier',
      )
      const moved = named.filter((spec) => UI_SUBPATH_EXPORTS[importedName(spec)])
      if (moved.length === 0) return

      const quote = sourceCode.getText(node.source)[0]
      const semi = sourceCode.getText(node).endsWith(';') ? ';' : ''
      const declType = node.importKind === 'type' ? 'type ' : ''
      const bySubpath = new Map<string, string[]>()
      for (const spec of moved) {
        const subpath = UI_SUBPATH_EXPORTS[importedName(spec)]!.subpath
        bySubpath.set(subpath, [...(bySubpath.get(subpath) ?? []), sourceCode.getText(spec)])
      }

      const fix = (fixer: TSESLint.RuleFixer): TSESLint.RuleFix[] => {
        const fixes: TSESLint.RuleFix[] = []
        const added: string[] = []
        for (const [subpath, texts] of bySubpath) {
          const target = `${UI}/${subpath}`
          const existing = sourceCode.ast.body.find(
            (stmt): stmt is TSESTree.ImportDeclaration =>
              stmt.type === 'ImportDeclaration' &&
              stmt.source.value === target &&
              stmt.importKind === node.importKind &&
              stmt.specifiers.length > 0 &&
              stmt.specifiers.every((s) => s.type === 'ImportSpecifier'),
          )
          if (existing) {
            const last = existing.specifiers[existing.specifiers.length - 1]!
            fixes.push(fixer.insertTextAfter(last, `, ${texts.join(', ')}`))
          } else {
            added.push(
              `import ${declType}{${texts.join(', ')}} from ${quote}${target}${quote}${semi}`,
            )
          }
        }

        const kept = node.specifiers.filter(
          (spec) => !(spec.type === 'ImportSpecifier' && moved.includes(spec)),
        )
        const keptText =
          kept.length === 0
            ? null
            : kept.every((spec) => spec.type === 'ImportSpecifier')
              ? `import ${declType}{${kept.map((s) => sourceCode.getText(s)).join(', ')}} from ${quote}${UI}${quote}${semi}`
              : null
        if (kept.length > 0 && keptText === null) {
          // A default/namespace specifier alongside: drop just the moved ones.
          for (const spec of moved) {
            const after = sourceCode.getTokenAfter(spec)
            fixes.push(
              after?.value === ','
                ? fixer.removeRange([spec.range[0], sourceCode.getTokenAfter(after)!.range[0]])
                : fixer.removeRange([sourceCode.getTokenBefore(spec)!.range[0], spec.range[1]]),
            )
          }
          if (added.length) fixes.push(fixer.insertTextAfter(node, `\n${added.join('\n')}`))
          return fixes
        }
        const lines = [...(keptText ? [keptText] : []), ...added]
        if (lines.length === 0) {
          const end = sourceCode.text[node.range[1]] === '\n' ? node.range[1] + 1 : node.range[1]
          fixes.push(fixer.removeRange([node.range[0], end]))
        } else {
          fixes.push(fixer.replaceText(node, lines.join('\n')))
        }
        return fixes
      }

      moved.forEach((spec, i) => {
        const entry = UI_SUBPATH_EXPORTS[importedName(spec)]!
        context.report({
          node: spec,
          messageId: 'subpathFromRoot',
          data: {name: importedName(spec), target: `${UI}/${entry.subpath}`, peers: entry.peers},
          // One fix rewrites the whole declaration; attach it once.
          fix: i === 0 ? fix : null,
        })
      })
    }

    return {
      ImportDeclaration: checkImport,
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        if (node.source?.value !== UI) return
        for (const spec of node.specifiers) {
          const entry = UI_SUBPATH_EXPORTS[importedName(spec)]
          if (!entry) continue
          context.report({
            node: spec,
            messageId: 'subpathFromRoot',
            data: {name: importedName(spec), target: `${UI}/${entry.subpath}`, peers: entry.peers},
          })
        }
      },
    }
  },
}
