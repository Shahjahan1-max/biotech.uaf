# Biotechnology — Section A Student Portal

A React and TypeScript student portal for subjects, study resources, assignments,
weekly timetables, discussions, announcements, and personal notifications.
Administrators can manage class content and view student accounts and dashboard statistics.

## Architecture

The React frontend and Express API deploy together on Netlify. The API is served
at the same-origin `/api` path by a Netlify Function, and client-side routes fall
back to `index.html` when opened directly. No separately hosted API is required.

Netlify Identity handles registration, login, email confirmation, and sessions.
Netlify Database stores structured portal data through Drizzle ORM. Netlify Blobs
stores uploaded documents and images so files survive function restarts and deploys.

## Development

Use Node.js 22.12 or newer, install dependencies once from the project root, and
start the Netlify development server:

```bash
npm install
npm run dev:netlify
```

Open the local site on port 8889. Netlify CLI must be installed and connected to
this site. Running Vite alone with `npm run dev` is only suitable for frontend
work; Identity, API functions, and Blobs require the Netlify runtime.

All dependencies now live in the root package. The old separate server install
and Prisma generation steps are no longer used.

## Accounts and Administration

Register through the portal and confirm the account using the email link before
signing in, unless Identity autoconfirm is enabled in project settings. New users
have the STUDENT role. Portal profiles are synchronized on authenticated API
requests, and passwords are managed exclusively by Identity.

To grant administration rights, assign the `admin` role in the user's
server-managed Identity application metadata (`app_metadata.roles`) using
Netlify Identity administration. Sign out and sign in again after changing roles.
User-editable profile metadata does not grant administrator access.

An administrator can add subjects on the Subjects page before creating resources,
assignments, timetable entries, and discussions. No sample subjects or accounts
are automatically inserted into the fresh database.

## Database and Deploys

The database schema is defined in `db/schema.ts`. Generate a migration after
schema changes:

```bash
npx drizzle-kit generate --name describe_schema_change
```

Migrations are stored in `netlify/database/migrations` and applied automatically
by Netlify during deployment. Do not manually push or apply database migrations.
Keep the pinned Drizzle beta packages; this adapter requires that release line.

The historical files under `prisma/` are retained for reference only. They are
not applied to the Netlify database. Existing accounts or data from a separately
hosted deployment are not automatically imported into Netlify Identity or the
new portal tables.

The frontend always uses the same-origin API. A legacy `VITE_API_URL` setting
is no longer used and cannot redirect requests to a missing external backend.

## Uploads

Administrators can upload PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, TXT, PNG, and JPEG
files up to 4 MB. The limit leaves room for serverless request encoding overhead.
Study-resource uploads require a subject and create a visible resource record
with its attachment details. File reads require authentication, and upload and
delete operations require the ADMIN role.

## Checks

```bash
npm run typecheck
npm run lint
npm audit
```

The typecheck covers the frontend, Vite configuration, API, functions, and database
code without producing build artifacts. The project does not currently contain
a committed automated test suite. Deployment builds are handled by Netlify.
