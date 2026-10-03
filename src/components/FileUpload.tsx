import { useState, useRef, type DragEvent } from 'react'
import { cn } from '../utils/cn'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  isUploading: boolean
  error?: string
}

export function FileUpload({ onFileSelect, onFileRemove, isUploading, error }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  function handleRemove() {
    setSelectedFile(null)
    onFileRemove()
    if (inputRef.current) inputRef.current.value = ''
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={isUploading ? -1 : 0}
        aria-label={
          selectedFile
            ? `Selected file: ${selectedFile.name}. Press Enter to choose a different file`
            : 'Choose a file to upload'
        }
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
          isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-300 hover:border-neutral-400',
          isUploading && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
        />

        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="font-medium text-neutral-900">{selectedFile.name}</p>
              <p className="text-sm text-neutral-500">
                {formatSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove() }}
              className="ml-4 p-2 text-neutral-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <svg className="w-10 h-10 text-neutral-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-neutral-700">
              {isUploading ? 'Uploading...' : 'Drop file here or click to browse'}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, PNG, JPG up to 4 MB
            </p>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
