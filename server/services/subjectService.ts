import { prisma } from '../utils/prisma.js'
import type { Subject, SubjectInput } from '../types/subject.js'


export async function getAllSubjects(): Promise<Subject[]> {
  return prisma.subject.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  return prisma.subject.findUnique({
    where: { id },
  })
}

export async function createSubject(input: SubjectInput): Promise<Subject> {
  const existing = await prisma.subject.findUnique({
    where: { code: input.code },
  })

  if (existing) {
    throw new Error('Subject code already exists')
  }

  return prisma.subject.create({
    data: input,
  })
}

export async function updateSubject(id: string, input: SubjectInput): Promise<Subject> {
  const existing = await prisma.subject.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new Error('Subject not found')
  }

  const duplicate = await prisma.subject.findUnique({
    where: { code: input.code },
  })

  if (duplicate && duplicate.id !== id) {
    throw new Error('Subject code already exists')
  }

  return prisma.subject.update({
    where: { id },
    data: input,
  })
}

export async function deleteSubject(id: string): Promise<void> {
  const existing = await prisma.subject.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new Error('Subject not found')
  }

  await prisma.subject.delete({
    where: { id },
  })
}
