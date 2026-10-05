import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Button } from './Button'
import { Spinner } from './Spinner'
import { FounderAvatar } from './FounderAvatar'
import {
  getFounderSettings,
  updateFounderSettings,
  FOUNDER_SETTINGS_CHANGED_EVENT,
} from '../services/settings'
import { uploadFile, deleteUpload, fetchFileUrl } from '../services/uploads'

const inputClassName =
  'w-full px-3 py-2.5 border border-border-subtle rounded-control text-sm bg-surface text-ink-strong placeholder:text-ink-muted transition-colors duration-150 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500'

const MAX_NAME_LENGTH = 100
const MAX_IMAGE_SIZE = 2 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg']

export function FounderSettingsForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [name, setName] = useState('')
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null)
  const [removeRequested, setRemoveRequested] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const createdUrlsRef = useRef<Set<string>>(new Set())

  function trackUrl(url: string | null): string | null {
    if (url) createdUrlsRef.current.add(url)
    return url
  }

  async function fetchFileUrlSafe(fileName: string): Promise<string | null> {
    try {
      return trackUrl(await fetchFileUrl(fileName))
    } catch {
      return null
    }
  }

  useEffect(() => {
    const urls = createdUrlsRef.current
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
      urls.clear()
    }
  }, [])

  useEffect(() => {
    let active = true

    getFounderSettings()
      .then(async (settings) => {
        if (!active) return
        setName(settings.founderName)
        setCurrentImage(settings.founderImage)
        const url = settings.founderImage
          ? await fetchFileUrlSafe(settings.founderImage)
          : null
        if (active) setPreviewUrl(url)
        else if (url) URL.revokeObjectURL(url)
      })
      .catch((err: unknown) => {
        if (active) {
          setLoadError(err instanceof Error ? err.message : 'Unable to load founder settings.')
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setSuccess('')

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Image must be a PNG or JPG file.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image must be 2 MB or smaller.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setRemoveRequested(false)
    setPendingFile(file)
    setPendingPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old)
      return trackUrl(URL.createObjectURL(file))
    })
  }

  function clearPendingFile() {
    setPendingFile(null)
    setPendingPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old)
      return null
    })
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleRemoveImage() {
    setError('')
    setSuccess('')
    clearPendingFile()
    setRemoveRequested(true)
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Founder name is required.')
      return
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      setError(`Founder name must be at most ${MAX_NAME_LENGTH} characters.`)
      return
    }

    const imageChanged = pendingFile !== null || (removeRequested && currentImage !== null)

    setIsSaving(true)
    let uploadedName: string | null = null

    try {
      let nextImage = currentImage

      if (pendingFile) {
        const uploaded = await uploadFile(pendingFile)
        uploadedName = uploaded.storedFileName
        nextImage = uploaded.storedFileName
      } else if (removeRequested) {
        nextImage = null
      }

      const payload: { founderName: string; founderImage?: string | null } = {
        founderName: trimmedName,
      }
      if (imageChanged) payload.founderImage = nextImage

      const updated = await updateFounderSettings(payload)

      if (imageChanged && currentImage) {
        await deleteUpload(currentImage).catch(() => {})
      }

      if (imageChanged) {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        if (pendingFile && pendingPreviewUrl) {
          setPreviewUrl(pendingPreviewUrl)
          setPendingPreviewUrl(null)
        } else {
          setPreviewUrl(updated.founderImage ? await fetchFileUrlSafe(updated.founderImage) : null)
        }
      }

      setName(updated.founderName)
      setCurrentImage(updated.founderImage)
      setPendingFile(null)
      setRemoveRequested(false)
      if (inputRef.current) inputRef.current.value = ''
      setSuccess('Saved successfully. The footer now shows the updated founder profile.')
      window.dispatchEvent(new Event(FOUNDER_SETTINGS_CHANGED_EVENT))
    } catch (err) {
      if (uploadedName && uploadedName !== currentImage) {
        await deleteUpload(uploadedName).catch(() => {})
      }
      setError(err instanceof Error ? err.message : 'Failed to save founder settings.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-surface rounded-card border border-border-subtle p-6 shadow-panel">
        <div className="flex items-center justify-center py-8">
          <Spinner label="Loading founder settings" />
        </div>
      </div>
    )
  }

  if (loadError && !name) {
    return (
      <div className="bg-surface rounded-card border border-border-subtle p-6 shadow-panel">
        <p role="alert" className="text-sm text-danger">{loadError}</p>
      </div>
    )
  }

  const shownImage = pendingFile ? pendingPreviewUrl : removeRequested ? null : previewUrl

  return (
    <form
      onSubmit={handleSave}
      className="bg-surface rounded-card border border-border-subtle p-6 shadow-panel animate-reveal"
    >
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col items-center gap-3">
          <FounderAvatar
            key={shownImage ?? 'fallback'}
            imageUrl={shownImage}
            name={name}
            className="w-20 h-20 text-2xl"
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isSaving}
            >
              {shownImage ? 'Change Image' : 'Upload Image'}
            </Button>
            {shownImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveImage}
                disabled={isSaving}
              >
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-ink-muted">PNG or JPG, up to 2 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Choose founder image"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="founderName" className="block text-sm font-medium text-ink-muted mb-1.5">
            Founder Name
          </label>
          <input
            id="founderName"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setSuccess('')
            }}
            maxLength={MAX_NAME_LENGTH}
            className={inputClassName}
            placeholder="e.g. Shah Jahan"
            disabled={isSaving}
          />
          <p className="mt-2 text-xs text-ink-muted">
            Shown as “Founder” with the profile image in the global footer for every user.
          </p>
        </div>
      </div>

      {pendingFile && (
        <p className="mt-4 text-sm text-ink-muted">
          New image selected:{' '}
          <span className="font-medium text-ink-strong">{pendingFile.name}</span> — save to apply.
        </p>
      )}

      {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
      {success && (
        <p className="mt-4 text-sm text-success" role="status">
          {success}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-3 border-t border-border-subtle pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={isSaving}
          style={{ backgroundImage: 'var(--gradient-brand)' }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
