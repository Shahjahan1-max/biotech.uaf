import { apiFetch } from './api'
import type { FounderSettings, FounderSettingsUpdate } from '../types/settings'

export const FOUNDER_SETTINGS_CHANGED_EVENT = 'founder-settings-changed'

export function getFounderSettings(): Promise<FounderSettings> {
  return apiFetch<FounderSettings>('/settings/founder')
}

export function updateFounderSettings(
  input: FounderSettingsUpdate
): Promise<FounderSettings> {
  return apiFetch<FounderSettings>('/settings/founder', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function removeFounderImage(): Promise<FounderSettings> {
  return apiFetch<FounderSettings>('/settings/founder/image', { method: 'DELETE' })
}
