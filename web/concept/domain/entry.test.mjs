import test from 'node:test'
import assert from 'node:assert/strict'
import { notebookHome, passageFromLink, savedRootsBackup } from './entry.ts'

test('old notebook URLs preserve text and hash on root and repository-prefixed hosts', () => {
  for (const path of ['/concept', '/concept/', '/concept/index.html', '/Lingua/concept', '/Lingua/concept/', '/Lingua/concept/index.html']) {
    const prefix = path.startsWith('/Lingua/') ? '/Lingua/' : '/'
    assert.equal(notebookHome(`https://example.org${path}?q=mother%20tongue&from=en#note`), `https://example.org${prefix}?q=mother%20tongue&from=en#note`)
  }
})

test('query links preserve literal input within editor bounds without interpreting markup', () => {
  assert.equal(passageFromLink('?q=%3Cscript%3E%26water'), '<script>&water')
  assert.equal(passageFromLink('?q=mother+tongue'), 'mother tongue')
  assert.equal(passageFromLink('?q=+'), null)
  assert.equal(passageFromLink('?q=' + 'a'.repeat(6001)), null)
  assert.equal(passageFromLink('?from=en'), null)
})

test('legacy backup preserves payload exactly without writes, including malformed data', () => {
  for (const raw of ['[{"word":"water","futureField":42}]', '{damaged', '[]']) {
    assert.equal(savedRootsBackup({ getItem(key) { assert.equal(key, 'lingua.roots.v1'); return raw } }), raw)
  }
  assert.equal(savedRootsBackup({ getItem() { return null } }), null)
  assert.equal(savedRootsBackup({ getItem() { throw new Error('blocked storage') } }), null)
})
