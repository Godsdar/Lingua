import { ServiceError } from './errors.ts'

interface GuardOptions { service?: string; concurrency: number; deadlineMs: number; threshold?: number; cooldownMs?: number; now?: () => number }

export class ProviderGuard {
  private options: GuardOptions
  private active = 0
  private failures = 0
  private openUntil = 0
  private probing = false
  constructor(options: GuardOptions) { this.options = options }

  async run<T>(operation: (signal: AbortSignal) => Promise<T>, parent: AbortSignal): Promise<T> {
    const service = this.options.service ?? 'Translation'
    const now = this.options.now ?? Date.now
    if (parent.aborted) throw new ServiceError(408, 'CANCELLED', 'Request cancelled')
    if (this.openUntil > now() || this.probing) throw new ServiceError(503, 'PROVIDER_UNAVAILABLE', `${service} is temporarily unavailable`, Math.max(1, Math.ceil((this.openUntil - now()) / 1000)))
    if (this.active >= this.options.concurrency) throw new ServiceError(503, 'BUSY', 'Server is at capacity', 1)
    const probe = this.openUntil !== 0
    if (probe) this.probing = true
    this.active++
    const deadline = new AbortController()
    const timer = setTimeout(() => deadline.abort(), this.options.deadlineMs)
    const signal = AbortSignal.any([deadline.signal, parent])
    let onAbort: () => void = () => {}
    const cancelled = new Promise<never>((_resolve, reject) => {
      onAbort = () => reject(parent.aborted
        ? new ServiceError(408, 'CANCELLED', 'Request cancelled')
        : new ServiceError(504, 'DEADLINE_EXCEEDED', `${service} exceeded its time budget`))
      signal.addEventListener('abort', onAbort, { once: true })
      if (signal.aborted) onAbort()
    })
    const work = Promise.resolve().then(() => operation(signal))
    // Keep capacity reserved until real completion, even if an adapter ignores abort.
    void work.then(() => { this.active-- }, () => { this.active-- })
    try {
      const result = await Promise.race([work, cancelled])
      if (probe || this.openUntil === 0) {
        this.failures = 0
        this.openUntil = 0
      }
      return result
    } catch (error) {
      if (!parent.aborted) {
        this.failures++
        if (probe || this.failures >= (this.options.threshold ?? 3)) this.openUntil = now() + (this.options.cooldownMs ?? 30000)
      }
      if (error instanceof ServiceError) throw error
      throw new ServiceError(503, 'PROVIDER_UNAVAILABLE', `${service} is temporarily unavailable`, 30)
    } finally {
      clearTimeout(timer)
      signal.removeEventListener('abort', onAbort)
      if (probe) this.probing = false
    }
  }
}
