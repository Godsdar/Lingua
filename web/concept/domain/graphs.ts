import { cluster, stratify } from 'd3-hierarchy'

export interface FamilyNode {
  id: string
  parent: string | null
  label: string
  lang: string
  source: string
  edgeSource?: string
  reconstructed?: boolean
  condensed?: boolean
  skipped: string[]
  gloss?: string
}

export interface Family {
  nodes: FamilyNode[]
  note: string
  attribution: string
  verifiedOn: string
}

export interface Token {
  text: string
  start: number
  end: number
  lemma: string
  pos: string
  head: number
  relation: string
  features: Record<string, string>
  explanation: string
}

export const relationNames: Record<string, string> = {
  nsubj: 'subject', obj: 'direct object', iobj: 'recipient', aux: 'auxiliary',
  det: 'determiner', root: 'sentence root', 'nmod:poss': 'possessor',
  'acl:relcl': 'relative clause', advmod: 'modifier', cop: 'copula', punct: 'punctuation'
}

/** Validate before traversing: a missing parent or cycle must not hang the UI. */
export function familyHierarchy(nodes: FamilyNode[]) {
  if (!nodes.length || new Set(nodes.map(n => n.id)).size !== nodes.length) {
    throw new Error('A family needs unique node IDs')
  }
  return stratify<FamilyNode>().id(n => n.id).parentId(n => n.parent)(nodes)
}

export function ancestorIds(nodes: FamilyNode[], id: string): Set<string> {
  const root = familyHierarchy(nodes)
  const node = root.descendants().find(n => n.id === id)
  return new Set(node?.ancestors().map(n => n.data.id) ?? [])
}

/** Keep ancestors of visible endpoints only. Never invent a connecting edge. */
export function familyLayout(nodes: FamilyNode[], endpoints: string[]) {
  const complete = familyHierarchy(nodes)
  const chosen = new Set(endpoints)
  const visible = new Set<string>()
  for (const node of complete.descendants()) {
    if (chosen.has(node.data.id)) node.ancestors().forEach(n => visible.add(n.data.id))
  }
  if (!visible.size) throw new Error('Choose at least one known family member')
  const root = familyHierarchy(nodes.filter(n => visible.has(n.id)))
  const width = Math.max(340, root.leaves().length * 156 + 130)
  const height = Math.max(420, root.height * 80 + 120)
  const laidOut = cluster<FamilyNode>().separation(() => 1).size([width - 130, height - 130])(root)
  const points = laidOut.descendants().map(n => ({
    ...n.data, x: n.x + 65, y: height - 65 - n.y, depth: n.depth
  }))
  const byId = new Map(points.map(n => [n.id, n]))
  const links = points.filter(n => n.parent).map(n => ({
    id: n.id, from: byId.get(n.parent!)!, to: n, condensed: Boolean(n.condensed)
  }))
  return { width, height, nodes: points, links }
}

/** Dependency trees are a different relation system from historical families. */
export function syntaxLayout(tokens: Token[]) {
  if (!tokens.length || tokens.some((t, i) => !Number.isInteger(t.head) || t.head < 0 ||
    t.head > tokens.length || t.head === i + 1)) throw new Error('Invalid dependency head')
  const root = stratify<Token>().id((_t, i) => String(i + 1))
    .parentId(t => t.head ? String(t.head) : null)(tokens)
  const visible = tokens.map((token, index) => ({ token, id: index + 1 }))
    .filter(({ token }) => token.pos !== 'PUNCT')
  const width = Math.max(400, visible.length * 112 + 32)
  const indices = new Map(visible.map((t, i) => [t.id, i]))
  const arcs = visible.filter(({ token }) => token.head && indices.has(token.head)).map(({ token, id }) => {
    const from = indices.get(id)! * 112 + 72
    const to = indices.get(token.head)! * 112 + 72
    return { id, from, to, rise: 42 + Math.abs(from - to) * .32, relation: token.relation, head: token.head }
  })
  const baseline = Math.max(150, ...arcs.map(arc => Math.ceil(arc.rise * .75 + 28)))
  return { width, baseline, tokens: visible, arcs, rootId: Number(root.id) }
}
