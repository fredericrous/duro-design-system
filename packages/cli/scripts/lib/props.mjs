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

function memberName(member) {
  const nameNode = member.getNameNode()
  return Node.isStringLiteral(nameNode) ? nameNode.getLiteralValue() : nameNode.getText()
}

function memberType(member) {
  return member.getTypeNode()?.getText().replace(/\s+/g, ' ') ?? 'unknown'
}

/** A prop as read from one member: the node (for JSDoc), name, type text, optional. */
function describe(member) {
  return {
    member,
    name: memberName(member),
    type: memberType(member),
    optional: member.hasQuestionToken(),
  }
}

/**
 * A discriminated union of prop sets (`{href: string; current?: never} |
 * {current: true; href?: never}`) read as one list: a member typed `never`
 * (or `undefined`) in a branch is that branch saying the prop is absent, so it
 * contributes nothing; a prop is required only when every branch requires it; differing
 * types are joined with `|`.
 */
function mergeUnionBranches(branches) {
  const byName = new Map()
  for (const branch of branches) {
    for (const prop of branch) {
      if (prop.type === 'never' || prop.type === 'undefined') continue
      const seen = byName.get(prop.name)
      if (!seen) {
        byName.set(prop.name, {...prop, types: [prop.type], branches: 1})
        continue
      }
      if (!seen.types.includes(prop.type)) seen.types.push(prop.type)
      seen.optional = seen.optional || prop.optional
      seen.branches += 1
    }
  }
  return [...byName.values()].map(({types, branches: count, ...prop}) => ({
    ...prop,
    type: types.join(' | '),
    optional: prop.optional || count < branches.length,
  }))
}

function membersOfTypeNode(typeNode, context) {
  if (Node.isTypeLiteral(typeNode)) return typeNode.getProperties().map(describe)
  if (Node.isParenthesizedTypeNode(typeNode)) {
    return membersOfTypeNode(typeNode.getTypeNode(), context)
  }
  if (Node.isUnionTypeNode(typeNode)) {
    const branches = typeNode.getTypeNodes().map((part) => membersOfTypeNode(part, context))
    if (branches.some((branch) => branch === null)) return null
    return mergeUnionBranches(branches)
  }
  if (Node.isIntersectionTypeNode(typeNode)) {
    // Collect the members of every resolvable part; a union part (e.g. a
    // both-or-neither prop pair) contributes its merged members, each
    // optional unless every branch requires it.
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
    if (Node.isInterfaceDeclaration(decl)) return decl.getProperties().map(describe)
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

  return members.map(({member, name, type: rawType, optional}) => {
    const {description, deprecated} = jsDocOf(member)
    const entry = {
      name,
      type: rawType,
      required: !optional,
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
