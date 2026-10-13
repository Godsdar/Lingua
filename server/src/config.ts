export interface Config {
  host: string
  port: number
  apiKey?: string
  translationEnabled: boolean
  deadlineMs: number
  concurrency: number
  rateMax: number
}

export function readConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const integer = (key: string, fallback: number, max: number): number => {
    const raw = env[key]
    if (raw === undefined) return fallback
    const value = Number(raw)
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value < 1 || value > max) throw new Error(`Invalid ${key}`)
    return value
  }
  const host = env.LINGUA_HOST || '127.0.0.1'
  const apiKey = env.LINGUA_API_KEY
  if ((env.NODE_ENV === 'production' || !['127.0.0.1', '::1', 'localhost'].includes(host) || apiKey !== undefined) && (!apiKey || apiKey.length < 32)) {
    throw new Error('LINGUA_API_KEY must contain at least 32 characters')
  }
  if (env.LINGUA_ENABLE_TRANSLATION !== undefined && !['true', 'false'].includes(env.LINGUA_ENABLE_TRANSLATION)) {
    throw new Error('Invalid LINGUA_ENABLE_TRANSLATION')
  }
  return {
    host, port: integer('PORT', 8787, 65535), apiKey,
    translationEnabled: env.LINGUA_ENABLE_TRANSLATION === 'true',
    deadlineMs: integer('LINGUA_DEADLINE_MS', 8000, 15000),
    concurrency: integer('LINGUA_CONCURRENCY', 8, 64), rateMax: integer('LINGUA_RATE_MAX', 60, 1000)
  }
}
