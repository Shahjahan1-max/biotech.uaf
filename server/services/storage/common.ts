export const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/plain': '.txt',
  'image/png': '.png',
  'image/jpeg': '.jpg',
}

export const STORED_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{1,10}$/i

export function isValidStoredName(storedFileName: string): boolean {
  return STORED_NAME_PATTERN.test(storedFileName)
}

export function mimeTypeFromExt(ext: string): string | undefined {
  return Object.entries(ALLOWED_MIME_TYPES).find(([, e]) => e === ext)?.[0]
}

export function resourceTypeForExt(ext: string): 'image' | 'raw' {
  return ext === '.png' || ext === '.jpg' ? 'image' : 'raw'
}
