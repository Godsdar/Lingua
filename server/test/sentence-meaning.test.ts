import { test } from 'node:test'
import assert from 'node:assert/strict'
import { explainSentence } from '../src/sentence-meaning.ts'
import type { ParsedToken } from '../src/live-analysis.ts'

const tokens = (rows: [string, string, number, string][]): ParsedToken[] => rows.map(([text, relation, head, pos], index) => ({
  id: index + 1, text, lemma: text.toLowerCase(), relation, head, pos, start: index * 10, end: index * 10 + text.length, features: {}, explanation: ''
}))

test('question, modal and negation are retained without asserting an answer', () => {
  const reading = explainSentence(tokens([
    ['Could', 'aux', 4, 'AUX'], ['she', 'nsubj', 4, 'PRON'], ['not', 'neg', 4, 'PART'],
    ['read', 'root', 0, 'VERB'], ['books', 'dobj', 4, 'NOUN'], ['?', 'punct', 4, 'PUNCT']
  ]))
  assert.match(reading.explanation, /question; it does not assert the answer/)
  assert.match(reading.explanation, /Could not read/)
  assert.match(reading.explanation, /negation/)
  assert.match(reading.explanation, /modality/)
  assert.match(reading.caveat, /does not resolve word senses/)
})
test('passive subject is not described as the actor; omitted actor remains unknown', () => {
  const reading = explainSentence(tokens([
    ['The', 'det', 2, 'DET'], ['book', 'nsubjpass', 4, 'NOUN'], ['was', 'auxpass', 4, 'AUX'], ['written', 'root', 0, 'VERB']
  ]))
  assert.match(reading.explanation, /“The book”.*affected by the action/)
  assert.match(reading.explanation, /actor is not explicitly identified/)
})
test('embedded negation does not negate the main clause and relative clause stays out of subject phrase', () => {
  const reading = explainSentence(tokens([
    ['The', 'det', 2, 'DET'], ['reader', 'nsubj', 6, 'NOUN'], ['who', 'nsubj', 5, 'PRON'],
    ['never', 'neg', 5, 'ADV'], ['sleeps', 'relcl', 2, 'VERB'], ['smiles', 'root', 0, 'VERB']
  ]))
  assert.match(reading.explanation, /“The reader” is the grammatical subject of “smiles”/)
  assert.doesNotMatch(reading.explanation, /main clause includes negation/)
  assert.match(reading.explanation, /main predicate only/)
})
test('copular complement is described without assigning an object or invented intent', () => {
  const reading = explainSentence(tokens([['She', 'nsubj', 2, 'PRON'], ['is', 'root', 0, 'AUX'], ['ready', 'acomp', 2, 'ADJ']]))
  assert.match(reading.explanation, /links its subject to “ready”/)
  assert.doesNotMatch(reading.explanation, /direct object/)
})
