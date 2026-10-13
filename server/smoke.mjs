import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { setTimeout as delay } from 'node:timers/promises'

// Reserve an available local port; release immediately before starting the child.
const reservation = createServer()
await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve))
const port = reservation.address().port
await new Promise(resolve => reservation.close(resolve))
const key = 'smoke-only-credential-not-a-real-secret-000'
const child = spawn(process.execPath, ['server-dist/index.mjs'], {
  env: { ...process.env, NODE_ENV: 'production', LINGUA_HOST: '127.0.0.1', PORT: String(port), LINGUA_API_KEY: key, LINGUA_ENABLE_TRANSLATION: 'false' },
  stdio: ['ignore', 'pipe', 'pipe']
})
let output = ''
child.stdout.on('data', data => { output += data })
child.stderr.on('data', data => { output += data })
const exited = new Promise((resolve, reject) => {
  child.once('exit', (code, signal) => resolve({ code, signal }))
  child.once('error', reject)
})
const request = (path, options = {}) => fetch(`http://127.0.0.1:${port}${path}`, { ...options, signal: AbortSignal.timeout(1000) })
try {
  let ready = false
  for (let attempt = 0; attempt < 50; attempt++) {
    if (child.exitCode !== null) throw new Error(`API exited during startup: ${output}`)
    try { ready = (await request('/health/ready')).ok } catch { /* Startup can take several ticks. */ }
    if (ready) break
    await delay(100)
  }
  assert.ok(ready, `API did not become ready: ${output}`)
  assert.equal((await request('/v1/capabilities')).status, 401)
  const headers = { authorization: `Bearer ${key}`, 'content-type': 'application/json' }
  const response = await request('/v1/analysis', {
    method: 'POST', headers,
    body: JSON.stringify({ documentId: 'smoke', language: 'en', text: 'My mother gives me water.', contextStart: 0, selection: { start: 19, end: 24 } })
  })
  assert.equal(response.status, 200)
  assert.equal((await response.json()).layers.grammar.status, 'prepared')
  assert.equal((await request('/v1/translation', { method: 'POST', headers, body: JSON.stringify({ text: 'Hello', from: 'en', to: 'ru' }) })).status, 503)
  child.kill('SIGTERM')
  const result = await Promise.race([exited, delay(12000, 'timeout', { ref: false })])
  assert.deepEqual(result, { code: 0, signal: null })
  console.log('API smoke passed: production startup, auth, prepared analysis, opt-in translation, graceful SIGTERM.')
} finally {
  if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
  await exited
}
