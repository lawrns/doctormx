import type { ConnectProfileDraft } from './types'

export const CONNECT_DRAFT_STORAGE_KEY = 'doctorMx.connectDraft.v1'

export function saveConnectDraft(draft: ConnectProfileDraft): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(CONNECT_DRAFT_STORAGE_KEY, JSON.stringify(draft))
}

export function getConnectDraft(): ConnectProfileDraft | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(CONNECT_DRAFT_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ConnectProfileDraft
  } catch {
    return null
  }
}

export function clearConnectDraft(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(CONNECT_DRAFT_STORAGE_KEY)
}
