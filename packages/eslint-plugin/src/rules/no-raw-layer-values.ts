import type {TSESLint, TSESTree} from '@typescript-eslint/utils'
import {EFFECTS_BY_VALUE, LAYERS_BY_VALUE, normalizeValue} from '../util/tokens.js'
import {ensureNamedImport} from '../util/imports.js'
import {matchesAnyGlob} from '../util/glob.js'

type MessageIds = 'rawZIndex' | 'offScaleZIndex' | 'rawEffect' | 'replaceWithToken'
type Options = [{factories?: string[]; exemptFiles?: string[]; localMax?: number}?]

const TOKENS_PKG = '@duro-app/tokens'
const Z_INDEX_PROPERTIES = new Set(['zIndex'])
const EFFECT_PROPERTIES = new Set(['backdropFilter', 'filter'])
const BLUR_RE = /\bblur\([^)]*\)/
/** Default ceiling for component-local stacking values that are not reported. */
const DEFAULT_LOCAL_MAX = 9

const LAYER_VALUES = Object.keys(LAYERS_BY_VALUE)
  .map(Number)
  .sort((a, b) => a - b)

/** The layers at or below `value` and above it, for an off-scale z-index. */
function nearestLayers(value: number): string {
  const below = [...LAYER_VALUES].reverse().find((v) => v <= value)
  const above = LAYER_VALUES.find((v) => v > value)
  const name = (v: number) => `\`layers.${LAYERS_BY_VALUE[v]}\` (${v})`
  if (below === undefined) return `below ${name(above!)}`
  if (above === undefined) return `above ${name(below)}`
  return `between ${name(below)} and ${name(above)}`
}

/**
 * Inside css.create() style objects, flag a raw z-index and a raw blur:
 *
 * - `zIndex`: a number or numeric string other than 0 and negatives. A layers
 *   value suggests its `layers.*` token. A value up to `localMax` (default 9,
 *   at most 49, below `layers.floating`) that is not a layer orders children
 *   inside one component and is not reported: a z-index is not one of the
 *   measures ADR-0027 makes a token, so this is the rule's scope, not an
 *   exemption. Any other value names the layers it sits between, without a
 *   fix.
 * - `backdropFilter` / `filter`: a `blur(...)` literal that is an `effects.*`
 *   value (`blur(2px)`, `blur(6px)`) suggests its token; another blur reports
 *   without a fix.
 *
 * Recommended at `warn` in 5.x; it becomes an error in the next major. It is
 * a rule of its own, apart from no-raw-design-values (an error), because
 * ESLint sets severity per rule.
 */
export const noRawLayerValues: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer the layers (z-index) and effects tokens over raw z-index and blur values in css.create styles',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          factories: {type: 'array', items: {type: 'string'}, uniqueItems: true},
          exemptFiles: {type: 'array', items: {type: 'string'}, uniqueItems: true},
          localMax: {type: 'integer', minimum: 0, maximum: 49},
        },
        additionalProperties: false,
      },
    ],
    messages: {
      rawZIndex:
        '{{value}} on `zIndex` is the layers.{{token}} token. Use it from {{pkg}}/tokens/layers.css.',
      offScaleZIndex:
        '{{value}} on `zIndex` is not a layer; it sits {{nearest}}. Use a `layers.*` token from {{pkg}}/tokens/layers.css when it plays that role; values up to `localMax` that order children inside one component are not reported.',
      rawEffect:
        "'{{value}}' on `{{property}}` is a raw effect{{tokenText}}. Use the `effects.*` tokens from {{pkg}}/tokens/effects.css.",
      replaceWithToken: 'Replace with {{replacement}}',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    const factories = options.factories ?? ['css.create']
    const localMax = options.localMax ?? DEFAULT_LOCAL_MAX
    if (matchesAnyGlob(context.filename, context.cwd, options.exemptFiles ?? [])) return {}
    const sourceCode = context.sourceCode

    function suggest(
      node: TSESTree.Node,
      group: 'layers' | 'effects',
      token: string,
    ): TSESLint.ReportSuggestionArray<MessageIds> {
      const replacement = `${group}.${token}`
      return [
        {
          messageId: 'replaceWithToken',
          data: {replacement},
          fix(fixer) {
            const {local, fixes} = ensureNamedImport(
              sourceCode,
              fixer,
              `${TOKENS_PKG}/tokens/${group}.css`,
              group,
            )
            return [...fixes, fixer.replaceText(node, `${local}.${token}`)]
          },
        },
      ]
    }

    function checkZIndex(node: TSESTree.Node) {
      let value: number | null = null
      if (node.type === 'Literal' && typeof node.value === 'number') value = node.value
      if (node.type === 'Literal' && typeof node.value === 'string') {
        const text = node.value.trim()
        if (/^\d+$/.test(text)) value = Number(text)
      }
      if (value === null || value <= 0) return
      if (value <= localMax && !LAYERS_BY_VALUE[value]) return
      const display = sourceCode.getText(node)
      const token = LAYERS_BY_VALUE[value]
      if (token) {
        context.report({
          node,
          messageId: 'rawZIndex',
          data: {value: display, token, pkg: TOKENS_PKG},
          suggest: suggest(node, 'layers', token),
        })
        return
      }
      context.report({
        node,
        messageId: 'offScaleZIndex',
        data: {value: display, nearest: nearestLayers(value), pkg: TOKENS_PKG},
      })
    }

    function checkEffect(node: TSESTree.Node, property: string) {
      if (node.type !== 'Literal' || typeof node.value !== 'string') return
      const value = node.value
      if (!BLUR_RE.test(value)) return
      const token = EFFECTS_BY_VALUE[normalizeValue(value)]
      context.report({
        node,
        messageId: 'rawEffect',
        data: {
          value,
          property,
          tokenText: token ? ` (it is effects.${token})` : '',
          pkg: TOKENS_PKG,
        },
        suggest: token ? suggest(node, 'effects', token) : [],
      })
    }

    function checkValue(node: TSESTree.Node, property: string | null) {
      if (node.type === 'ObjectExpression') {
        walk(node, property)
        return
      }
      if (property && Z_INDEX_PROPERTIES.has(property)) checkZIndex(node)
      else if (property && EFFECT_PROPERTIES.has(property)) checkEffect(node, property)
    }

    function walk(obj: TSESTree.ObjectExpression, property: string | null) {
      for (const prop of obj.properties) {
        if (prop.type !== 'Property') continue
        const key =
          prop.key.type === 'Identifier'
            ? prop.key.name
            : prop.key.type === 'Literal'
              ? String(prop.key.value)
              : null
        if (key === null) continue
        // Condition keys (default, :hover, @media …) keep the enclosing property.
        const isCondition = key === 'default' || /^[:@]/.test(key)
        checkValue(prop.value as TSESTree.Node, isCondition ? property : key)
      }
    }

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (!factories.includes(sourceCode.getText(node.callee))) return
        const arg = node.arguments[0]
        if (!arg || arg.type !== 'ObjectExpression') return
        for (const prop of arg.properties) {
          if (prop.type !== 'Property') continue
          const value = prop.value
          if (value.type === 'ObjectExpression') walk(value, null)
          if (
            (value.type === 'ArrowFunctionExpression' || value.type === 'FunctionExpression') &&
            value.body.type === 'ObjectExpression'
          ) {
            walk(value.body, null)
          }
        }
      },
    }
  },
}
