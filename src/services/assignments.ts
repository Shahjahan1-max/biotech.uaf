import { apiFetch } from './api'
import type { Assignment, AssignmentInput } from '../types/assignment'

export async function listAssignments(subjectId?: string): Promise<Assignment[]> {
  const query = subjectId ? `?subjectId=${subjectId}` : ''
  const data = await apiFetch<{ assignments: Assignment[] }>(`/assignments${query}`)
  return data.assignments
}

export async function getAssignment(id: string): Promise<Assignment> {
  const data = await apiFetch<{ assignment: Assignment }>(`/assignments/${id}`)
  return data.assignment
}

export async function createAssignment(assignment: AssignmentInput): Promise<Assignment> {
  const data = await apiFetch<{ assignment: Assignment }>('/assignments', {
    method: 'POST',
    body: JSON.stringify(assignment),
  })
  return data.assignment
}

export async function updateAssignment(
  id: string,
  assignment: AssignmentInput
): Promise<Assignment> {
  const data = await apiFetch<{ assignment: Assignment }>(`/assignments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(assignment),
  })
  return data.assignment
}

export async function deleteAssignment(id: string): Promise<void> {
  await apiFetch(`/assignments/${id}`, { method: 'DELETE' })
}
