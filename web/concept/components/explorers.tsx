import { useId, useMemo, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { motion, useReducedMotion } from 'motion/react'
import { ancestorIds, familyLayout, familyHierarchy, relationNames, syntaxLayout } from '../domain/graphs'
import type { Family, Token } from '../domain/graphs'

interface FamilyProps { family: Family; word: string }

function FamilyExplorer({ family, word }: FamilyProps) {
  const leaves = useMemo(() => familyHierarchy(family.nodes).leaves().map(n => n.data), [family])
  const sourced = family.direction === 'sources'
  const anchor = leaves.find(n => n.lang === 'English') ?? leaves[0]
  const initial = sourced ? family.nodes.find(n => n.parent === null)! : anchor
  const [selectedId, setSelected] = useState(initial.id)
  const [endpoints, setEndpoints] = useState(() => [anchor, ...leaves.filter(n => n.id !== anchor.id).slice(0, 2)].map(n => n.id))
  const [pathOnly, setPathOnly] = useState(false)
  const [zoom, setZoom] = useState(1)
  const reduced = useReducedMotion()
  const selected = family.nodes.find(n => n.id === selectedId) ?? initial
  const layout = useMemo(() => familyLayout(family.nodes, pathOnly ? [selected.id] : endpoints, family.direction), [family, endpoints, pathOnly, selected.id])
  const ancestry = useMemo(() => ancestorIds(family.nodes, selected.id), [family, selected.id])
  const transition = { duration: reduced ? 0 : .32, ease: 'easeInOut' as const }
  function toggle(id: string) {
    if (id === anchor.id) return
    const next = endpoints.includes(id) ? endpoints.filter(n => n !== id) : [...endpoints, id]
    setEndpoints(next)
    setPathOnly(false)
    // Collapsing the selected branch returns focus to the source word's lineage.
    if (!familyLayout(family.nodes, next).nodes.some(n => n.id === selectedId)) setSelected(initial.id)
  }
  return <div className="lp-family-explorer">
    <div className="lp-branch-picker" role="group" aria-label="Visible family branches">
      <span className="lp-label">{sourced ? 'Explore cited sources' : 'Reveal a branch'}</span>
      {leaves.map(node => <button key={node.id} aria-pressed={endpoints.includes(node.id)}
        disabled={node.id === anchor.id} onClick={() => toggle(node.id)}>
        <span aria-hidden="true">{endpoints.includes(node.id) ? '−' : '+'}</span> {sourced ? `${node.label} · ${node.lang}` : node.lang}
      </button>)}
    </div>
    <div className="lp-explorer-grid">
      <div className="lp-graph-panel">
        <div className="lp-graph-toolbar">
          <div role="group" aria-label="Family detail">
            <button aria-pressed={!pathOnly} onClick={() => setPathOnly(false)}>{sourced ? 'Sources' : 'Family'}</button>
            <button aria-pressed={pathOnly} disabled={sourced && selected.parent === null} onClick={() => setPathOnly(true)}>Selected path</button>
          </div>
          <div role="group" aria-label="Tree scale">
            <button aria-label="Zoom out" disabled={zoom <= .75} onClick={() => setZoom(z => Math.max(.75, z - .25))}>−</button>
            <button aria-label="Reset tree scale" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
            <button aria-label="Zoom in" disabled={zoom >= 1.5} onClick={() => setZoom(z => Math.min(1.5, z + .25))}>+</button>
          </div>
        </div>
        <div className="lp-graph-scroll" tabIndex={0} role="region" aria-label={`${word} ${sourced ? 'sources' : 'family'}. Scroll horizontally to explore branches.`}>
          <div style={{ width: layout.width * zoom, height: layout.height * zoom, margin: 'auto' }}>
            <div className="lp-graph-stage" style={{ width: layout.width, height: layout.height, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
              <svg width={layout.width} height={layout.height} aria-hidden="true">
                {layout.links.map(({ id, from, to, condensed }) => {
                  const active = ancestry.has(id) && ancestry.has(from.id)
                  const bend = (from.y + to.y) / 2
                  const sign = sourced ? -1 : 1
                  return <g key={id}><motion.path
                    initial={reduced ? false : { opacity: 0, ...(!condensed && { pathLength: 0 }) }}
                    animate={{ d: `M${from.x},${from.y - sign * 24} C${from.x},${bend} ${to.x},${bend} ${to.x},${to.y + sign * 24}`, opacity: active ? 1 : .48, ...(!condensed && { pathLength: 1 }) }}
                    transition={transition} stroke={active ? 'var(--lp-accent)' : 'var(--lp-muted)'}
                    strokeWidth={active ? 2.6 : 1.4} strokeDasharray={condensed ? '4 5' : undefined} fill="none" />
                    {sourced && to.relation && <text className="lp-arc-label" x={(from.x + to.x) / 2 + 8} y={bend}>{to.relation}</text>}
                  </g>
                })}
              </svg>
              {layout.nodes.map(node => <motion.div key={node.id} className="lp-graph-node"
                initial={reduced ? false : { opacity: 0, x: node.x, y: node.y + 10 }}
                animate={{ opacity: 1, x: node.x, y: node.y }} transition={transition}>
                <button className={`lp-family-node ${node.parent ? '' : 'is-root'}`}
                  aria-pressed={selected.id === node.id} aria-label={`${node.label}, ${node.lang}`}
                  onClick={() => setSelected(node.id)}>
                  <span className="lp-form">{node.label}</span><span className="lp-lang">{node.lang}</span>
                </button>
              </motion.div>)}
            </div>
          </div>
        </div>
        <p className="lp-graph-legend"><span>{sourced ? 'Selected word above · cited sources below' : 'Ancestors below · relatives above'}</span><span>┄ condensed history</span><span>* reconstructed form</span></p>
      </div>
      <aside className="lp-inspector" aria-live="polite">
        <div className="lp-label">{selected.reconstructed ? 'Reconstructed form' : sourced ? selected.parent === null ? 'Selected word' : 'Cited source' : 'Selected family member'}</div>
        <p className="lp-word">{selected.label}</p><p className="lp-label">{selected.lang}</p>
        <p>{selected.gloss || family.note}</p>
        {sourced && selected.relation && <p className="lp-label">Relation: {selected.relation}. A component is a word part, not a historical ancestor.</p>}
        <p className="lp-label">{selected.condensed ? `Condensed lineage: ${selected.skipped.join(' → ')}` : sourced ? 'A form explicitly cited by the dictionary entry.' : 'A sourced form in this word family.'}</p>
        <a href={selected.source} target="_blank" rel="noreferrer">{sourced ? 'Source entry' : 'Entry'} ↗</a>
        {selected.edgeSource && <> · <a href={selected.edgeSource} target="_blank" rel="noreferrer">Relation evidence ↗</a></>}
        <details><summary>{sourced ? 'About these sources' : 'About this family'}</summary><p className="lp-label">{family.note}</p><p className="lp-label">{sourced ? 'Revision dated' : 'Checked'} {family.verifiedOn}. {family.attribution}</p></details>
        <p className="lp-label">Wiktionary · CC BY-SA 4.0 · {sourced ? 'live source lookup' : 'prepared family'}</p>
      </aside>
    </div>
  </div>
}

interface SyntaxProps { tokens: Token[]; selectedStart: number; selectedEnd: number; offset: number; onSelect: (start: number, end: number) => void }
function SyntaxExplorer({ tokens, selectedStart, selectedEnd, offset, onSelect }: SyntaxProps) {
  const markerId = useId().replace(/:/g, '')
  const graph = useMemo(() => syntaxLayout(tokens), [tokens])
  const reduced = useReducedMotion()
  const selectedId = tokens.findIndex(t => t.start + offset === selectedStart) + 1
  const selection = new Set(tokens.flatMap((t, i) => t.start + offset < selectedEnd && t.end + offset > selectedStart ? [i + 1] : []))
  const [all, setAll] = useState(false)
  const selected = tokens[selectedId - 1]
  return <div className="lp-syntax-explorer">
    <div className="lp-graph-toolbar"><span className="lp-label">Sentence structure</span>
      <button aria-pressed={all} onClick={() => setAll(v => !v)}>{all ? 'Focus on selected word' : 'Show all connections'}</button>
    </div>
    <div className="lp-graph-scroll" tabIndex={0} role="region" aria-label="Sentence dependencies. Scroll to read all words.">
      <div className="lp-syntax-stage" style={{ width: graph.width, height: graph.baseline + 80 }}>
        <svg width={graph.width} height={graph.baseline + 20} aria-hidden="true">
          <defs><marker id={`arrow-${markerId}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="var(--lp-accent)" /></marker></defs>
          {graph.arcs.map(arc => {
            const active = selection.has(arc.id) || selection.has(arc.head)
            return <g key={arc.id}>
              <motion.path initial={false} animate={{ opacity: active || all ? 1 : .1 }} transition={{ duration: reduced ? 0 : .18 }}
                d={`M${arc.from},${graph.baseline} C${arc.from},${graph.baseline - arc.rise} ${arc.to},${graph.baseline - arc.rise} ${arc.to},${graph.baseline - 5}`}
                stroke={active ? 'var(--lp-accent)' : 'var(--lp-muted)'} strokeWidth={active ? 2 : 1} fill="none" markerEnd={`url(#arrow-${markerId})`} />
              {active && <text x={(arc.from + arc.to) / 2} y={graph.baseline - arc.rise * .75 - 8} textAnchor="middle" className="lp-arc-label">{arc.relation}</text>}
            </g>
          })}
        </svg>
        {graph.tokens.map(({ token, id }, i) => <button key={id} className="lp-syntax-token" style={{ left: i * 112 + 22, top: graph.baseline + 6 }}
          aria-pressed={selection.has(id)} data-focus-id={`syntax-${id}`}
          onClick={() => onSelect(token.start + offset, token.end + offset)}>
          <span>{token.text}</span><small>{token.pos}{id === graph.rootId ? ' · root' : ''}</small>
        </button>)}
      </div>
    </div>
    <p className="lp-graph-legend">Dependent → head. Click a word to follow its connections; scroll horizontally for the full sentence.</p>
    {selection.size > 1 ? <p className="lp-syntax-reading">Selected expression · {selection.size} tokens. Highlighted connections include the surrounding sentence.</p> : selected && <p className="lp-syntax-reading"><strong>{selected.text}</strong> · {relationNames[selected.relation] || selected.relation}{selected.head ? <> → <strong>{tokens[selected.head - 1].text}</strong></> : ''}. {selected.explanation}</p>}
  </div>
}

const roots = new Map<HTMLElement, Root>()
function mount(container: HTMLElement, element: React.ReactNode) {
  let root = roots.get(container)
  if (!root) { root = createRoot(container); roots.set(container, root) }
  root.render(element)
}
export function mountFamily(container: HTMLElement, props: FamilyProps) {
  mount(container, <FamilyExplorer key={`${props.word}:${props.family.id || 'prepared'}`} {...props} />)
}
export function mountSyntax(container: HTMLElement, props: SyntaxProps) {
  mount(container, <SyntaxExplorer {...props} />)
}
export function unmountExplorers(parent: HTMLElement) {
  for (const [container, root] of roots) {
    if (parent === container || parent.contains(container)) { root.unmount(); roots.delete(container) }
  }
}
