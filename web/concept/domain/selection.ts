import type { Family, Token } from './graphs'

export interface Phrase { start: number; end: number; text: string; explanation: string }
export interface Sentence {
  id: string
  text: string
  tokens: Token[]
  phrases: Phrase[]
  explanation: string
  translation: string
}

export function resolveSelection(text: string, start: number, end: number, examples: Sentence[], families: Record<string, Family>) {
  let context: { example: Sentence; offset: number } | null = null
  if (Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end > start && end <= text.length) {
    for (const example of examples) {
      let offset = text.indexOf(example.text)
      while (offset !== -1) {
        if (start >= offset && end <= offset + example.text.length) {
          context = { example, offset }
          break
        }
        offset = text.indexOf(example.text, offset + 1)
      }
      if (context) break
    }
  }
  const token = context?.example.tokens.find(t => start === context!.offset + t.start && end === context!.offset + t.end) ?? null
  const phrase = context?.example.phrases.find(p => start === context!.offset + p.start && end === context!.offset + p.end) ?? null
  const origin = token ? families[token.lemma] ?? null : null
  return { context, token, phrase, origin }
}
