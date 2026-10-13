import { test } from 'node:test'
import assert from 'node:assert/strict'
import { exportDocuments } from './reports.ts'

test('export of saved notes excludes unsaved text and removed-note documents', () => {
  assert.deepEqual(exportDocuments([{ documentId: 'a' }], { a: 'saved source', b: 'removed note source' }, { id: 'c', text: 'private unsaved edit' }), { a: 'saved source' })
})

test('current selection can export its document, but missing sources cannot be substituted', () => {
  assert.deepEqual(exportDocuments([{ documentId: 'a' }], {}, { id: 'a', text: 'current source' }), { a: 'current source' })
  assert.throws(() => exportDocuments([{ documentId: 'a' }], {}, { id: 'b', text: 'unrelated text' }))
})
