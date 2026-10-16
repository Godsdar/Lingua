/** Old query links prefill text only. Opening a link never submits it to a provider. */
export function passageFromLink(search: string): string | null {
  const value = new URLSearchParams(search).get('q')
  return value?.trim() && value.length <= 6000 ? value : null
}

/** Relative resolution keeps GitHub Pages' repository prefix and query/hash intact. */
export function notebookHome(href: string): string {
  const current = new URL(href)
  const target = new URL(current)
  target.pathname = current.pathname.replace(/\/concept(?:\/index\.html|\/)?$/, '/')
  target.search = current.search
  target.hash = current.hash
  return target.href
}

/** Read the original payload verbatim, including unknown fields or damaged JSON. Never migrate or delete it. */
export function savedRootsBackup(storage: Pick<Storage, 'getItem'>): string | null {
  try { return storage.getItem('lingua.roots.v1') || null } catch { return null }
}
