import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Writable } from 'node:stream'
import { buildApp } from '../src/app.ts'
import { readConfig } from '../src/config.ts'

const body = { documentId: 'test-document', language: 'en', text: 'My mother gives me water.', contextStart: 100, selection: { start: 19, end: 24 } }
const config = () => readConfig({})

test('prepared analysis preserves absolute occurrences, evidence, and honest unavailable layers', async t => {
  const { app } = await buildApp(config()); t.after(() => app.close())
  const result = await app.inject({ method: 'POST', url: '/v1/analysis', payload: body })
  assert.equal(result.statusCode, 200)
  const data = result.json()
  assert.equal(data.selection.absoluteStart, 119)
  assert.equal(data.selection.text, 'water')
  assert.equal(data.layers.grammar.status, 'prepared')
  assert.equal(data.layers.grammar.provenance.live, false)
  assert.equal(data.layers.grammar.data.tokens[4].start, 119)
  assert.match(data.layers.etymology.data.attribution, /CC BY-SA/)
  const unknown = await app.inject({ method: 'POST', url: '/v1/analysis', payload: { ...body, text: 'Something new.', selection: { start: 0, end: 9 } } })
  assert.equal(unknown.statusCode, 200)
  assert.ok(Object.values(unknown.json().layers).every((l: any) => l.status === 'unavailable'))
})

test('HTTP boundary rejects extras, bad offsets, surrogate cuts, excessive text and media types', async t => {
  const { app } = await buildApp(config()); t.after(() => app.close())
  for (const payload of [
    { ...body, unexpected: true }, { ...body, contextStart: '100' },
    { ...body, selection: { start: 24, end: 19 } },
    { ...body, text: '🌱 word', selection: { start: 1, end: 2 } },
    { ...body, text: 'a '.repeat(51), selection: { start: 0, end: 1 } },
    { ...body, text: 'x'.repeat(501) }
  ]) assert.equal((await app.inject({ method: 'POST', url: '/v1/analysis', payload })).statusCode, 400)
  assert.equal((await app.inject({ method: 'POST', url: '/v1/analysis', payload: { ...body, text: 'x'.repeat(17000) } })).statusCode, 413)
  assert.equal((await app.inject({ method: 'POST', url: '/v1/analysis', headers: { 'content-type': 'text/xml' }, payload: '<text/>' })).statusCode, 415)
})

test('production auth, generated request IDs, OpenAPI and no-store', async t => {
  assert.throws(() => readConfig({ NODE_ENV: 'production' }))
  assert.throws(() => readConfig({ LINGUA_HOST: '0.0.0.0' }))
  const key = 'only-a-test-credential-32-characters-long'
  const { app } = await buildApp(readConfig({ NODE_ENV: 'production', LINGUA_API_KEY: key })); t.after(() => app.close())
  assert.equal((await app.inject('/health/ready')).statusCode, 200)
  assert.equal((await app.inject('/v1/capabilities')).statusCode, 401)
  const response = await app.inject({ url: '/v1/openapi.json', headers: { authorization: `Bearer ${key}`, 'x-request-id': 'untrusted-id' } })
  assert.equal(response.statusCode, 200)
  assert.notEqual(response.headers['x-request-id'], 'untrusted-id')
  assert.equal(response.headers['cache-control'], 'no-store')
  assert.ok(response.json().paths['/v1/analysis'].post.requestBody)
  assert.deepEqual(response.json().paths['/v1/translation'].post.security, [{ bearerAuth: [] }])
})

test('rate limit cannot be bypassed with forwarded IPs; health stays available', async t => {
  const { app } = await buildApp({ ...config(), rateMax: 2 }); t.after(() => app.close())
  for (let i = 0; i < 2; i++) assert.equal((await app.inject({ url: '/v1/capabilities', headers: { 'x-forwarded-for': `198.51.100.${i}` } })).statusCode, 200)
  const limited = await app.inject({ url: '/v1/capabilities', headers: { 'x-forwarded-for': '203.0.113.1' } })
  assert.equal(limited.statusCode, 429)
  assert.equal(limited.json().error.code, 'RATE_LIMITED')
  assert.ok(limited.headers['retry-after'])
  assert.equal((await app.inject('/health/live')).statusCode, 200)
})

test('translation is opt-in and never exposes upstream errors', async t => {
  let calls = 0
  const disabled = await buildApp(config(), { translate: async () => { calls++; throw new Error('secret-provider-error') } }); t.after(() => disabled.app.close())
  const input = { method: 'POST' as const, url: '/v1/translation', payload: { text: 'Hello', from: 'en', to: 'ru' } }
  assert.equal((await disabled.app.inject(input)).statusCode, 503)
  assert.equal(calls, 0)
  const enabled = await buildApp({ ...config(), translationEnabled: true }, { translate: async () => { throw new Error('private text and key') } }); t.after(() => enabled.app.close())
  const failed = await enabled.app.inject(input)
  assert.equal(failed.statusCode, 503)
  assert.ok(!failed.body.includes('private'))
})

test('drain removes readiness and aborts active provider work', async t => {
  let entered!: () => void
  const started = new Promise<void>(r => { entered = r })
  let aborted = false
  const { app, drain } = await buildApp({ ...config(), translationEnabled: true }, { translate: async (_text, _from, _to, signal) => new Promise((_resolve, reject) => {
    signal!.addEventListener('abort', () => { aborted = true; reject(new Error('aborted')) }, { once: true }); entered()
  }) }); t.after(() => app.close())
  const pending = app.inject({ method: 'POST', url: '/v1/translation', payload: { text: 'Hello', from: 'en', to: 'ru' } }).then(r => r)
  await started; drain()
  assert.equal((await pending).statusCode, 408)
  assert.equal(aborted, true)
  assert.equal((await app.inject('/health/ready')).statusCode, 503)
  assert.equal((await app.inject('/health/live')).statusCode, 200)
  assert.equal((await app.inject('/v1/capabilities')).statusCode, 503)
})

test('operational logs exclude body, credentials, and query values', async t => {
  let logs = ''
  const stream = new Writable({ write(chunk, _encoding, done) { logs += String(chunk); done() } })
  const { app } = await buildApp(config(), { logger: { stream } }); t.after(() => app.close())
  await app.inject({ method: 'POST', url: '/v1/analysis?private=query-secret', headers: { authorization: 'Bearer credential-secret' }, payload: { ...body, text: 'private-body-secret', selection: { start: 0, end: 7 } } })
  assert.match(logs, /request completed/)
  for (const secret of ['query-secret', 'credential-secret', 'private-body-secret']) assert.ok(!logs.includes(secret))
})
