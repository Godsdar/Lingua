import { savedRootsBackup } from './domain/entry'

export function mountRootsBackup() {
  const panel = document.querySelector<HTMLElement>('[data-roots-backup]')
  const button = panel?.querySelector<HTMLButtonElement>('[data-download-roots]')
  const status = panel?.querySelector<HTMLElement>('[data-backup-status]')
  if (!panel || !button || !status) return
  let raw: string | null = null
  try { raw = savedRootsBackup(localStorage) } catch { /* Storage can be disabled. */ }
  if (raw === null) return
  panel.hidden = false
  button.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([raw!], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'lingua-saved-roots-backup.json'
    document.body.append(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    status.textContent = 'Backup download started. Your original collection is unchanged.'
  })
}
