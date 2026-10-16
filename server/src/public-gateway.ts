import type { IncomingMessage, ServerResponse } from 'node:http'
import { isIP } from 'node:net'
import { randomUUID } from 'node:crypto'
import { buildApp } from './app.ts'
import { readConfig } from './config.ts'
import { ServiceError } from './errors.ts'

export function publicOriginAllowed(origin: string | undefined, env: NodeJS.ProcessEnv): boolean {
  if (!origin) return false
  const allowed = [env.LINGUA_PUBLIC_ORIGIN, env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined]
  if (!env.VERCEL) allowed.push('http://localhost:5173', 'http://127.0.0.1:5173')
  return allowed.includes(origin)
}
export function clientAddress(request: IncomingMessage, env: NodeJS.ProcessEnv): string {
  // Only Vercel's entrypoint trusts the platform-overwritten X-Forwarded-For.
  const forwarded = request.headers['x-forwarded-for']
  if (env.VERCEL === '1' && typeof forwarded === 'string' && isIP(forwarded.trim())) return forwarded.trim()
  return request.socket.remoteAddress ?? '127.0.0.1'
}
async function readBody(request: IncomingMessage & { body?: unknown }) {
  const tooLarge = () => new ServiceError(413, 'BODY_TOO_LARGE', 'Request is too large')
  if (Number(request.headers['content-length'] ?? 0) > 16384) throw tooLarge()
  if (request.body !== undefined) {
    const body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body)
    if (Buffer.byteLength(body) > 16384) throw tooLarge()
    return body
  }
  let size = 0; const chunks: Buffer[] = []
  for await (const chunk of request) { const buffer = Buffer.from(chunk); size += buffer.length; if (size > 16384) throw tooLarge(); chunks.push(buffer) }
  return Buffer.concat(chunks).toString('utf8')
}
let service: ReturnType<typeof buildApp> | undefined
function getService() {
  if (!service) {
    const engineUrl = process.env.LINGUA_ENGINE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/engine` : undefined)
    const config = readConfig({ ...process.env, LINGUA_ENGINE_URL: engineUrl, LINGUA_ENABLE_TRANSLATION: 'false', LINGUA_RATE_MAX: '12' })
    if (!config.apiKey || !engineUrl) throw new ServiceError(503, 'NOT_CONFIGURED', 'Live analysis is not configured')
    service = buildApp(config)
    void service.catch(() => { service = undefined })
  }
  return service
}

/** Public stateless routes have fixed internal targets, never a user-controlled proxy URL. */
export const publicAnalysis = (request: IncomingMessage, response: ServerResponse) => publicRequest('/v1/analysis', request, response)
export const publicLexicon = (request: IncomingMessage, response: ServerResponse) => publicRequest('/v1/lexicon', request, response)

export const publicEtymology = (request: IncomingMessage, response: ServerResponse) => publicRequest('/v1/etymology', request, response)

async function publicRequest(route: '/v1/analysis' | '/v1/lexicon' | '/v1/etymology', request: IncomingMessage, response: ServerResponse) {
  const cancelled = new AbortController()
  const abort = () => cancelled.abort()
  request.once('aborted', abort)
  response.once('close', () => { request.removeListener('aborted', abort); if (!response.writableFinished) abort() })
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  try {
    if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); throw new ServiceError(405, 'METHOD_NOT_ALLOWED', 'Use POST') }
    if (!publicOriginAllowed(request.headers.origin, process.env)) throw new ServiceError(403, 'ORIGIN_REJECTED', 'Use the Lingua reading workspace')
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers['content-type'] ?? '')) throw new ServiceError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Use application/json')
    const body = await readBody(request)
    const { app } = await getService()
    const result = await app.inject({ method: 'POST', url: route, payload: body,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.LINGUA_API_KEY}` },
      remoteAddress: clientAddress(request, process.env), signal: cancelled.signal })
    response.statusCode = result.statusCode
    for (const name of ['content-type', 'cache-control', 'x-request-id', 'retry-after', 'x-ratelimit-limit', 'x-ratelimit-remaining']) {
      const value = result.headers[name]; if (value !== undefined) response.setHeader(name, value)
    }
    if (!response.destroyed) response.end(result.body)
  } catch (error) {
    const known = error instanceof ServiceError
    if (!known) console.warn(JSON.stringify({ event: 'gateway_failure', kind: error instanceof Error ? error.name : 'unknown', code: error && typeof error === 'object' && 'code' in error ? String(error.code).slice(0,80) : undefined }))
    response.statusCode = known ? error.status : 503
    if (!response.destroyed) response.end(JSON.stringify({ requestId: randomUUID(), error: {
      code: known ? error.code : 'ENGINE_UNAVAILABLE', message: known ? error.message : 'Language analysis is temporarily unavailable'
    } }))
  }
}
