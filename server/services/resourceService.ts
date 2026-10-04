import type { ResourceType } from '@prisma/client'
import { prisma } from '../utils/prisma.js'
import type { ResourceInput, StudyResource } from '../types/resource.js'
import { excerpt, notifyStudents, safeNotify } from './notificationService.js'


const VALID_TYPES: ResourceType[] = ['NOTE', 'STUDY_GUIDE', 'PRESENTATION', 'REFERENCE', 'OTHER']

const MAX_TITLE_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 5000

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function validateInput(input: ResourceInput): void {
  if (typeof input.title !== 'string' || input.title.trim().length === 0) {
    throw new Error('Title is required')
  }
  if (input.title.length > MAX_TITLE_LENGTH) {
    throw new Error(`Title must be ${MAX_TITLE_LENGTH} characters or fewer`)
  }
  if (input.description !== undefined && input.description !== null) {
    if (typeof input.description !== 'string' || input.description.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error(`Description must be a string of ${MAX_DESCRIPTION_LENGTH} characters or fewer`)
    }
  }
  if (input.url !== undefined && input.url !== null && !isValidUrl(input.url)) {
    throw new Error('Invalid URL — only http and https links are allowed')
  }
  if (!VALID_TYPES.includes(input.resourceType)) {
    throw new Error('Invalid resource type')
  }
  if (typeof input.subjectId !== 'string' || input.subjectId.trim().length === 0) {
    throw new Error('Subject is required')
  }
  const fileStringFields = [input.fileName, input.originalFileName, input.filePath, input.fileMimeType]
  if (fileStringFields.some((value) => value !== undefined && value !== null && typeof value !== 'string')) {
    throw new Error('Invalid file metadata')
  }
  if (input.fileSize !== undefined && input.fileSize !== null && typeof input.fileSize !== 'number') {
    throw new Error('Invalid file metadata')
  }
}

async function assertSubjectExists(subjectId: string): Promise<void> {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
  if (!subject) throw new Error('Subject does not exist')
}

export async function getResources(subjectId?: string): Promise<StudyResource[]> {
  return prisma.studyResource.findMany({
    where: subjectId ? { subjectId } : undefined,
    include: { subject: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getResourceById(id: string): Promise<StudyResource | null> {
  return prisma.studyResource.findUnique({
    where: { id },
    include: { subject: true },
  })
}

export async function createResource(input: ResourceInput): Promise<StudyResource> {
  validateInput(input)
  const subject = await prisma.subject.findUnique({ where: { id: input.subjectId } })
  if (!subject) throw new Error('Subject does not exist')

  const resource = await prisma.studyResource.create({
    data: input,
    include: { subject: true },
  })

  await safeNotify(
    () =>
      notifyStudents({
        type: 'RESOURCE',
        title: resource.title,
        message: excerpt(resource.description ?? '') || `New ${subject.name} resource`,
        link: '/resources',
      }),
    'resource-create'
  )

  return resource
}

export async function updateResource(id: string, input: ResourceInput): Promise<StudyResource> {
  const existing = await prisma.studyResource.findUnique({ where: { id } })
  if (!existing) throw new Error('Resource not found')

  validateInput(input)
  await assertSubjectExists(input.subjectId)

  return prisma.studyResource.update({
    where: { id },
    data: input,
    include: { subject: true },
  })
}

export async function deleteResource(id: string): Promise<void> {
  const existing = await prisma.studyResource.findUnique({ where: { id } })
  if (!existing) throw new Error('Resource not found')

  await prisma.studyResource.delete({ where: { id } })
}