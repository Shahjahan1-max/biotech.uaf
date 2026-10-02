import { apiFetch } from './api'
import type {
  DiscussionListFilters,
  DiscussionPost,
  DiscussionPostInput,
  DiscussionReply,
  DiscussionReplyInput,
  PaginatedDiscussions,
} from '../types/discussion'

function buildQuery(filters: DiscussionListFilters): string {
  const params = new URLSearchParams()

  if (filters.subjectId) params.set('subjectId', filters.subjectId)
  if (filters.search) params.set('search', filters.search)
  if (filters.page !== undefined) params.set('page', String(filters.page))
  if (filters.limit !== undefined) params.set('limit', String(filters.limit))

  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function listDiscussions(
  filters: DiscussionListFilters = {}
): Promise<PaginatedDiscussions> {
  return apiFetch<PaginatedDiscussions>(`/discussions${buildQuery(filters)}`)
}

export async function getDiscussion(id: string): Promise<DiscussionPost> {
  const data = await apiFetch<{ post: DiscussionPost }>(`/discussions/${id}`)
  return data.post
}

export async function createDiscussion(input: DiscussionPostInput): Promise<DiscussionPost> {
  const data = await apiFetch<{ post: DiscussionPost }>('/discussions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.post
}

export async function updateDiscussion(
  id: string,
  input: DiscussionPostInput
): Promise<DiscussionPost> {
  const data = await apiFetch<{ post: DiscussionPost }>(`/discussions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return data.post
}

export async function deleteDiscussion(id: string): Promise<void> {
  await apiFetch(`/discussions/${id}`, { method: 'DELETE' })
}

export async function listReplies(postId: string): Promise<DiscussionReply[]> {
  const data = await apiFetch<{ replies: DiscussionReply[] }>(
    `/discussions/${postId}/replies`
  )
  return data.replies
}

export async function createReply(
  postId: string,
  input: DiscussionReplyInput
): Promise<DiscussionReply> {
  const data = await apiFetch<{ reply: DiscussionReply }>(`/discussions/${postId}/replies`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.reply
}

export async function updateReply(
  replyId: string,
  input: DiscussionReplyInput
): Promise<DiscussionReply> {
  const data = await apiFetch<{ reply: DiscussionReply }>(`/discussions/replies/${replyId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return data.reply
}

export async function deleteReply(replyId: string): Promise<void> {
  await apiFetch(`/discussions/replies/${replyId}`, { method: 'DELETE' })
}
