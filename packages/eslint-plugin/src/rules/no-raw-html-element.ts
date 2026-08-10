import type {TSESLint, TSESTree} from '@typescript-eslint/utils'
import {RSD_HTML_ELEMENTS, SVG_ONLY_TAGS} from '../util/jsx.js'
import {ensureNamedImport, isShadowed} from '../util/imports.js'

type MessageIds = 'useHtml' | 'noEquivalent' | 'suggestReplace'
type Options = [
  {
    allow?: string[]
    reportUnsupported?: boolean
    htmlModule?: string
  }?,
]

/**
 * Forbid raw lowercase JSX intrinsics (<div>, <span>, …) in favor of
 * react-strict-dom's html.* elements. SVG subtrees are exempt: RSD has no SVG
 * primitives, so anything inside <svg> (tracked by depth) or in the SVG-only
 * tag set stays raw.
 *
 * The rewrite is a *suggestion*, never an autofix: html.* elements accept a
 * strict prop subset (no className, etc.), so a mechanical `--fix` over a
 * whole tree would mint type errors wholesale. A suggestion keeps a human at
 * each site.
 */
export const noRawHtmlElement: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'problem',
    docs: {
      description: 'Require react-strict-dom html.* elements instead of raw HTML JSX intrinsics',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          allow: {type: 'array', items: {type: 'string'}, uniqueItems: true},
          reportUnsupported: {type: 'boolean'},
          htmlModule: {type: 'string'},
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useHtml: 'Use <html.{{tag}}> from react-strict-dom instead of the raw <{{tag}}> element.',
      noEquivalent:
        '<{{tag}}> has no react-strict-dom equivalent and is not portable. Compose it from html.* elements, or add it to this rule\'s "allow" option.',
      suggestReplace: 'Replace with <html.{{tag}}>',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    const allow = new Set(options.allow ?? [])
    const reportUnsupported = options.reportUnsupported ?? true
    const htmlModule = options.htmlModule ?? 'react-strict-dom'
    const sourceCode = context.sourceCode

    let svgDepth = 0

    function tagOf(node: TSESTree.JSXOpeningElement): string | null {
      return node.name.type === 'JSXIdentifier' ? node.name.name : null
    }

    return {
      JSXElement(node: TSESTree.JSXElement) {
        const tag = tagOf(node.openingElement)
        if (tag === 'svg') svgDepth++
      },
      'JSXElement:exit'(node: TSESTree.JSXElement) {
        const tag = tagOf(node.openingElement)
        if (tag === 'svg') svgDepth--
      },
      JSXOpeningElement(node: TSESTree.JSXOpeningElement) {
        const tag = tagOf(node)
        if (tag === null) return // member/namespaced names
        const first = tag.charAt(0)
        if (first !== first.toLowerCase()) return // component
        if (tag.includes('-')) return // custom element
        if (svgDepth > 0) return // inside an <svg> subtree
        if (SVG_ONLY_TAGS.has(tag)) return // detached SVG fragment helpers
        if (allow.has(tag)) return

        if (!RSD_HTML_ELEMENTS.has(tag)) {
          if (reportUnsupported) {
            context.report({node: node.name, messageId: 'noEquivalent', data: {tag}})
          }
          return
        }

        const shadowed = isShadowed(sourceCode.getScope(node), 'html', htmlModule)
        context.report({
          node: node.name,
          messageId: 'useHtml',
          data: {tag},
          suggest: shadowed
            ? []
            : [
                {
                  messageId: 'suggestReplace',
                  data: {tag},
                  fix(fixer) {
                    const {local, fixes} = ensureNamedImport(sourceCode, fixer, htmlModule, 'html')
                    const parent = node.parent as TSESTree.JSXElement
                    const edits = [...fixes, fixer.replaceText(node.name, `${local}.${tag}`)]
                    if (parent.closingElement) {
                      edits.push(fixer.replaceText(parent.closingElement.name, `${local}.${tag}`))
                    }
                    return edits
                  },
                },
              ],
        })
      },
    }
  },
}
