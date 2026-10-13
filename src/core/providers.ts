import type { LangCode } from '@shared/types'

const USER_AGENT = 'Lingua/0.1 (educational Electron app)'

const env = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>

const DEEPL_KEY = env.DEEPL_API_KEY
const DEEPL_HOST = DEEPL_KEY?.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com'
const LIBRETRANSLATE_URL = env.LIBRETRANSLATE_URL?.replace(/\/$/, '')

async function withTimeout (ms: number, parent?: AbortSignal): Promise<{ signal: AbortSignal, done: () => void }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return { signal: parent ? AbortSignal.any([parent, controller.signal]) : controller.signal, done: () => clearTimeout(timer) }
}

async function deepl (text: string, from: LangCode, to: LangCode, parent?: AbortSignal): Promise<string> {
  if (!DEEPL_KEY) throw new Error('DeepL is not configured')
  const body = new URLSearchParams({ text, target_lang: to.toUpperCase() })
  if (from) body.set('source_lang', from.toUpperCase())

  const { signal, done } = await withTimeout(9000, parent)
  try {
    const res = await fetch(`${DEEPL_HOST}/v2/translate`, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body,
      signal
    })
    if (!res.ok) throw new Error(`DeepL HTTP ${res.status}`)
    const data = (await res.json()) as { translations?: { text?: string }[] }
    return data.translations?.[0]?.text ?? ''
  } finally {
    done()
  }
}

async function libretranslate (text: string, from: LangCode, to: LangCode, parent?: AbortSignal): Promise<string> {
  if (!LIBRETRANSLATE_URL) throw new Error('LibreTranslate is not configured')

  const { signal, done } = await withTimeout(9000, parent)
  try {
    const res = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: from, target: to, format: 'text' }),
      signal
    })
    if (!res.ok) throw new Error(`LibreTranslate HTTP ${res.status}`)
    const data = (await res.json()) as { translatedText?: string }
    return data.translatedText ?? ''
  } finally {
    done()
  }
}

interface MyMemoryResponse {
  responseStatus: number
  responseDetails?: string
  responseData: { translatedText: string }
}

async function mymemory (text: string, from: LangCode, to: LangCode, parent?: AbortSignal): Promise<string> {
  const url = 'https://api.mymemory.translated.net/get'
    + `?q=${encodeURIComponent(text)}&langpair=${from}|${to}`

  const { signal, done } = await withTimeout(9000, parent)
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal })
    if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`)
    const data = (await res.json()) as MyMemoryResponse
    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails || 'Translation failed')
    }
    return data.responseData.translatedText ?? ''
  } finally {
    done()
  }
}

export interface Provider {
  name: string
  enabled: boolean
  run: (text: string, from: LangCode, to: LangCode, signal?: AbortSignal) => Promise<string>
}

function providers (): Provider[] {
  return [
    { name: 'DeepL', enabled: Boolean(DEEPL_KEY), run: deepl },
    { name: 'LibreTranslate', enabled: Boolean(LIBRETRANSLATE_URL), run: libretranslate },
    { name: 'MyMemory', enabled: true, run: mymemory }
  ]
}

export interface TranslationResult {
  text: string
  provider: string
}

export async function translate (text: string, from: LangCode, to: LangCode, signal?: AbortSignal): Promise<TranslationResult> {
  let lastError: unknown
  for (const provider of providers()) {
    signal?.throwIfAborted()
    if (!provider.enabled) continue
    try {
      const result = await provider.run(text, from, to, signal)
      if (result) return { text: result, provider: provider.name }
    } catch (error) {
      signal?.throwIfAborted()
      lastError = error
    }
  }
  throw lastError instanceof Error ? lastError : new Error('All translation providers failed')
}
