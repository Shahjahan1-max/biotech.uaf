export interface DiscussionAuthor {
  id: string
  name: string
}

export interface DiscussionSubject {
  id: string
  name: string
  code: string
}

export interface DiscussionPost {
  id: string
  title: string
  content: string
  authorId: string
  subjectId: string
  author?: DiscussionAuthor
  subject?: DiscussionSubject
  replyCount: number
  createdAt: string
  updatedAt: string
}

export interface DiscussionReply {
  id: string
  content: string
  authorId: string
  postId: string
  author?: DiscussionAuthor
  createdAt: string
  updatedAt: string
}

export interface DiscussionPostInput {
  title: string
  content: string
  subjectId: string
}

export interface DiscussionReplyInput {
  content: string
}

export interface DiscussionListFilters {
  subjectId?: string
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedDiscussions {
  items: DiscussionPost[]
  page: number
  limit: number
  total: number
  totalPages: number
}
