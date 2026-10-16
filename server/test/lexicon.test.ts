import test from 'node:test'
import assert from 'node:assert/strict'
import { createLexiconLookup, parseLexicalPage } from '../src/lexicon.ts'
import { buildApp } from '../src/app.ts'
import { readConfig } from '../src/config.ts'

const page = (wikitext: string, title = 'book') => ({ title, revision: 93517355, timestamp: '2026-10-16T00:00:00Z', source: 'https://en.wiktionary.org/w/index.php?oldid=93517355', wikitext })
// Short attributed excerpts from English Wiktionary revisions inspected during implementation.
const book = page(`==English==
===Etymology 1===
{{etymon|en|id=Q571|:inh|enm:bok<id:book>|tree=1}}
From {{inh|en|enm|bok}}, {{m|enm|book}}, from {{inh|en|ang|bōc}}, from {{inh|en|gem-pro|*bōks}}.
Cognate with {{cog|de|Buch}}.
====Noun====
# {{sid|en|Q571}} A collection of sheets of paper bound together to hinge at one edge, containing printed or written material, pictures, etc.
# A long work fit for [[publication]], typically [[prose]].
# {{unsupported|en|unknown sense}}.
====Verb====
# To [[reserve]] something.
==Dutch==
===Noun===
# This is not an English sense.`)
const input = { documentId: 'doc-1', language: 'en' as const, word: 'book', selection: { start: 100, end: 104 } }

test('definition scope and immediate ancestry preserve evidence without flattening a historical chain', () => {
  const result = parseLexicalPage(book)
  assert.equal(result.senses.length, 3)
  assert.equal(result.omittedSenses, 1)
  assert.equal(result.senses[1].definition, 'A long work fit for publication, typically prose.')
  assert.equal(result.families[0].nodes.length, 2)
  assert.equal(result.families[0].nodes[1].label, 'bok')
  assert.equal(result.families[0].nodes[1].relation, 'inherited')
  assert.equal(result.families[0].nodes[0].parent, null)
  assert.ok(result.senses.every(s => s.source.includes('oldid=93517355')))
  assert.ok(!JSON.stringify(result).includes('Dutch sense'))
})

test('homonyms stay in separate groups and compound components are not historical ancestors', () => {
  const result = parseLexicalPage(page(`==English==
===Etymology 1===
From {{bor|en|fr|banque}}.
====Noun====
# A financial institution.
===Etymology 2===
From {{inh|en|enm|banke}}.
====Noun====
# A slope beside a river.
===Etymology 3===
{{etymon|en|:af|compute<id:calculate>|-er<id:agent noun>|text=+}}
====Noun====
# A computing device.`, 'bank'))
  assert.equal(result.families.length, 3)
  assert.deepEqual(result.senses.map(s => s.etymologyId), ['etymology-1', 'etymology-2', 'etymology-3'])
  assert.equal(result.families[0].nodes[1].relation, 'borrowed')
  assert.equal(result.families[1].nodes[1].relation, 'inherited')
  assert.deepEqual(result.families[2].nodes.slice(1).map(n => [n.label, n.relation]), [['compute', 'component'], ['-er', 'component']])
})

test('cognates, unknown etymologies, uncertainty and unsupported source structures do not produce invented edges', () => {
  for (const block of ['Unknown origin. Cognate with {{cog|de|Buch}}.', 'Possibly from {{der|en|la|test}}.', '{{ety|en|:inh|enm:bok<q:uncertain>|tree=1}}']) {
    assert.equal(parseLexicalPage(page(`==English==\n===Etymology===\n${block}\n===Noun===\n# A word.`)).families.length, 0)
  }
  assert.equal(parseLexicalPage(page('==French==\n===Noun===\n# A French entry.')).senses.length, 0)
  const proto = parseLexicalPage(page('==English==\n===Etymology===\nFrom {{inh|en|gem-pro|*testaz}}.'))
  assert.equal(proto.families[0].nodes[1].reconstructed, true)
  assert.equal(proto.families[0].nodes[1].label, '*testaz')
})

test('lexical cache stores public pages only, echoes each document range and honors cancellation', async () => {
  let calls = 0
  const lookup = createLexiconLookup(async (titles, signal) => { calls++; assert.deepEqual(titles, ['book']); assert.ok(signal); return [book] })
  const first = await lookup(input, new AbortController().signal)
  const second = await lookup({ ...input, documentId: 'other', selection: { start: 0, end: 4 } }, new AbortController().signal)
  assert.equal(calls, 1)
  assert.equal(first.layers.definitions.status, 'sourced')
  assert.equal(second.documentId, 'other')
  assert.deepEqual(second.selection, { start: 0, end: 4 })
  await assert.rejects(lookup(input, AbortSignal.abort()))
  await assert.rejects(lookup({ ...input, word: 'https://private.invalid' }, new AbortController().signal))
})

test('API lexical failure leaves prepared or live grammar independently usable', async () => {
  let calls = 0
  const { app } = await buildApp(readConfig({}), { lookupPages: async () => { calls++; throw new Error('private upstream details') } })
  try {
    const rejected = await app.inject({ method: 'POST', url: '/v1/lexicon', payload: { ...input, extra: true } })
    assert.equal(rejected.statusCode, 400)
    assert.equal(calls, 0)
    const lexical = await app.inject({ method: 'POST', url: '/v1/lexicon', payload: input })
    assert.equal(lexical.statusCode, 503)
    assert.ok(!lexical.body.includes('private upstream'))
    const analysis = await app.inject({ method: 'POST', url: '/v1/analysis', payload: { documentId: 'doc', language: 'en', text: 'My mother gives me water.', contextStart: 0, selection: { start: 3, end: 9 } } })
    assert.equal(analysis.statusCode, 200)
    assert.equal(analysis.json().layers.grammar.status, 'prepared')
  } finally { await app.close() }
})

test('authoritative etymons suppress contradictory prose, negation, uncertainty and hidden source terms', () => {
  const parse = (block: string) => parseLexicalPage(page(`==English==\n===Etymology===\n${block}\n===Noun===\n# A word.`))
  const precedence = parse('{{etymon|en|:inh|enm:actual}}\nA secondary detail derives from {{der|en|la|distant}}.')
  assert.equal(precedence.families[0].nodes[1].label, 'actual')
  for (const block of [
    '{{etymon|en|:inh|enm:word<unc>}}',
    '{{etymon|en|:inh|enm:-<t:some term>}}',
    'Not from {{bor|en|fr|wrong}}.',
    '{{etymon|en|:unknown|enm:unparsed}}\nFrom {{der|en|la|distant}}.'
  ]) assert.equal(parse(block).families.length, 0)
})

test('nested dictionary senses are not lost when a category heading uses unsupported formatting', () => {
  const parsed = parseLexicalPage(page(`==English==\n===Noun===\n# {{n-g|Terms relating to animals.}}\n## A [[mammal]] of the family {{taxfmt|Felidae|family}}.\n### A [[domesticated]] feline commonly kept as a [[housepet|house pet]].`, 'cat'))
  assert.equal(parsed.senses.length, 2)
  assert.equal(parsed.senses[1].definition, 'A domesticated feline commonly kept as a house pet.')
})
