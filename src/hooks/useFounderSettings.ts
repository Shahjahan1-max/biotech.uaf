import { useEffect, useState } from 'react'
import { getFounderSettings, FOUNDER_SETTINGS_CHANGED_EVENT } from '../services/settings'
import { fetchFileUrl } from '../services/uploads'
import type { FounderSettings } from '../types/settings'

interface FounderSettingsState {
  settings: FounderSettings | null
  imageUrl: string | null
  isLoading: boolean
}

export function useFounderSettings(): FounderSettingsState {
  const [state, setState] = useState<FounderSettingsState>({
    settings: null,
    imageUrl: null,
    isLoading: true,
  })

  useEffect(() => {
    let active = true
    let objectUrl: string | null = null

    async function load() {
      try {
        const settings = await getFounderSettings()
        let url: string | null = null
        if (settings.founderImage) {
          url = await fetchFileUrl(settings.founderImage)
        }
        if (!active) {
          if (url) URL.revokeObjectURL(url)
          return
        }
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        objectUrl = url
        setState({ settings, imageUrl: url, isLoading: false })
      } catch {
        if (active) {
          setState((prev) =>
            prev.settings ? prev : { settings: null, imageUrl: null, isLoading: false }
          )
        }
      }
    }

    function handleChange() {
      void load()
    }

    void load()
    window.addEventListener(FOUNDER_SETTINGS_CHANGED_EVENT, handleChange)

    return () => {
      active = false
      window.removeEventListener(FOUNDER_SETTINGS_CHANGED_EVENT, handleChange)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [])

  return state
}
