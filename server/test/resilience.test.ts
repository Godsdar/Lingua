import { test } from 'node:test'
import assert from 'node:assert/strict'
import { setImmediate } from 'node:timers/promises'
import { ProviderGuard } from '../src/resilience.ts'
import { ServiceError } from '../src/errors.ts'
import { translate } from '../../src/core/providers.ts'

const parent = () => new AbortController().signal
const code = (wanted: string) => (error: unknown) => error instanceof ServiceError && error.code === wanted

test('deadline aborts adapter; ignored cancellation still reserves capacity until real completion', async () => {
  const guard = new ProviderGuard({ concurrency: 1, deadlineMs: 15 })
  let finish!: (s: string) => void
  let seen: AbortSignal | undefined
  const pending = guard.run(signal => { seen = signal; return new Promise<string>(resolve => { finish = resolve }) }, parent())
  await assert.rejects(pending, code('DEADLINE_EXCEEDED'))
  assert.equal(seen!.aborted, true)
  await assert.rejects(guard.run(async () => 'should not start', parent()), code('BUSY'))
  finish('late'); await setImmediate()
  assert.equal(await guard.run(async () => 'recovered', parent()), 'recovered')
})

test('circuit opens after failures, permits one recovery probe, then closes', async () => {
  let now = 1
  const guard = new ProviderGuard({ concurrency: 8, deadlineMs: 1000, threshold: 2, cooldownMs: 100, now: () => now })
  const fail = async () => { throw new Error('provider failed') }
  await assert.rejects(guard.run(fail, parent()), code('PROVIDER_UNAVAILABLE'))
  await assert.rejects(guard.run(fail, parent()), code('PROVIDER_UNAVAILABLE'))
  let called = false
  await assert.rejects(guard.run(async () => { called = true; return 'no' }, parent()), code('PROVIDER_UNAVAILABLE'))
  assert.equal(called, false)
  now = 102
  let finish!: (s: string) => void
  const probe = guard.run(() => new Promise<string>(resolve => { finish = resolve }), parent())
  await setImmediate()
  await assert.rejects(guard.run(async () => 'no parallel probe', parent()), code('PROVIDER_UNAVAILABLE'))
  finish('ok'); assert.equal(await probe, 'ok')
  assert.equal(await guard.run(async () => 'next', parent()), 'next')
})

test('client cancellation does not trip the provider circuit', async () => {
  const guard = new ProviderGuard({ concurrency: 1, deadlineMs: 1000, threshold: 1 })
  const controller = new AbortController()
  const operation = guard.run(signal => new Promise((_resolve, reject) => {
    if (signal.aborted) reject(new Error('aborted'))
    else signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
  }), controller.signal)
  controller.abort()
  await assert.rejects(operation, code('CANCELLED')); await setImmediate()
  assert.equal(await guard.run(async () => 'ok', parent()), 'ok')
})

test('provider cancellation prevents network access and further fallback', async t => {
  const original = globalThis.fetch
  let calls = 0
  globalThis.fetch = async (_url, init) => {
    calls++
    return new Promise((_resolve, reject) => {
      init!.signal!.addEventListener('abort', () => reject(new Error('cancelled')), { once: true })
    })
  }
  t.after(() => { globalThis.fetch = original })
  const stopped = new AbortController(); stopped.abort()
  await assert.rejects(translate('private input', 'en', 'ru', stopped.signal))
  assert.equal(calls, 0)
  const controller = new AbortController()
  const pending = translate('private input', 'en', 'ru', controller.signal)
  await setImmediate(); controller.abort(); await assert.rejects(pending)
  assert.equal(calls, 1)
})

test('an older in-flight success cannot close a circuit opened by newer failures', async () => {
  const guard = new ProviderGuard({ concurrency: 2, deadlineMs: 1000, threshold: 1 })
  let finish!: (s: string) => void
  const old = guard.run(() => new Promise<string>(resolve => { finish = resolve }), parent())
  await setImmediate()
  await assert.rejects(guard.run(async () => { throw new Error('outage') }, parent()), code('PROVIDER_UNAVAILABLE'))
  finish('late success'); assert.equal(await old, 'late success')
  await assert.rejects(guard.run(async () => 'must not run', parent()), code('PROVIDER_UNAVAILABLE'))
})
