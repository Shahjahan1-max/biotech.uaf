import { records as portal } from '../../db/repository.js'
import type { Subject, SubjectInput } from '../types/subject.js'


export async function getAllSubjects(): Promise<Subject[]> {
  return portal.subject.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  return portal.subject.findUnique({
    where: { id },
  })
}

export async function createSubject(input: SubjectInput): Promise<Subject> {
  const existing = await portal.subject.findUnique({
    where: { code: input.code },
  })

  if (existing) {
    throw new Error('Subject code already exists')
  }

  return portal.subject.create({
    data: input,
  })
}

export async function updateSubject(id: string, input: SubjectInput): Promise<Subject> {
  const existing = await portal.subject.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new Error('Subject not found')
  }

  const duplicate = await portal.subject.findUnique({
    where: { code: input.code },
  })

  if (duplicate && duplicate.id !== id) {
    throw new Error('Subject code already exists')
  }

  return portal.subject.update({
    where: { id },
    data: input,
  })
}

export async function deleteSubject(id: string): Promise<void> {
  const existing = await portal.subject.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new Error('Subject not found')
  }

  await portal.subject.delete({
    where: { id },
  })
}
