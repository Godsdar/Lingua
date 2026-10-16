import type { ParsedToken } from './live-analysis.ts'

/** A bounded reading of explicit grammar, never an inferred intention or word sense. */
export function explainSentence(tokens: ParsedToken[]) {
  const root = tokens.find(token => token.head === 0)
  const caveat = 'This reading follows a statistical grammar model. It does not resolve word senses, references, irony or the speaker’s intention.'
  if (!root) return { scope: 'sentence' as const, kind: 'structure' as const, explanation: 'The sentence structure could not be identified.', caveat }
  const children = (id: number) => tokens.filter(token => token.head === id)
  // Include only nominal modifiers: relative/embedded clauses have their own roles.
  const nominal = new Set(['det', 'amod', 'compound', 'poss', 'case', 'nummod', 'quantmod', 'predet', 'flat', 'fixed'])
  const phrase = (head: ParsedToken) => {
    const ids = new Set<number>([head.id])
    const visit = (id: number) => {
      for (const token of children(id)) if (nominal.has(token.relation) && !ids.has(token.id)) { ids.add(token.id); visit(token.id) }
    }
    visit(head.id)
    return tokens.filter(token => ids.has(token.id)).map(token => token.text).join(' ')
  }
  const quote = (text: string) => `“${text}”`
  const direct = children(root.id)
  const subjects = direct.filter(t => ['nsubj', 'nsubjpass', 'csubj', 'csubjpass'].includes(t.relation))
  const passive = subjects.some(t => t.relation.endsWith('pass')) || direct.some(t => t.relation === 'auxpass')
  const subject = subjects.filter(t => t.relation.startsWith('nsubj')).map(t => quote(phrase(t))).join(' and ')
  const predicate = [root, ...direct.filter(t => ['aux', 'auxpass', 'neg', 'prt'].includes(t.relation))]
    .sort((a, b) => a.id - b.id).map(t => t.text).join(' ')
  const question = tokens.some(t => t.text === '?')
  const parts: string[] = []
  if (question) parts.push('The sentence is framed as a question; it does not assert the answer.')
  if (subject) parts.push(`${subject} is the grammatical subject of ${quote(predicate)}${passive ? '; the passive construction presents the subject as affected by the action' : ''}.`)
  else if (subjects.length) parts.push(`A clause serves as the subject of ${quote(predicate)}.`)
  else parts.push(`The main predicate is ${quote(predicate)}; no explicit subject was identified.`)
  const objects = direct.filter(t => ['dobj', 'obj'].includes(t.relation))
  if (objects.length) parts.push(`${objects.map(t => quote(phrase(t))).join(' and ')} ${objects.length === 1 ? 'is' : 'are'} the direct object of the predicate.`)
  const recipients = direct.filter(t => ['dative', 'iobj'].includes(t.relation) && t.pos !== 'ADP')
  if (recipients.length) parts.push(`${recipients.map(t => quote(phrase(t))).join(' and ')} ${recipients.length === 1 ? 'is' : 'are'} marked as an indirect object or recipient.`)
  const complements = direct.filter(t => ['attr', 'acomp'].includes(t.relation))
  if (complements.length) parts.push(`The predicate links its subject to ${complements.map(t => quote(phrase(t))).join(' and ')}.`)
  if (direct.some(t => t.relation === 'neg')) parts.push('The main clause includes negation; its exact scope can depend on context.')
  const modals = direct.filter(t => t.relation === 'aux' && ['can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would'].includes(t.lemma.toLowerCase()))
  if (modals.length) parts.push(`${modals.map(t => quote(t.text)).join(' and ')} adds modality: possibility, ability, obligation or expectation depends on context.`)
  if (passive) {
    const agent = direct.find(t => t.relation === 'agent')
    const actor = agent && children(agent.id).find(t => t.relation === 'pobj')
    parts.push(actor ? `${quote(phrase(actor))} appears in the agent phrase.` : 'The actor is not explicitly identified in an agent phrase.')
  }
  if (tokens.some(t => ['conj', 'advcl', 'ccomp', 'xcomp', 'relcl', 'acl', 'parataxis'].includes(t.relation))) parts.push('Additional clauses or coordinated parts are present; this short reading covers the main predicate only.')
  return { scope: 'sentence' as const, kind: 'structure' as const, explanation: parts.join(' '), caveat }
}
