export function generateObservationId(): string {
  const id = globalThis.crypto?.randomUUID?.()
  return id ? `FW-${id.slice(0, 8).toUpperCase()}` : `FW-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function currentTimestamp(): string {
  return new Date().toISOString()
}

export function formatObservationDate(value: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}
