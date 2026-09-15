import type {TSESLint, TSESTree} from '@typescript-eslint/utils'
import {BREAKPOINT_TOKENS_BY_PX} from '../util/tokens.js'
import {ensureNamedImport, isShadowed} from '../util/imports.js'

type MessageIds = 'rawBreakpointQuery'
type Options = []

const QUERY_RE = /\((?:min|max)-(?:width|height)\s*:\s*(\d+)px\)/
const BREAKPOINTS_MODULE = '@duro-app/tokens/tokens/breakpoints.css'

const SCALE = Object.keys(BREAKPOINT_TOKENS_BY_PX)
  .map(Number)
  .sort((a, b) => a - b)
  .join(' / ')

/**
 * A media-query string anywhere in a file — `useMediaQuery("(min-width:
 * 768px)")`, `matchMedia(...)`, a hook's constant — carries a raw breakpoint.
 * `no-raw-design-values` covers the `@media` keys inside css.create; this
 * covers the strings that never reach a style object and so slipped past it.
 *
 * On the scale the fix rewrites the literal to a template literal reading
 * `breakpoints.<key>` (a css.defineConsts string, so `${breakpoints.md}`
 * interpolates to '768px') and adds the import. Off the scale it reports.
 */
export const noRawBreakpointQuery: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow raw px breakpoints in media-query strings; use breakpoints.<key>',
    },
    fixable: 'code',
    schema: [],
    messages: {
      rawBreakpointQuery:
        '{{value}}px is a raw breakpoint in a media query. Use `breakpoints.{{token}}` from @duro-app/tokens/tokens/breakpoints.css (the scale is {{scale}}px).',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode

    function isStyleKey(node: TSESTree.Node): boolean {
      return node.parent?.type === 'Property' && node.parent.key === node
    }

    function check(node: TSESTree.Literal | TSESTree.TemplateLiteral, text: string) {
      const match = QUERY_RE.exec(text)
      if (!match) return
      // css.create condition keys belong to no-raw-design-values.
      if (isStyleKey(node)) return
      const px = Number(match[1])
      const token = BREAKPOINT_TOKENS_BY_PX[px]
      const data = {value: String(px), token: token ?? '*', scale: SCALE}
      if (!token) {
        context.report({node, messageId: 'rawBreakpointQuery', data})
        return
      }
      const shadowed = isShadowed(sourceCode.getScope(node), 'breakpoints', BREAKPOINTS_MODULE)
      context.report({
        node,
        messageId: 'rawBreakpointQuery',
        data,
        fix: shadowed
          ? null
          : (fixer) => {
              const {local, fixes} = ensureNamedImport(
                sourceCode,
                fixer,
                BREAKPOINTS_MODULE,
                'breakpoints',
              )
              const rewritten = text.replace(`${px}px`, `\${${local}.${token}}`)
              return [...fixes, fixer.replaceText(node, '`' + rewritten.replace(/`/g, '\\`') + '`')]
            },
      })
    }

    return {
      Literal(node: TSESTree.Literal) {
        if (typeof node.value === 'string') check(node, node.value)
      },
      TemplateLiteral(node: TSESTree.TemplateLiteral) {
        if (node.expressions.length > 0) return
        check(node, node.quasis.map((q) => q.value.cooked ?? '').join(''))
      },
    }
  },
}
