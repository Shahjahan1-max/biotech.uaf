import { useState } from 'react'

interface FounderAvatarProps {
  imageUrl: string | null
  name: string
  className?: string
}

export function FounderAvatar({ imageUrl, name, className = 'w-11 h-11' }: FounderAvatarProps) {
  const [failed, setFailed] = useState(false)

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        onError={() => setFailed(true)}
        className={`${className} object-cover rounded-full ring-1 ring-inset ring-white/20`}
      />
    )
  }

  const initial = name.trim().charAt(0).toUpperCase() || 'F'

  return (
    <span
      aria-hidden="true"
      className={`${className} flex items-center justify-center rounded-full font-semibold text-white ring-1 ring-inset ring-white/20 shadow-sm shadow-emerald-500/20`}
      style={{ backgroundImage: 'var(--gradient-brand)' }}
    >
      {initial}
    </span>
  )
}
