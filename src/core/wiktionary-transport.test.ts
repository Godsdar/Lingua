import test from 'node:test'
import assert from 'node:assert/strict'
import { queryWiktionaryPages } from './wiktionary.ts'

const body = { query: { pages: [{ title: 'book', revisions: [{ revid: 12, timestamp: '2026-10-16T00:00:00Z', slots: { main: { content: '==English==' } } }] }] } }

test('revision lookup batches titles once and retains permanent source evidence', async t => {
  const previous = globalThis.fetch; t.after(() => { globalThis.fetch = previous })
  let calls = 0
  globalThis.fetch = async (input, options) => {
    calls++
    const url = new URL(String(input))
    assert.equal(url.searchParams.get('titles'), 'book|cat')
    assert.equal(url.searchParams.get('rvprop'), 'ids|timestamp|content')
    assert.match(String((options?.headers as Record<string, string>)['User-Agent']), /github.com\/Godsdar\/Lingua/)
    return Response.json(body)
  }
  const result = await queryWiktionaryPages(['book', 'book', 'cat'])
  assert.equal(calls, 1)
  assert.equal(result[0].source, 'https://en.wiktionary.org/w/index.php?oldid=12')
  assert.equal(result[0].wikitext, '==English==')
})

test('cancelled queued requests and 429 retry delays stop without a fallback network request', async t => {
  const previous = globalThis.fetch; t.after(() => { globalThis.fetch = previous })
  let calls = 0
  const controller = new AbortController()
  let entered!: () => void
  const upstream = new Promise<void>(resolve => { entered = resolve })
  globalThis.fetch = async () => { calls++; entered(); return new Response('', { status: 429, headers: { 'Retry-After': '5' } }) }
  const pending = queryWiktionaryPages(['book'], controller.signal)
  await upstream
  controller.abort()
  await assert.rejects(pending)
  await assert.rejects(queryWiktionaryPages(['cat'], AbortSignal.abort()))
  assert.equal(calls, 1)
})

test('parent cancellation reaches active fetch and oversized streaming responses are cancelled', async t => {
  const previous = globalThis.fetch; t.after(() => { globalThis.fetch = previous })
  let entered!: () => void
  const upstream = new Promise<void>(resolve => { entered = resolve })
  const controller = new AbortController()
  globalThis.fetch = async (_input, options) => new Promise((_resolve, reject) => {
    options!.signal!.addEventListener('abort', () => reject(options!.signal!.reason), { once: true }); entered()
  })
  const pending = queryWiktionaryPages(['book'], controller.signal)
  await upstream; controller.abort()
  await assert.rejects(pending)
  let cancelled = false
  globalThis.fetch = async () => new Response(new ReadableStream({
    start(stream) { stream.enqueue(new Uint8Array(4 * 1024 * 1024 + 1)) },
    cancel() { cancelled = true }
  }))
  await assert.rejects(queryWiktionaryPages(['book']), /exceeds limit/)
  assert.equal(cancelled, true)
})

test('a cancelled queued lookup rejects immediately while an unrelated active request completes', async t => {
  const previous = globalThis.fetch; t.after(() => { globalThis.fetch = previous })
  let calls = 0; let release!: (response: Response) => void; let entered!: () => void
  const active = new Promise<void>(resolve => { entered = resolve })
  globalThis.fetch = async () => { calls++; entered(); return new Promise(resolve => { release = resolve }) }
  const first = queryWiktionaryPages(['book'])
  await active
  const cancellation = new AbortController()
  const second = queryWiktionaryPages(['cat'], cancellation.signal)
  cancellation.abort()
  await assert.rejects(second)
  assert.equal(calls, 1)
  release(Response.json(body))
  await first
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(calls, 1)
})
