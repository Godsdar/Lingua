import { test } from 'node:test'
import assert from 'node:assert/strict'
import { request } from 'node:http'
import { buildApp } from './src/app.ts'
import { readConfig } from './src/config.ts'

test('a real disconnected HTTP client cancels provider work', { timeout: 5000 }, async t => {
  let entered!: () => void
  let cancelled!: () => void
  const started = new Promise<void>(resolve => { entered = resolve })
  const aborted = new Promise<void>(resolve => { cancelled = resolve })
  const { app } = await buildApp({ ...readConfig({}), translationEnabled: true }, {
    translate: async (_text, _from, _to, signal) => new Promise((_resolve, reject) => {
      signal!.addEventListener('abort', () => { cancelled(); reject(new Error('cancelled')) }, { once: true })
      entered()
    })
  })
  t.after(() => app.close())
  const address = await app.listen({ host: '127.0.0.1', port: 0 })
  const client = request(`${address}/v1/translation`, { method: 'POST', headers: { 'content-type': 'application/json' } })
  client.on('error', () => { /* Expected socket hang-up when the client aborts. */ })
  t.after(() => client.destroy())
  client.end(JSON.stringify({ text: 'Hello', from: 'en', to: 'ru' }))
  await started
  client.destroy()
  await aborted
  assert.equal((await app.inject('/health/ready')).statusCode, 200)
})
