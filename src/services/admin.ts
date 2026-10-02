import { apiFetch } from './api'
import type {
  AdminDashboardData,
  AdminStudentFilters,
  PaginatedAdminStudents,
} from '../types/admin'

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  return apiFetch<AdminDashboardData>('/admin/dashboard')
}

export async function listAdminStudents(
  filters: AdminStudentFilters = {}
): Promise<PaginatedAdminStudents> {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.page !== undefined) params.set('page', String(filters.page))
  if (filters.limit !== undefined) params.set('limit', String(filters.limit))

  const query = params.toString()
  return apiFetch<PaginatedAdminStudents>(`/admin/students${query ? `?${query}` : ''}`)
}
