import { test } from 'node:test'
import assert from 'node:assert/strict'
import { conceptData } from '../fixtures.mjs'
import { familyLayout, ancestorIds, syntaxLayout } from './graphs.ts'
import { resolveSelection } from './selection.ts'

const { sentences: { examples }, families } = conceptData

test('branch disclosure preserves sourced edges, stable IDs, and the source path', () => {
  for (const family of Object.values(families)) {
    const english = family.nodes.find(n => n.lang === 'English')
    const german = family.nodes.find(n => n.lang === 'German')
    const first = familyLayout(family.nodes, [english.id])
    const expanded = familyLayout(family.nodes, [english.id, german.id])
    assert.deepEqual(new Set(first.nodes.map(n => n.id)), ancestorIds(family.nodes, english.id))
    assert.ok(first.nodes.every(n => expanded.nodes.some(m => m.id === n.id)))
    for (const { from, to } of expanded.links) {
      assert.equal(to.parent, from.id)
      assert.ok(from.y > to.y, 'ancestors stay below descendants')
      assert.ok(to.source.startsWith('https://en.wiktionary.org/'))
    }
    assert.equal(familyLayout(family.nodes, [english.id]).nodes.length, first.nodes.length)
  }
})

test('malformed family data fails instead of hanging or inventing a connection', () => {
  const node = { id: 'a', parent: null, label: 'a', lang: 'English', source: '', skipped: [] }
  assert.throws(() => familyLayout([node, node], ['a']))
  assert.throws(() => familyLayout([{ ...node, parent: 'missing' }], ['a']))
  assert.throws(() => familyLayout([{ ...node, parent: 'b' }, { ...node, id: 'b', parent: 'a' }], ['a']))
  assert.throws(() => familyLayout([node], ['unknown']))
})

test('dependency view preserves token occurrences and real heads, with a single root', () => {
  for (const example of examples) {
    const graph = syntaxLayout(example.tokens)
    assert.equal(example.tokens[graph.rootId - 1].head, 0)
    for (const { token, id } of graph.tokens) {
      assert.equal(example.text.slice(token.start, token.end), token.text)
      assert.equal(example.tokens[id - 1], token)
    }
    for (const arc of graph.arcs) assert.equal(example.tokens[arc.id - 1].head, arc.head)
  }
  const tokens = structuredClone(examples[0].tokens)
  tokens[0].head = 900
  assert.throws(() => syntaxLayout(tokens))
})

test('repeated sentences, UTF-16 context, and phrases resolve the selected occurrence', () => {
  const example = examples[0]
  const prefix = '🌱 First reading. ' + example.text + '\n'
  const text = prefix + example.text
  const token = example.tokens.find(t => t.lemma === 'water')
  const result = resolveSelection(text, prefix.length + token.start, prefix.length + token.end, examples, families)
  assert.equal(result.context.offset, prefix.length)
  assert.equal(result.token, token)
  assert.equal(result.origin, families.water)
  const phraseExample = examples[1], phrase = phraseExample.phrases[0]
  const expression = resolveSelection(phraseExample.text, phrase.start, phrase.end, examples, families)
  assert.equal(expression.phrase, phrase)
  assert.equal(expression.origin, null, 'expressions do not get a single word genealogy')
})

test('empty, unknown, and edited text never inherit an old prepared result', () => {
  for (const [text, start, end] of [['Hello world', 0, 5], ['', 0, 0], [examples[0].text, 0, 0], [examples[0].text, -1, 4]]) {
    const result = resolveSelection(text, start, end, examples, families)
    assert.equal(result.context, null)
    assert.equal(result.origin, null)
  }
})


test('family layout leaves room for word labels and preserves root-only source graphs', () => {
  for (const family of Object.values(families)) {
    const leaves = family.nodes.filter(n => !family.nodes.some(child => child.parent === n.id))
    const layout = familyLayout(family.nodes, leaves.map(n => n.id))
    for (const node of layout.nodes) {
      assert.ok(node.x >= 68 && node.x <= layout.width - 68, '136px word label fits inside canvas')
      for (const other of layout.nodes) {
        if (node.id === other.id) continue
        assert.ok(Math.abs(node.x - other.x) >= 136 || Math.abs(node.y - other.y) >= 80,
          'word and language labels must not overlap')
      }
    }
  }
  const root = { id: 'word', parent: null, label: 'computer', lang: 'English', source: '', skipped: [] }
  const source = { ...root, id: 'component', parent: 'word', label: 'compute', relation: 'component' }
  const folded = familyLayout([root, source], [root.id], 'sources')
  assert.deepEqual(folded.nodes.map(n => n.id), ['word'])
  assert.equal(folded.links.length, 0)
})
