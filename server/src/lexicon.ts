import { queryWiktionaryPages, type WiktionaryPage } from '../../src/core/wiktionary.ts'
import { ServiceError } from './errors.ts'

export interface LexiconInput { documentId: string; language: 'en'; word: string; selection: { start: number; end: number } }
export type LookupPages = (titles: string[], signal?: AbortSignal) => Promise<WiktionaryPage[]>
const attribution = 'English Wiktionary contributors · CC BY-SA 4.0. Definitions and source relationships adapted from the cited revision.'
const names: Record<string, string> = { en: 'English', enm: 'Middle English', ang: 'Old English', la: 'Latin', fr: 'French', fro: 'Old French', frm: 'Middle French', grc: 'Ancient Greek', 'gem-pro': 'Proto-Germanic', 'gmw-pro': 'Proto-West Germanic', 'ine-pro': 'Proto-Indo-European', non: 'Old Norse', it: 'Italian' }
const relations: Record<string, string> = { inh: 'inherited', inherited: 'inherited', bor: 'borrowed', borrowed: 'borrowed', lbor: 'borrowed', der: 'derived', derived: 'derived' }
const posNames = new Set(['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Determiner', 'Preposition', 'Conjunction', 'Interjection', 'Proper noun', 'Numeral', 'Particle', 'Article'])

function templates(text: string): { raw: string; args: string[]; index: number }[] {
  const out = []; let depth = 0; let start = 0
  for (let i = 0; i < text.length - 1; i++) {
    const pair = text.slice(i, i + 2)
    if (pair === '{{') { if (!depth) start = i; depth++; i++ }
    else if (pair === '}}' && depth) { depth--; i++; if (!depth) {
      const raw = text.slice(start, i + 1); const inner = raw.slice(2, -2)
      const args: string[] = []; let part = ''; let nesting = 0
      for (let j = 0; j < inner.length; j++) {
        const two = inner.slice(j, j + 2)
        if (two === '{{' || two === '[[') { nesting++; part += two; j++ }
        else if (two === '}}' || two === ']]') { nesting--; part += two; j++ }
        else if (inner[j] === '|' && nesting === 0) { args.push(part.trim()); part = '' }
        else part += inner[j]
      }
      args.push(part.trim()); out.push({ raw, args, index: start })
    } }
  }
  return out
}

/** Deliberately small wikitext renderer: unsupported templates discard that sense. */
function plain(text: string): string | undefined {
  let value = text.replace(/<!--[\s\S]*?-->/g, '').replace(/<ref\b[^>]*>[\s\S]*?<\/ref>|<ref\b[^>]*\/>/gi, '')
  for (const template of templates(value)) {
    const [name, ...args] = template.args
    let rendered: string | undefined
    if (['lb', 'label', 'context'].includes(name)) rendered = `(${args.slice(1).filter(a => !a.includes('=')).join(', ')})`
    else if (['senseid', 'sid', 'senseno', 'sno', 'defdate'].includes(name)) rendered = ''
    else if (['l', 'm', 'm+', 'mention', 'link'].includes(name)) rendered = args[2] || args[1]
    else if (['w', 'wikipedia'].includes(name)) rendered = args[1] || args[0]
    else if (['gloss', 'glossary', 'non-gloss definition', 'ngd', 'small', 'nowrap', 'nobr', 'vern'].includes(name)) rendered = args[0]
    else if (name === 'taxfmt') rendered = args[0]
    else if (name === 'qualifier' || name === 'q') rendered = `(${args.join(', ')})`
    if (rendered === undefined || rendered.includes('{{')) return undefined
    value = value.replace(template.raw, rendered)
  }
  value = value.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1').replace(/'{2,}/g, '').replace(/<\/?(?:i|b|span|sup|sub)\b[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  if (/[{}<>]|\[https?:|&[a-z#]/i.test(value)) return undefined
  return value || undefined
}

interface LexicalNode { id: string; parent: string | null; label: string; lang: string; source: string; skipped: string[]; edgeSource?: string; reconstructed?: boolean; relation?: string }
interface SourceTerm { label: string; lang: string; relation: string }
function immediateSources(block: string): SourceTerm[] {
  const clean = block.replace(/<!--[\s\S]*?-->/g, '').replace(/<ref\b[^>]*>[\s\S]*?<\/ref>/gi, '')
  const all = templates(clean)
  const structured = all.filter(({ args }) => ['ety', 'etymon'].includes(args[0].toLowerCase()) && args[1] === 'en')
  // A declared etymon is authoritative. Unsupported or uncertain structures never fall through to prose.
  const candidates = structured.length ? structured.slice(0, 1) : all
  // Only explicit source templates; cognates, roots, comparisons and uncertain prose are not edges.
  for (const { args, index } of candidates) {
    const name = args[0].toLowerCase().replace(/\+$/, '')
    if (args.some(a => /(?:^|<)(?:unc|uncertain|q|qq|qual|qualifier)(?:[:=>]|$)/i.test(a))) return []
    if (/\b(?:not|never|unrelated|possibly|perhaps|probably|uncertain|unknown|disputed|thought to|compare|cognate)\b/i.test(clean.slice(Math.max(0, index - 120), index))) return []
    if ((name === 'ety' || name === 'etymon') && args[1] === 'en') {
      const operation = args.findIndex(a => a.startsWith(':'))
      if (operation < 0) continue
      const mode = args[operation].slice(1)
      const terms = args.slice(operation + 1).filter(a => a && !a.includes('='))
      if (mode === 'af' || mode === 'compound') return terms.slice(0, 5).map(a => ({ label: a.replace(/<[^>]*>/g, ''), lang: 'en', relation: 'component' })).filter(t => t.label && t.label !== '-' && !t.label.includes(':'))
      if (relations[mode] && terms.length === 1) {
        const match = /^([a-z][a-z-]*):([^<>]+)(?:<[^>]*>)*$/.exec(terms[0])
        if (match && match[2] !== '-') return [{ lang: match[1], label: match[2], relation: relations[mode] }]
      }
      continue
    }
    if (relations[name] && args[1] === 'en') {
      const label = plain(args[3] ?? '')
      if (label && label !== '-' && /^[a-z][a-z-]*$/.test(args[2] ?? '')) return [{ lang: args[2], label, relation: relations[name] }]
    }
    if (['affix', 'af', 'suffix', 'prefix', 'compound'].includes(name) && args[1] === 'en') {
      const components = args.slice(2).filter(a => a && !a.includes('='))
      return components.slice(0, 5).flatMap((a, i) => {
        const label = plain(a)
        return label && label !== '-' ? [{ lang: 'en', label: name === 'suffix' && i === 1 ? '-' + label.replace(/^-/, '') : name === 'prefix' && i === 0 ? label.replace(/-$/, '') + '-' : label, relation: 'component' }] : []
      })
    }
  }
  return []
}

export function parseLexicalPage(page: WiktionaryPage) {
  const language = /^==\s*English\s*==\s*$/m.exec(page.wikitext)
  if (!language) return { senses: [], families: [], omittedSenses: 0 }
  const tail = page.wikitext.slice(language.index + language[0].length)
  const english = tail.split(/^==[^=].*?==\s*$/m)[0]
  const headings = [...english.matchAll(/^(={3,6})\s*(.*?)\s*\1\s*$/gm)]
  let etymologyId = 'etymology-1'; let etymologyLabel = 'Etymology'; let pos = ''
  const senses: { id: string; pos: string; definition: string; source: string; etymologyId: string }[] = []
  const families = []; let omittedSenses = 0
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i]; const title = heading[2].trim()
    const block = english.slice(heading.index! + heading[0].length, headings[i + 1]?.index ?? english.length)
    if (/^Etymology(?: \d+)?$/.test(title)) {
      etymologyLabel = title; etymologyId = `etymology-${title.match(/\d+/)?.[0] ?? 1}`; pos = ''
      const terms = immediateSources(block)
      if (terms.length && families.length < 8) {
        const root = `${etymologyId}-word`
        families.push({ id: etymologyId, label: etymologyLabel, direction: 'sources',
          nodes: [{ id: root, parent: null as string | null, label: page.title, lang: 'English', source: page.source, skipped: [] as string[] },
            ...terms.map((term, n) => ({ id: `${etymologyId}-source-${n + 1}`, parent: root, label: term.label, lang: names[term.lang] ?? term.lang, source: page.source, edgeSource: page.source, reconstructed: term.label.startsWith('*'), skipped: [] as string[], relation: term.relation }))] as LexicalNode[],
          note: 'Sources explicitly linked in this Wiktionary etymology. This is a partial evidence graph; intermediate stages, cognates and uncertain proposals may be omitted. This group is not automatically matched to the sentence meaning.',
          attribution, verifiedOn: page.timestamp.slice(0, 10) })
      }
    } else if (posNames.has(title)) {
      pos = title
      for (const match of block.matchAll(/^#{1,4} (.+)$/gm)) {
        if (match[1].length > 5000) { omittedSenses++; continue }
        const definition = plain(match[1])
        if (!definition || definition.length > 1200) { omittedSenses++; continue }
        if (senses.length < 18) senses.push({ id: `sense-${senses.length + 1}`, pos, definition, source: page.source, etymologyId })
        else omittedSenses++
      }
    } else pos = ''
  }
  return { senses, families: families.slice(0, 8), omittedSenses }
}

export function createLexiconLookup(fetchPages: LookupPages = queryWiktionaryPages) {
  const cache = new Map<string, { expires: number; page: WiktionaryPage }>()
  let cacheCharacters = 0
  return async (input: LexiconInput, signal: AbortSignal) => {
    if (!/^[\p{L}]+(?:['’ -][\p{L}]+)*$/u.test(input.word) || input.word.length > 80 || input.selection.end <= input.selection.start || input.selection.end - input.selection.start > 500) throw new ServiceError(400, 'INVALID_SELECTION', 'Select one word for dictionary lookup')
    signal.throwIfAborted()
    const key = input.word.normalize('NFC')
    let page = cache.get(key)?.expires! > Date.now() ? cache.get(key)!.page : undefined
    if (!page) {
      const pages = await fetchPages([key], signal)
      page = pages[0]
      if (page && page.wikitext.length <= 500000) {
        cacheCharacters -= cache.get(key)?.page.wikitext.length ?? 0
        cache.set(key, { expires: Date.now() + 3600000, page })
        cacheCharacters += page.wikitext.length
        while (cache.size > 128 || cacheCharacters > 2000000) {
          const oldest = cache.keys().next().value!
          cacheCharacters -= cache.get(oldest)!.page.wikitext.length
          cache.delete(oldest)
        }
      }
    }
    signal.throwIfAborted()
    const unavailable = (reason: string) => ({ status: 'unavailable', reason })
    const parsed = page ? parseLexicalPage(page) : { senses: [], families: [], omittedSenses: 0 }
    const provenance = page ? { engine: 'English Wiktionary', version: String(page.revision), source: page.source, live: true, license: 'CC BY-SA 4.0' } : undefined
    return { schemaVersion: 1, documentId: input.documentId, word: input.word, selection: input.selection, coordinateSystem: 'UTF-16, end-exclusive', layers: {
      definitions: parsed.senses.length ? { status: 'sourced', provenance, data: { senses: parsed.senses, attribution, note: `Dictionary alternatives, not a disambiguated sentence meaning.${parsed.omittedSenses ? ' Additional or unsupported senses are omitted; consult the source.' : ''}` } } : unavailable('No supported English dictionary senses were found. The source may use unsupported formatting.'),
      etymology: parsed.families.length ? { status: 'sourced', provenance, data: { families: parsed.families, attribution, verifiedOn: page!.timestamp.slice(0, 10), note: 'Separate etymologies are alternatives. No automatic sense or ancestry choice is made.' } } : unavailable('No explicit, supported source relationship was found. Unknown ancestry is not inferred.')
    } }
  }
}
