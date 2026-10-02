export type ResourceType = 'NOTE' | 'STUDY_GUIDE' | 'PRESENTATION' | 'REFERENCE' | 'OTHER'

export interface StudyResource {
  id: string
  title: string
  description: string | null
  resourceType: ResourceType
  url: string | null
  fileName: string | null
  originalFileName: string | null
  filePath: string | null
  fileMimeType: string | null
  fileSize: number | null
  subjectId: string
  subject?: {
    id: string
    name: string
    code: string
  }
  createdAt: string
  updatedAt: string
}
