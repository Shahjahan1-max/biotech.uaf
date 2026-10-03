CREATE TYPE "announcement_priority" AS ENUM('NORMAL', 'IMPORTANT', 'URGENT');--> statement-breakpoint
CREATE TYPE "announcement_type" AS ENUM('GENERAL', 'ASSIGNMENT', 'QUIZ', 'EXAM', 'LECTURE', 'SCHEDULE', 'RESOURCE', 'OTHER');--> statement-breakpoint
CREATE TYPE "day_of_week" AS ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');--> statement-breakpoint
CREATE TYPE "notification_type" AS ENUM('ANNOUNCEMENT', 'ASSIGNMENT', 'DISCUSSION_REPLY', 'RESOURCE', 'SCHEDULE', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "resource_type" AS ENUM('NOTE', 'STUDY_GUIDE', 'PRESENTATION', 'REFERENCE', 'OTHER');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('STUDENT', 'ADMIN');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" text PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"type" "announcement_type" NOT NULL,
	"priority" "announcement_priority" NOT NULL,
	"subject_id" text,
	"author_id" text NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" text PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"file_name" text,
	"file_path" text,
	"title" text NOT NULL,
	"description" text,
	"due_date" timestamp with time zone NOT NULL,
	"subject_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "discussion_posts" (
	"id" text PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"author_id" text NOT NULL,
	"subject_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discussion_replies" (
	"id" text PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"content" text NOT NULL,
	"author_id" text NOT NULL,
	"post_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_resources" (
	"id" text PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"file_name" text,
	"file_path" text,
	"title" text NOT NULL,
	"description" text,
	"resource_type" "resource_type" NOT NULL,
	"url" text,
	"original_file_name" text,
	"file_mime_type" text,
	"file_size" integer,
	"subject_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_schedules" (
	"id" text PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"day_of_week" "day_of_week" NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"instructor" text NOT NULL,
	"room" text NOT NULL,
	"subject_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" text PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL UNIQUE,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'STUDENT'::"user_role" NOT NULL
);
--> statement-breakpoint
CREATE INDEX "announcements_subject_idx" ON "announcements" ("subject_id");--> statement-breakpoint
CREATE INDEX "announcements_expires_idx" ON "announcements" ("expires_at");--> statement-breakpoint
CREATE INDEX "announcements_created_idx" ON "announcements" ("created_at");--> statement-breakpoint
CREATE INDEX "assignments_subject_idx" ON "assignments" ("subject_id");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "notifications_created_idx" ON "notifications" ("created_at");--> statement-breakpoint
CREATE INDEX "posts_subject_idx" ON "discussion_posts" ("subject_id");--> statement-breakpoint
CREATE INDEX "posts_author_idx" ON "discussion_posts" ("author_id");--> statement-breakpoint
CREATE INDEX "posts_created_idx" ON "discussion_posts" ("created_at");--> statement-breakpoint
CREATE INDEX "replies_post_idx" ON "discussion_replies" ("post_id");--> statement-breakpoint
CREATE INDEX "replies_author_idx" ON "discussion_replies" ("author_id");--> statement-breakpoint
CREATE INDEX "resources_subject_idx" ON "study_resources" ("subject_id");--> statement-breakpoint
CREATE INDEX "schedules_day_idx" ON "class_schedules" ("day_of_week");--> statement-breakpoint
CREATE INDEX "schedules_subject_idx" ON "class_schedules" ("subject_id");--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_subject_id_subjects_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_subject_id_subjects_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "discussion_posts" ADD CONSTRAINT "discussion_posts_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "discussion_posts" ADD CONSTRAINT "discussion_posts_subject_id_subjects_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_post_id_discussion_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "discussion_posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "study_resources" ADD CONSTRAINT "study_resources_subject_id_subjects_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_subject_id_subjects_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE;