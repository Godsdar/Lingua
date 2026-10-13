import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chainFromEtyTree } from './wiktionary.ts'

const html = (tree: unknown): string => `<h2 id="English">English</h2><div data-ety-tree-json="${JSON.stringify(tree).replaceAll('"', '&quot;')}"></div>`

test('linear ety-tree fallback preserves order and language labels', () => {
  const tree = { term: 'water', lang: 'en', children: [{ term: '*watar', lang: 'gmw-pro' }] }
  assert.deepEqual(chainFromEtyTree(html(tree), 'English').map(n => n.word), ['water', '*watar'])
})

test('sibling forms never become a false ancestral chain', () => {
  const tree = { term: '*root', lang: 'ine-pro', children: [{ term: 'one', lang: 'en' }, { term: 'two', lang: 'de' }] }
  assert.deepEqual(chainFromEtyTree(html(tree), 'English'), [])
  assert.deepEqual(chainFromEtyTree(html({ term: '*root', lang: 'ine-pro', terms: tree.children }), 'English'), [])
})

test('malformed tree fields and wrong language sections fail closed', () => {
  assert.deepEqual(chainFromEtyTree(html({ term: 5, lang: 'en' }), 'English'), [])
  assert.deepEqual(chainFromEtyTree(html({ term: 'word', lang: 'en', children: 'invalid' }), 'English'), [])
  assert.deepEqual(chainFromEtyTree(html({ term: 'word', lang: 'en' }), 'Russian'), [])
})
