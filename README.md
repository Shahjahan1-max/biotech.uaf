# Biotechnology — Section A Student Portal

A full-stack student portal for a Biotechnology (Section A) class: subjects, study
resources, assignments, timetable, discussions, announcements, and notifications,
with a role-based admin dashboard.

## Features

**Students (role `STUDENT`)**
- Browse subjects and per-subject details (resources, assignments, schedule, discussions, announcements)
- Study resources with type/subject filtering
- Assignments list and detail views with status badges (Upcoming / Due Soon / Overdue)
- Weekly timetable
- Discussion board: create, reply, edit, delete own content
- Announcements with type/priority badges and expiry support
- Notifications (mark read, mark all read, delete) with unread badge in the header
- Profile read from the session

**Admins (role `ADMIN`)**
- Everything students can do, plus:
- Admin dashboard with real stats and recent activity
- Manage students (search + pagination)
- Create/edit/delete: subjects, resources, assignments, timetable entries, discussions, announcements
- Upload files (PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, TXT, PNG, JPG up to 10 MB)
- Include-expired filter for announcements

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 19, TypeScript, Vite 8, Tailwind CSS v4, react-router-dom, oxlint |
| Backend   | Node.js, Express, TypeScript (tsx), JWT (HTTP-only cookie `biotech_session`), bcryptjs |
| Database  | PostgreSQL + Prisma ORM (migrations in `prisma/migrations`) |
| Dev ports | Frontend `5173`, API `3001` |

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ running locally (database `biotech_section_a`)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   cd server && npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` (root) and fill in your own values:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/biotech_section_a"
   PORT=3001
   JWT_SECRET="<generate a long random string>"
   JWT_EXPIRES_IN="7d"
   FRONTEND_URL="http://localhost:5173"
   UPLOAD_DIR="uploads"
   CLOUDINARY_URL="cloudinary://<api_key>:<api_secret>@<cloud_name>"
   CLOUDINARY_FOLDER="biotech"
   MAX_FILE_SIZE="10485760"
   VAPID_PUBLIC_KEY="<run: npx web-push generate-vapid-keys>"
   VAPID_PRIVATE_KEY="<run: npx web-push generate-vapid-keys>"
   VAPID_SUBJECT="https://biotechuaf.com"
   VITE_API_URL="http://localhost:3001/api"
   ```

   `JWT_SECRET` must be a long random value (32+ characters). The server refuses to
   start in production with a missing, short, or default secret. Never commit `.env`.

   `CLOUDINARY_URL` enables **persistent object storage** (Cloudinary) for uploads.
   Set it in production so uploaded files (founder image, resources) survive restarts
   and redeploys; without it, files are stored in `UPLOAD_DIR` on the local disk,
   which is fine for local development but is lost whenever the server is redeployed.
   `CLOUDINARY_FOLDER` is optional and organizes files in your Cloudinary media library.

   `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` enable Web Push notifications. Generate a
   pair with `npx web-push generate-vapid-keys` (per environment) and keep the private
   key secret — never commit it. `VAPID_SUBJECT` is the contact URI sent to push
   services (defaults to `https://biotechuaf.com`). Local backend: root `.env`.
   Production backend (Render): set all three in the Render dashboard. The frontend
   fetches the public key from the API, so no Vercel variables are needed. Push
   features degrade gracefully when these are unset.

3. **Create the database and run migrations**

   ```bash
   createdb biotech_section_a        # or use your PostgreSQL tooling
   npx prisma migrate dev
   ```

4. **Seed subjects (roles are created by migrations)**

   ```bash
   npx prisma db seed
   ```

## Running

```bash
# terminal 1 — API (http://localhost:3001)
npm run server

# terminal 2 — frontend (http://localhost:5173)
npm run dev
```

Open http://localhost:5173, register an account (always created as `STUDENT`),
then promote it to admin once:

```bash
npx prisma migrate dev   # if you added a promote script, otherwise use a Prisma script/REPL
```

Example one-off promote (run from project root with `node --input-type=module` or
any Prisma script): set `user.role` to the `ADMIN` role by id, then **log out and
back in** (the role is read from the JWT, not the database, for the session).

## Scripts

| Command | Where | Purpose |
|---------|-------|---------|
| `npm run dev` | root | Vite dev server |
| `npm run build` | root | `tsc -b` + production bundle |
| `npm run lint` | root | oxlint |
| `npm run preview` | root | Preview production build |
| `npm run server` | root | Start API via tsx |
| `npx prisma migrate dev` | root | Create/apply migrations |
| `npx prisma validate` / `npx prisma generate` | root | Schema validation / client generation |
| `npx tsc -p tsconfig.json --noEmit` | `server/` | TypeScript check for the API |

## API Overview

All responses are JSON; errors use `{ "error": "message" }`.

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET/POST /api/subjects`, `GET/PUT/DELETE /api/subjects/:id`
- `GET/POST /api/resources`, `GET/PUT/DELETE /api/resources/:id`
- `GET/POST /api/assignments`, `GET/PUT/DELETE /api/assignments/:id`
- `GET/POST /api/schedule`, `PUT/DELETE /api/schedule/:id`
- `GET/POST /api/discussions`, `GET/PUT/DELETE /api/discussions/:id`
- `GET/POST /api/discussions/:id/replies`, `PUT/DELETE /api/replies/:id`
- `GET/POST /api/announcements`, `GET/PUT/DELETE /api/announcements/:id`
- `GET /api/notifications`, `PATCH /api/notifications/read-all`, `PATCH/DELETE /api/notifications/:id`, `GET /api/notifications/unread-count`
- `GET /api/admin/dashboard`, `GET /api/admin/students`
- `POST /api/uploads` (admin), `GET /api/uploads/:filename`, `DELETE /api/uploads/:filename` (admin)

List endpoints paginate with `page` & `limit` (default 20, max 100) and return
`{ items, page, limit, total, totalPages }`. Auth uses an HTTP-only cookie;
mutations are role-checked server-side (`STUDENT` vs `ADMIN`).

## Project Structure

```
├── prisma/            # schema.prisma, migrations, seed
├── server/            # Express API (TypeScript, own node_modules)
│   ├── config/        # env loading & validation
│   ├── controllers/   # request handlers
│   ├── middleware/    # auth, roles, uploads, error handler
│   ├── routes/        # route table
│   ├── services/      # business logic (Prisma), storage
│   └── utils/         # shared prisma client, error mapping
├── src/               # React frontend
│   ├── components/    # UI system (Card, Button, Badge, SectionHeader, ...)
│   ├── pages/         # route pages
│   ├── services/      # typed API client
│   ├── hooks/         # auth context hook
│   └── types/         # shared TS types
└── uploads/           # stored files (git-ignored)
```

## Security Notes

- JWT delivered as an HTTP-only, SameSite=Lax cookie; `Secure` in production
- Passwords hashed with bcrypt (12 rounds)
- Strict input validation on all write endpoints (lengths, enums, URL schemes, date format)
- File uploads: extension + MIME whitelist, 10 MB limit, random UUID stored names,
  path-traversal-proof resolution, 413/400 responses for oversized/invalid files
- Malformed JSON bodies return 400; unexpected errors return a generic 500 (no stack traces)
- CORS restricted to the configured frontend origin
- Uploads served with a sanitized `Content-Disposition` filename

## Testing / Verification

```bash
npm run build          # frontend type-check + production bundle
npm run lint           # oxlint (0 errors)
cd server && npx tsc -p tsconfig.json --noEmit
npx prisma validate    # schema sanity
```

End-to-end API flows were verified against a local server with scripted
register/login/CRUD/notification/upload scenarios, including negative cases
(401/403, invalid IDs, invalid enums, traversal attempts, oversized files).
