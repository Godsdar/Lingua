import test from 'node:test'
import assert from 'node:assert/strict'
import { lexicalMatches, parseLexicon, selectedLexicalWord } from './lexicon.ts'
import { familyLayout } from './graphs.ts'

const request = { documentId: 'document', language: 'en', word: 'book', selection: { start: 12, end: 17 } }
const source = 'https://en.wiktionary.org/w/index.php?oldid=12345#English'
const evidence = { engine: 'English Wiktionary', version: '12345', live: true, source, license: 'CC BY-SA 4.0' }
const response = () => ({ schemaVersion: 1, documentId: 'document', word: 'book', selection: { start: 12, end: 17 }, layers: {
  definitions: { status: 'sourced', provenance: evidence, data: { note: 'Dictionary senses are alternatives, not a determination of contextual meaning.', senses: [{ id: 'sense-1', pos: 'Noun', definition: 'A collection of written pages.', source, etymologyId: 'etymology-1' }] } },
  etymology: { status: 'sourced', provenance: evidence, data: { note: 'Only explicit source relations are shown.', families: [{ id: 'etymology-1', label: 'Etymology 1', direction: 'sources', note: 'From Old English bōc.', attribution: 'English Wiktionary contributors — CC BY-SA 4.0', verifiedOn: '2026-10-16', nodes: [
    { id: 'en', parent: null, label: 'book', lang: 'English', source, skipped: [] },
    { id: 'ang', parent: 'en', label: 'bōc', lang: 'Old English', source, edgeSource: source, relation: 'inherited', skipped: [] }
  ] }] } }
} })

test('lookup preserves selected occurrence and safely parses distinct sourced layers', () => {
  const result = parseLexicon(response(), request)
  assert.equal(result.senses[0].etymologyId, result.families[0].id)
  assert.equal(result.provenance.version, '12345')
  assert.equal(lexicalMatches(result, request), true)
  assert.equal(lexicalMatches(result, { ...request, selection: { start: 1, end: 6 } }), false)
  assert.equal(lexicalMatches(result, { ...request, word: 'computer' }), false)
  assert.equal(selectedLexicalWord('two books', 4, 9, { lemma: 'book' }), 'book')
  assert.equal(selectedLexicalWord('two books', 0, 9), null)
  assert.equal(selectedLexicalWord("I can't go", 2, 7), "can't")
})

test('sourced trees never invent a shared root for alternative etymologies or accept unsafe links', () => {
  for (const mutate of [
    x => { x.word = 'other' },
    x => { x.selection.start = 0 },
    x => { x.layers.definitions.data.senses[0].source = 'javascript:alert(1)' },
    x => { x.layers.etymology.data.families[0].nodes[1].edgeSource = 'https://example.com/source' },
    x => { x.layers.etymology.data.families[0].nodes[1].parent = 'unknown' },
    x => { x.layers.etymology.data.families[0].nodes[0].parent = 'ang' },
    x => { x.layers.etymology.data.families[0].nodes[1].parent = null },
    x => { x.layers.etymology.data.families[0].nodes[1].relation = 'similar spelling' }
  ]) { const bad = response(); mutate(bad); assert.throws(() => parseLexicon(bad, request), /invalid result/) }
  const separate = response()
  separate.layers.etymology.data.families.push({ ...structuredClone(separate.layers.etymology.data.families[0]), id: 'etymology-2' })
  assert.equal(parseLexicon(separate, request).families.length, 2)
})

test('source orientation supports one-leaf lineages and keeps components labeled', () => {
  const family = parseLexicon(response(), request).families[0]
  const graph = familyLayout(family.nodes, ['ang'], 'sources')
  assert.equal(graph.nodes.length, 2)
  assert.ok(graph.nodes.every(n => Number.isFinite(n.x) && Number.isFinite(n.y)))
  assert.ok(graph.nodes.find(n => n.id === 'en').y < graph.nodes.find(n => n.id === 'ang').y)
  const single = familyLayout([family.nodes[0]], ['en'], 'sources')
  assert.ok(Number.isFinite(single.nodes[0].x))
  const compound = response(); compound.layers.etymology.data.families[0].nodes[1].relation = 'component'
  assert.equal(parseLexicon(compound, request).families[0].nodes[1].relation, 'component')
})

test('missing dictionary evidence remains unavailable without substituting another entry', () => {
  const empty = response()
  empty.layers.definitions = { status: 'unavailable', reason: 'No definitions found.' }
  empty.layers.etymology = { status: 'unavailable', reason: 'No explicit relations found.' }
  const result = parseLexicon(empty, request)
  assert.deepEqual(result.senses, [])
  assert.deepEqual(result.families, [])
  assert.equal(result.provenance, null)
})
