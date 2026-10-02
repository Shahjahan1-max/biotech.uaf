type ClassValue = string | boolean | undefined | null | Record<string, boolean>

export function cn(...classes: ClassValue[]): string {
  return classes
    .filter(Boolean)
    .map((cls) => {
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls as Record<string, boolean>)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(' ')
      }
      return String(cls)
    })
    .join(' ')
}
