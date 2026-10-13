import { readConfig } from './config.ts'
import { buildApp } from './app.ts'

try {
  const config = readConfig()
  const { app, drain } = await buildApp(config, { logger: true })
  let stopping = false
  const stop = async () => {
    if (stopping) return
    stopping = true
    drain()
    const deadline = setTimeout(() => process.exit(1), 10000)
    deadline.unref()
    try { await app.close(); clearTimeout(deadline) } catch { process.exitCode = 1 }
  }
  process.once('SIGINT', () => { void stop() })
  process.once('SIGTERM', () => { void stop() })
  await app.listen({ host: config.host, port: config.port })
} catch {
  console.error('Lingua API failed to start. Check configuration and port availability.')
  process.exitCode = 1
}
