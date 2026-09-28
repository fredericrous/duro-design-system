import type {TSESLint, TSESTree} from '@typescript-eslint/utils'
import {BREAKPOINT_TOKENS_BY_PX} from '../util/tokens.js'
import {ensureNamedImport, isShadowed} from '../util/imports.js'

type MessageIds =
  | 'rawBreakpointQuery'
  | 'rawBreakpointStyleQuery'
  | 'runtimeBreakpointConst'
  | 'breakpointsPxFromStyleModule'
type Options = []

const QUERY_RE = /\((?:min|max)-(?:width|height)\s*:\s*(\d+)px\)/
/** A string that is a style condition (`@media …`), never a matchMedia query. */
const CONDITION_RE = /^\s*@(?:media|container)\b/
const BREAKPOINTS_MODULE = '@duro-app/tokens/tokens/breakpoints.css'
const RAW_MODULE = '@duro-app/tokens/raw'
const STYLE_FACTORIES = new Set(['css.create', 'stylex.create'])
/** What raw.ts exports that breakpoints.css also does: a moved import still resolves. */
const RAW_BREAKPOINT_EXPORTS = new Set(['breakpointsPx', 'Breakpoint'])

const SCALE = Object.keys(BREAKPOINT_TOKENS_BY_PX)
  .map(Number)
  .sort((a, b) => a - b)
  .join(' / ')
const TOKEN_KEYS = new Set(Object.values(BREAKPOINT_TOKENS_BY_PX))

/**
 * A media-query string anywhere in a file — `useMediaQuery("(min-width:
 * 768px)")`, `matchMedia(...)`, a hook's constant — carries a raw breakpoint.
 * `no-raw-design-values` covers the `@media` keys inside css.create; this
 * covers the strings that never reach a style object and so slipped past it.
 *
 * The replacement depends on where the query runs:
 *
 * - **Style context** — inside css.create, or a string that is itself a
 *   style condition (`'@media (max-width: 768px)'` in a constant later used
 *   as a key): `breakpoints.<key>` from tokens/breakpoints.css, a
 *   css.defineConsts string StyleX inlines into the query.
 * - **Runtime context** — everything else (`matchMedia`, `useMediaQuery`, a
 *   width comparison): `breakpointsPx.<key>` from `@duro-app/tokens/raw`.
 *   tokens/breakpoints.css throws when imported where StyleX isn't compiling
 *   it (vitest, Node, an uncompiled hook), so runtime code must not import it.
 *
 * For the same reason it reports runtime reads of the `breakpoints` const,
 * and `breakpointsPx` imported from the StyleX module, and moves both to raw
 * when that can be done without leaving the style import behind half-used.
 */
export const noRawBreakpointQuery: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow raw px breakpoints in media-query strings; use breakpoints.<key> in styles and breakpointsPx.<key> from @duro-app/tokens/raw at runtime',
    },
    fixable: 'code',
    schema: [],
    messages: {
      rawBreakpointQuery:
        '{{value}}px is a raw breakpoint in a media query. At runtime use `${breakpointsPx.{{token}}}px` from @duro-app/tokens/raw (the scale is {{scale}}px) — tokens/breakpoints.css throws outside StyleX.',
      rawBreakpointStyleQuery:
        '{{value}}px is a raw breakpoint in a style condition. Use `breakpoints.{{token}}` from @duro-app/tokens/tokens/breakpoints.css (the scale is {{scale}}px).',
      runtimeBreakpointConst:
        '`{{name}}` from tokens/breakpoints.css is a StyleX const: it only exists where StyleX compiles the file, and importing it anywhere else (vitest, Node, a hook) throws. Outside css.create use `${breakpointsPx.<key>}px` from @duro-app/tokens/raw.',
      breakpointsPxFromStyleModule:
        'Import `{{name}}` from @duro-app/tokens/raw. tokens/breakpoints.css runs css.defineConsts at import time and throws where StyleX is not compiling it.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode

    function isStyleKey(node: TSESTree.Node): boolean {
      return node.parent?.type === 'Property' && node.parent.key === node
    }

    /** Inside the argument of css.create / stylex.create. */
    function insideStyleFactory(node: TSESTree.Node): boolean {
      for (let n: TSESTree.Node | undefined = node.parent; n; n = n.parent) {
        if (n.type === 'CallExpression' && STYLE_FACTORIES.has(sourceCode.getText(n.callee))) {
          return true
        }
      }
      return false
    }

    /** A template literal whose text opens with `@media` / `@container`. */
    function insideConditionTemplate(node: TSESTree.Node): boolean {
      for (let n: TSESTree.Node | undefined = node.parent; n; n = n.parent) {
        if (n.type === 'TemplateLiteral') {
          if (CONDITION_RE.test(n.quasis[0]?.value.cooked ?? '')) return true
        }
      }
      return false
    }

    function checkLiteral(node: TSESTree.Literal | TSESTree.TemplateLiteral, text: string) {
      const match = QUERY_RE.exec(text)
      if (!match) return
      // css.create condition keys belong to no-raw-design-values.
      if (isStyleKey(node)) return
      const px = Number(match[1])
      const token = BREAKPOINT_TOKENS_BY_PX[px]
      const style = CONDITION_RE.test(text) || insideStyleFactory(node)
      const messageId = style ? 'rawBreakpointStyleQuery' : 'rawBreakpointQuery'
      const data = {value: String(px), token: token ?? '*', scale: SCALE}
      if (!token) {
        context.report({node, messageId, data})
        return
      }
      const [importName, moduleName, render] = style
        ? ['breakpoints', BREAKPOINTS_MODULE, (local: string) => `\${${local}.${token}}`]
        : ['breakpointsPx', RAW_MODULE, (local: string) => `\${${local}.${token}}px`]
      const shadowed = isShadowed(sourceCode.getScope(node), importName, moduleName)
      context.report({
        node,
        messageId,
        data,
        fix: shadowed
          ? null
          : (fixer) => {
              const {local, fixes} = ensureNamedImport(sourceCode, fixer, moduleName, importName)
              const rewritten = text.replace(`${px}px`, render(local))
              return [...fixes, fixer.replaceText(node, '`' + rewritten.replace(/`/g, '\\`') + '`')]
            },
      })
    }

    /**
     * `${breakpoints.md}` read at runtime. Fixed only when every runtime read
     * sits directly in a template literal (so `${breakpointsPx.md}px` keeps the
     * string identical) and nothing in the file still needs the const — the
     * point of the fix is dropping the import that throws.
     */
    function checkConstReads(decl: TSESTree.ImportDeclaration) {
      for (const spec of decl.specifiers) {
        if (
          spec.type !== 'ImportSpecifier' ||
          spec.importKind === 'type' ||
          spec.imported.type !== 'Identifier' ||
          spec.imported.name !== 'breakpoints'
        ) {
          continue
        }
        const variable = sourceCode.getDeclaredVariables(spec)[0]
        if (!variable) continue
        const refs = variable.references.map((ref) => ref.identifier as TSESTree.Identifier)
        const runtime = refs.filter((id) => !insideStyleFactory(id) && !insideConditionTemplate(id))
        if (runtime.length === 0) continue

        const rewrites = runtime.map((id) => runtimeRewrite(id))
        const fixable =
          runtime.length === refs.length &&
          rewrites.every((r) => r !== null) &&
          !isShadowed(sourceCode.getScope(decl), 'breakpointsPx', RAW_MODULE)

        runtime.forEach((id, i) => {
          context.report({
            node: id.parent?.type === 'MemberExpression' ? id.parent : id,
            messageId: 'runtimeBreakpointConst',
            data: {name: spec.local.name},
            fix:
              fixable && i === 0
                ? (fixer) => {
                    const {local, fixes} = swapImport(fixer, decl, spec)
                    return [...fixes, ...rewrites.flatMap((r) => r!(fixer, local))]
                  }
                : null,
          })
        })
      }
    }

    type Rewrite = (fixer: TSESLint.RuleFixer, local: string) => TSESLint.RuleFix[]

    /** `${breakpoints.md}` → `${breakpointsPx.md}px`, or null when not that shape. */
    function runtimeRewrite(id: TSESTree.Identifier): Rewrite | null {
      const member = id.parent
      if (
        member?.type !== 'MemberExpression' ||
        member.object !== id ||
        member.computed ||
        member.property.type !== 'Identifier' ||
        !TOKEN_KEYS.has(member.property.name)
      ) {
        return null
      }
      const template = member.parent
      if (template?.type !== 'TemplateLiteral') return null
      const index = template.expressions.indexOf(member)
      const next = template.quasis[index + 1]
      if (index < 0 || !next) return null
      const key = member.property.name
      return (fixer, local) => [
        fixer.replaceText(member, `${local}.${key}`),
        // The quasi after an expression starts at its closing `}`.
        fixer.insertTextAfterRange([next.range[0], next.range[0] + 1], 'px'),
      ]
    }

    /**
     * Drop `spec` from the breakpoints.css import and import `breakpointsPx`
     * from raw instead. A declaration left empty is rewritten in place, so
     * the new import never lands inside the range being removed.
     */
    function swapImport(
      fixer: TSESLint.RuleFixer,
      decl: TSESTree.ImportDeclaration,
      spec: TSESTree.ImportSpecifier,
    ): {local: string; fixes: TSESLint.RuleFix[]} {
      const hasRawImport = sourceCode.ast.body.some(
        (stmt) =>
          stmt.type === 'ImportDeclaration' &&
          stmt.source.value === RAW_MODULE &&
          stmt.importKind !== 'type',
      )
      if (decl.specifiers.length === 1 && !hasRawImport) {
        const quote = sourceCode.getText(decl.source)[0]
        const semi = sourceCode.getText(decl).endsWith(';') ? ';' : ''
        return {
          local: 'breakpointsPx',
          fixes: [
            fixer.replaceText(
              decl,
              `import {breakpointsPx} from ${quote}${RAW_MODULE}${quote}${semi}`,
            ),
          ],
        }
      }
      const {local, fixes} = ensureNamedImport(sourceCode, fixer, RAW_MODULE, 'breakpointsPx')
      return {local, fixes: [...fixes, removeSpecifier(fixer, decl, spec)]}
    }

    function removeSpecifier(
      fixer: TSESLint.RuleFixer,
      decl: TSESTree.ImportDeclaration,
      spec: TSESTree.ImportSpecifier,
    ): TSESLint.RuleFix {
      if (decl.specifiers.length === 1) {
        const end = sourceCode.text[decl.range[1]] === '\n' ? decl.range[1] + 1 : decl.range[1]
        return fixer.removeRange([decl.range[0], end])
      }
      const index = decl.specifiers.indexOf(spec)
      const after = sourceCode.getTokenAfter(spec)
      if (after?.value === ',') {
        const following = sourceCode.getTokenAfter(after)
        return fixer.removeRange([spec.range[0], following ? following.range[0] : after.range[1]])
      }
      const prev = decl.specifiers[index - 1]
      return fixer.removeRange([prev ? prev.range[1] : spec.range[0], spec.range[1]])
    }

    /** `import {breakpointsPx} from '…/breakpoints.css'` → from raw. */
    function checkPxImport(decl: TSESTree.ImportDeclaration) {
      const named = decl.specifiers.filter(
        (spec): spec is TSESTree.ImportSpecifier =>
          spec.type === 'ImportSpecifier' && spec.imported.type === 'Identifier',
      )
      const offending = named.filter(
        (spec) =>
          (spec.imported as TSESTree.Identifier).name === 'breakpointsPx' &&
          spec.importKind !== 'type' &&
          decl.importKind !== 'type',
      )
      if (offending.length === 0) return
      // Movable as a whole when raw exports everything the declaration names.
      const movable =
        named.length === decl.specifiers.length &&
        named.every((spec) =>
          RAW_BREAKPOINT_EXPORTS.has((spec.imported as TSESTree.Identifier).name),
        )
      for (const spec of offending) {
        context.report({
          node: spec,
          messageId: 'breakpointsPxFromStyleModule',
          data: {name: 'breakpointsPx'},
          fix: movable
            ? (fixer) => {
                const quote = sourceCode.getText(decl.source)[0]
                return fixer.replaceText(decl.source, `${quote}${RAW_MODULE}${quote}`)
              }
            : null,
        })
      }
    }

    return {
      Literal(node: TSESTree.Literal) {
        if (typeof node.value === 'string') checkLiteral(node, node.value)
      },
      TemplateLiteral(node: TSESTree.TemplateLiteral) {
        if (node.expressions.length > 0) return
        checkLiteral(node, node.quasis.map((q) => q.value.cooked ?? '').join(''))
      },
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        if (node.source.value !== BREAKPOINTS_MODULE) return
        checkPxImport(node)
        checkConstReads(node)
      },
    }
  },
}
