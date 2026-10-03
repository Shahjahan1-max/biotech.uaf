import { randomUUID } from 'node:crypto'
import { pgTable, text, timestamp, integer, pgEnum, index } from 'drizzle-orm/pg-core'

export const resourceType = pgEnum('resource_type', ['NOTE', 'STUDY_GUIDE', 'PRESENTATION', 'REFERENCE', 'OTHER'])
export const dayOfWeek = pgEnum('day_of_week', ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
export const announcementType = pgEnum('announcement_type', ['GENERAL', 'ASSIGNMENT', 'QUIZ', 'EXAM', 'LECTURE', 'SCHEDULE', 'RESOURCE', 'OTHER'])
export const announcementPriority = pgEnum('announcement_priority', ['NORMAL', 'IMPORTANT', 'URGENT'])
export const notificationType = pgEnum('notification_type', ['ANNOUNCEMENT', 'ASSIGNMENT', 'DISCUSSION_REPLY', 'RESOURCE', 'SCHEDULE', 'SYSTEM'])
export const userRole = pgEnum('user_role', ['STUDENT', 'ADMIN'])

const identity = () => ({
  id: text('id').primaryKey().$defaultFn(randomUUID),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
const timestamps = () => ({
  ...identity(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
})
const fileFields = () => ({ fileName: text('file_name'), filePath: text('file_path') })

export const users = pgTable('users', {
  ...timestamps(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: userRole('role').notNull().default('STUDENT'),
})

export const subjects = pgTable('subjects', {
  ...timestamps(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  description: text('description'),
})

export const resources = pgTable('study_resources', {
  ...timestamps(),
  ...fileFields(),
  title: text('title').notNull(),
  description: text('description'),
  resourceType: resourceType('resource_type').notNull(),
  url: text('url'),
  originalFileName: text('original_file_name'),
  fileMimeType: text('file_mime_type'),
  fileSize: integer('file_size'),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
}, (table) => [index('resources_subject_idx').on(table.subjectId)])

export const assignments = pgTable('assignments', {
  ...timestamps(),
  ...fileFields(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
}, (table) => [index('assignments_subject_idx').on(table.subjectId)])

export const schedules = pgTable('class_schedules', {
  ...timestamps(),
  dayOfWeek: dayOfWeek('day_of_week').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  instructor: text('instructor').notNull(),
  room: text('room').notNull(),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
}, (table) => [index('schedules_day_idx').on(table.dayOfWeek), index('schedules_subject_idx').on(table.subjectId)])

export const posts = pgTable('discussion_posts', {
  ...timestamps(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
}, (table) => [index('posts_subject_idx').on(table.subjectId), index('posts_author_idx').on(table.authorId), index('posts_created_idx').on(table.createdAt)])

export const replies = pgTable('discussion_replies', {
  ...timestamps(),
  content: text('content').notNull(),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
}, (table) => [index('replies_post_idx').on(table.postId), index('replies_author_idx').on(table.authorId)])

export const announcements = pgTable('announcements', {
  ...timestamps(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: announcementType('type').notNull(),
  priority: announcementPriority('priority').notNull(),
  subjectId: text('subject_id').references(() => subjects.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
}, (table) => [index('announcements_subject_idx').on(table.subjectId), index('announcements_expires_idx').on(table.expiresAt), index('announcements_created_idx').on(table.createdAt)])

export const notifications = pgTable('notifications', {
  ...identity(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationType('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  readAt: timestamp('read_at', { withTimezone: true }),
}, (table) => [index('notifications_user_idx').on(table.userId), index('notifications_read_idx').on(table.userId, table.readAt), index('notifications_created_idx').on(table.createdAt)])

export type ResourceType = typeof resourceType.enumValues[number]
export type DayOfWeek = typeof dayOfWeek.enumValues[number]
export type AnnouncementType = typeof announcementType.enumValues[number]
export type AnnouncementPriority = typeof announcementPriority.enumValues[number]
export type NotificationType = typeof notificationType.enumValues[number]
