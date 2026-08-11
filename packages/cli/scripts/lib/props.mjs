import {Node} from 'ts-morph'

function cleanJsDoc(text) {
  if (!text) return undefined
  const oneParagraph = text.replace(/\s+/g, ' ').trim()
  return oneParagraph.length > 0 ? oneParagraph : undefined
}

function jsDocOf(node) {
  if (Node.isJSDocable(node)) {
    const docs = node.getJsDocs()
    if (docs.length > 0) {
      const doc = docs[docs.length - 1]
      const description = cleanJsDoc(doc.getDescription())
      const deprecatedTag = doc.getTags().find((tag) => tag.getTagName() === 'deprecated')
      const deprecated = deprecatedTag
        ? (cleanJsDoc(deprecatedTag.getCommentText()) ?? true)
        : undefined
      return {description, deprecated}
    }
  }
  // Fallback: leading /** */ comment ranges — JSDoc on object-literal members
  // (compound parts) isn't surfaced through getJsDocs().
  const leading = node.getLeadingCommentRanges?.() ?? []
  const block = leading.map((range) => range.getText()).find((text) => text.startsWith('/**'))
  if (block) {
    const body = block.replace(/^\/\*\*|\*\/$/g, '').replace(/^\s*\* ?/gm, '')
    const deprecatedMatch = /@deprecated\s*([^\n@]*)/.exec(body)
    const description = cleanJsDoc(body.replace(/@\w+[^\n]*/g, ''))
    return {
      description,
      deprecated: deprecatedMatch ? (cleanJsDoc(deprecatedMatch[1]) ?? true) : undefined,
    }
  }
  return {}
}

/** Unwrap `forwardRef(fn)` / `memo(fn)` wrappers down to the function node. */
function unwrapFunction(node) {
  if (Node.isCallExpression(node)) {
    const arg = node.getArguments()[0]
    if (arg && (Node.isArrowFunction(arg) || Node.isFunctionExpression(arg))) return arg
  }
  return node
}

function membersOfTypeNode(typeNode, context) {
  if (Node.isTypeLiteral(typeNode)) return typeNode.getProperties()
  if (Node.isIntersectionTypeNode(typeNode)) {
    // Collect the members of every resolvable part; a union part (e.g. a
    // both-or-neither prop pair) contributes nothing here but doesn't make
    // the whole type opaque.
    const members = []
    let anyResolved = false
    for (const part of typeNode.getTypeNodes()) {
      const partMembers = membersOfTypeNode(part, context)
      if (partMembers) {
        members.push(...partMembers)
        anyResolved = true
      }
    }
    return anyResolved ? members : null
  }
  if (Node.isTypeReference(typeNode)) {
    const symbol = typeNode.getTypeName().getSymbol()
    const decl = symbol
      ?.getDeclarations()
      .find((d) => Node.isInterfaceDeclaration(d) || Node.isTypeAliasDeclaration(d))
    if (Node.isInterfaceDeclaration(decl)) return decl.getProperties()
    if (Node.isTypeAliasDeclaration(decl)) {
      return membersOfTypeNode(decl.getTypeNode(), context)
    }
    return null
  }
  return null
}

/**
 * Extract PropEntry[] from a component function: the type side comes from the
 * first parameter's type node, the value side (defaults) from its object
 * binding pattern. Returns null when the parameter type is opaque.
 */
export function extractProps(fn, unions, context) {
  fn = unwrapFunction(fn)
  const params = fn.getParameters?.() ?? []
  if (params.length === 0) return []
  const param = params[0]

  const defaults = new Map()
  const nameNode = param.getNameNode()
  if (Node.isObjectBindingPattern(nameNode)) {
    for (const element of nameNode.getElements()) {
      const propName = element.getPropertyNameNode() ?? element.getNameNode()
      const key = Node.isStringLiteral(propName) ? propName.getLiteralValue() : propName.getText()
      const initializer = element.getInitializer()
      if (initializer) defaults.set(key, initializer.getText())
    }
  }

  const typeNode = param.getTypeNode()
  if (!typeNode) return []
  const members = membersOfTypeNode(typeNode, context)
  if (members === null) return null

  return members.map((member) => {
    const memberName = member.getNameNode()
    const name = Node.isStringLiteral(memberName)
      ? memberName.getLiteralValue()
      : memberName.getText()
    const rawType = member.getTypeNode()?.getText().replace(/\s+/g, ' ') ?? 'unknown'
    const {description, deprecated} = jsDocOf(member)
    const entry = {
      name,
      type: rawType,
      required: !member.hasQuestionToken(),
    }
    const def = defaults.get(name)
    if (def !== undefined) entry.default = def
    if (description) entry.description = description
    if (deprecated) entry.deprecated = deprecated === true ? 'deprecated' : deprecated
    if (unions[rawType]) entry.union = unions[rawType]
    return entry
  })
}

export {jsDocOf, unwrapFunction}
