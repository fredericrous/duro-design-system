import {Node} from 'ts-morph'

/**
 * Evaluate a ts-morph expression node into a plain JS value. Deliberately
 * small: strings, numbers, booleans, null, arrays, object literals, `as
 * const`/parenthesized wrappers, expression-free template literals, and unary
 * minus. Throwing on anything else is a feature — it keeps metas and token
 * files declarative.
 */
export function staticEval(node, context = 'value') {
  if (Node.isStringLiteral(node) || Node.isNumericLiteral(node)) return node.getLiteralValue()
  if (Node.isPrefixUnaryExpression(node) && node.getOperatorToken() === 40 /* MinusToken */) {
    return -staticEval(node.getOperand(), context)
  }
  if (Node.isTrueLiteral(node)) return true
  if (Node.isFalseLiteral(node)) return false
  if (Node.isNullLiteral(node)) return null
  if (Node.isNoSubstitutionTemplateLiteral(node)) return node.getLiteralValue()
  if (Node.isTemplateExpression(node)) {
    throw new Error(
      `static-eval: template literal with expressions in ${context} — keep metas/token literals expression-free`,
    )
  }
  if (Node.isAsExpression(node) || Node.isParenthesizedExpression(node)) {
    return staticEval(node.getExpression(), context)
  }
  if (Node.isSatisfiesExpression(node)) return staticEval(node.getExpression(), context)
  if (Node.isArrayLiteralExpression(node)) {
    return node.getElements().map((el) => staticEval(el, context))
  }
  if (Node.isObjectLiteralExpression(node)) {
    const out = {}
    for (const prop of node.getProperties()) {
      if (!Node.isPropertyAssignment(prop)) {
        throw new Error(
          `static-eval: unsupported object member ${prop.getKindName()} in ${context}`,
        )
      }
      const nameNode = prop.getNameNode()
      const key = Node.isStringLiteral(nameNode) ? nameNode.getLiteralValue() : nameNode.getText()
      out[key] = staticEval(prop.getInitializerOrThrow(), `${context}.${key}`)
    }
    return out
  }
  throw new Error(`static-eval: unsupported node ${node.getKindName()} in ${context}`)
}
