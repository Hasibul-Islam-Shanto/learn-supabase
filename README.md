# Meet — Social Media App

A full-featured social media web application built with React and Supabase.
Users can sign up, create posts, comment, like, follow others, receive
notifications, and exchange direct messages — all without a separate backend
server.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Tools Used](#3-tools-used)
4. [Setup Instructions](#4-setup-instructions)
5. [Deployment Steps](#5-deployment-steps)
6. [Problems Faced](#6-problems-faced)
7. [What I Learned](#7-what-i-learned)

---

## 1. Project Overview

**Meet** is a social networking app with the following features:

| Feature         | Description                                                   |
| --------------- | ------------------------------------------------------------- |
| Authentication  | Sign up and sign in with email and password                   |
| Feed            | Home feed showing posts from people you follow                |
| Posts           | Create, edit, and delete posts with optional images           |
| Comments        | Comment on posts, edit and delete your own comments           |
| Likes           | Like and unlike posts and individual comments                 |
| Follows         | Follow and unfollow other users                               |
| Profile         | View and edit your own profile, avatar, and cover photo       |
| Notifications   | Real-time bell notifications for likes, comments, and follows |
| Search          | Search for users by name or username                          |
| Discover        | Browse all users with follower counts                         |
| Direct Messages | 1:1 real-time messaging with unread badge                     |

The app has no dedicated backend. The React frontend communicates directly with
Supabase, which provides the database, authentication, file storage, and
real-time subscriptions.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (React)                      │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │   auth   │  │  posts   │  │messages  │  │profile │  │
│  │ feature  │  │ feature  │  │ feature  │  │feature │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       │              │              │             │       │
│       └──────────────┴──────┬───────┴─────────────┘       │
│                             │                             │
│                    supabase client                        │
│               (src/shared/lib/supabase.ts)               │
└─────────────────────────────┬───────────────────────────┘
                              │  HTTPS / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────┐
│                        Supabase                          │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │    Auth     │  │   Postgres   │  │    Storage     │  │
│  │             │  │   Database   │  │  (meet_images) │  │
│  │ • sign up   │  │              │  │                │  │
│  │ • sign in   │  │ • profiles   │  │ • avatars/     │  │
│  │ • sessions  │  │ • posts      │  │ • covers/      │  │
│  │ • JWT       │  │ • comments   │  │ • posts/       │  │
│  └─────────────┘  │ • likes      │  └────────────────┘  │
│                   │ • follows    │                        │
│  ┌─────────────┐  │ • notifs     │  ┌────────────────┐  │
│  │  Realtime   │  │ • convos     │  │  RLS Policies  │  │
│  │             │  │ • messages   │  │                │  │
│  │ • notifs    │  │              │  │ • per-table    │  │
│  │ • messages  │  │ + Triggers   │  │ • auth.uid()   │  │
│  │ • inbox     │  │ + RPCs       │  │   scoped       │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Folder Structure

```
src/
├── app/
│   ├── App.tsx                  # Routes
│   ├── NotFoundPage.tsx
│   └── providers/
│       ├── AuthProvider.tsx     # Session + profile context
│       └── MessagesProvider.tsx # Inbox + unread count context
│
├── features/
│   ├── auth/                    # Sign in, sign up pages + context
│   ├── posts/                   # Feed, post card, comments, likes
│   ├── profile/                 # Profile page, edit, follow/unfollow
│   ├── notifications/           # Bell dropdown + realtime hook
│   ├── messages/                # Inbox, thread, realtime messages
│   ├── search/                  # Global people search
│   └── users/                   # Discover users page
│
└── shared/
    ├── lib/
    │   └── supabase.ts          # Single Supabase client instance
    ├── types/index.ts           # All TypeScript interfaces
    ├── layout/                  # Navbar, Sidebar, AppLayout
    ├── ui/                      # Button, Avatar, Modal, TextField
    └── hooks/                   # useDebouncedValue
```

---

## 3. Tools Used

### Core

| Tool                                           | Version | Purpose                           |
| ---------------------------------------------- | ------- | --------------------------------- |
| [React](https://react.dev)                     | 19      | UI framework                      |
| [TypeScript](https://www.typescriptlang.org)   | 6       | Type safety                       |
| [Vite](https://vite.dev)                       | 8       | Dev server and bundler            |
| [Supabase](https://supabase.com)               | 2       | Database, Auth, Storage, Realtime |
| [React Router](https://reactrouter.com)        | 7       | Client-side routing               |
| [Tailwind CSS](https://tailwindcss.com)        | 4       | Utility-first styling             |
| [react-hot-toast](https://react-hot-toast.com) | 2       | Toast notifications               |

### Developer Tooling

| Tool        | Purpose                                            |
| ----------- | -------------------------------------------------- |
| ESLint      | Linting with React Hooks and React Refresh plugins |
| Prettier    | Code formatting                                    |
| Husky       | Git hooks (runs lint + format before every commit) |
| lint-staged | Runs linters only on staged files                  |
| commitlint  | Enforces conventional commit message format        |

---

## 4. Setup Instructions

### Prerequisites

- Node.js 18 or later
- A free [Supabase](https://supabase.com) account

### Step 1 — Clone and install

```bash
git clone https://github.com/your-username/learn-supabase.git
cd learn-supabase
npm install
```

### Step 2 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for the project to finish provisioning (about 1 minute).

### Step 3 — Apply the database schema

Open the **SQL Editor** in your Supabase dashboard and run the SQL from
`supabase.md` (Section 13 and all `CREATE TABLE` / RLS / trigger blocks).

The tables you need to create are:

```
profiles, posts, comments, likes, comment_likes,
follows, notifications, conversations,
conversation_participants, messages
```

Also run the trigger functions (`handle_new_user`, `notify_on_like`,
`notify_on_comment`, `notify_on_follow`, `touch_conversation_on_message`) and
the RPCs (`get_posts`, `get_conversations`, `get_or_create_conversation`,
`mark_conversation_read`).

See `supabase.md` for the full SQL of each.

### Step 4 — Create the Storage bucket

In **Storage → New bucket**:

- Name: `meet_images`
- Public bucket: yes

Then add the RLS policies for `storage.objects` (avatars, covers, posts folders)
as described in `supabase.md` Section 8.

### Step 5 — Add environment variables

Create a `.env` file at the project root:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

Both values are in **Project Settings → API** in the Supabase dashboard.

### Step 6 — Enable Realtime

In **Database → Replication → supabase_realtime publication**, enable the
following tables:

- `notifications`
- `messages`
- `conversation_participants`

### Step 7 — Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Available scripts

```bash
npm run dev          # Start dev server
npm run build        # Type-check + production build
npm run preview      # Serve the production build locally
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint errors
npm run format       # Format all files with Prettier
npm run type-check   # Run TypeScript compiler (no emit)
npm run check        # type-check + lint + format check together
```

---

## 5. Deployment Steps

This app is a static SPA (single-page application) — the build output is a
folder of HTML, CSS, and JS files that can be deployed anywhere.

### Build

```bash
npm run build
```

Output goes into `dist/`.

### Deploy to Vercel (recommended)

1. Push the repository to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Vercel auto-detects Vite. Leave all settings as default.
4. Add environment variables in **Project Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Click **Deploy**.

Every push to `main` triggers a new deployment automatically.

### Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**.
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add the same two environment variables.
5. Add a `_redirects` file inside `public/` so React Router works on full
   page refreshes:

```
/*  /index.html  200
```

### Important — Supabase URL allowlist

After deploying, add your production domain to the **Supabase Auth URL
configuration** so sign-in redirects work:

**Authentication → URL Configuration → Site URL** → set to your production URL  
**Redirect URLs** → add `https://your-domain.com/**`

---

## 6. Problems Faced

### Storage uploads were rejected with RLS errors

**Problem:** Uploading an avatar immediately threw
`new row violates row-level security policy for table "objects"`.

**Cause:** Supabase Storage has RLS enabled by default. With no policies defined,
every upload is denied — there is no "allow all" default.

**Fix:** Added explicit `storage.objects` policies for each folder
(`avatars/<user-id>/`, `covers/<user-id>/`, `posts/`) with
`auth.uid()::text` checks on the path segments.

---

### Unread message count did not clear after opening a conversation

**Problem:** After opening a thread and reading the messages, the unread badge
stayed the same number.

**Cause:** Two separate hook instances (`useUnreadMessageCount` in the Navbar and
`useConversations` in the inbox) each held their own state. When one updated,
the other did not. Also, `last_read_at` was being set from the browser clock
and compared against server-generated message timestamps — any clock skew left
messages looking unread.

**Fix:**

1. Moved all conversation state into a single `MessagesProvider` context so the
   Navbar badge and the inbox list always share the same data.
2. Replaced the client-side `last_read_at` update with a server-side RPC
   `mark_conversation_read()` that uses `now()` (database clock), eliminating
   clock skew entirely.

---

### Realtime notifications arrived without the actor's profile

**Problem:** When a notification arrived via the realtime channel, `payload.new`
only contained the raw notification row — the joined `actor` profile was
`undefined`.

**Cause:** `postgres_changes` payloads only include the raw table columns. They
do not resolve foreign key joins.

**Fix:** On receiving a realtime INSERT, re-fetch the full notification row with
the join (`profiles!notifications_actor_id_fkey`) and use that enriched object
to update state.

---

### Follower/following counts were always 0

**Problem:** The profile page showed `0 followers` and `0 following` even after
following other users.

**Cause:** The `follows` table has two foreign keys pointing at `profiles`
(`follower_id` and `following_id`). Without specifying the constraint name,
PostgREST could not resolve which relationship to use for each count.

**Fix:** Used constraint-name disambiguation in the select string:

```ts
`follower_count:follows!follows_following_id_fkey(count),
 following_count:follows!follows_follower_id_fkey(count)`;
```

---

### `onAuthStateChange` fired twice on first load

**Problem:** After sign-in, the auth state listener fired twice — once with
`null` and once with the session — causing a brief flash of the signed-out state.

**Cause:** Supabase fires `onAuthStateChange` on initial load with the current
state, and also when it changes. Combining it with `getSession` without
coordinating loading state caused a race.

**Fix:** Used `getSession()` only to set the initial session and the
`setLoading(false)` flag. Let `onAuthStateChange` handle all subsequent
changes. This avoids the double-fire problem.

---

## 7. What I Learned

### Supabase as a full backend replacement

The biggest takeaway is that Supabase genuinely replaces a Node/Express backend
for a CRUD-heavy app. Authentication, access control, file storage, real-time
events, and complex queries all live in one place. There is no API layer to
maintain.

### Row Level Security is the access control layer

RLS was the most important concept to get right. The rule is simple: enable RLS
on every table and add explicit policies. Without a policy, no one can access
the table. Policies run as SQL expressions per-row, which means access control
is enforced at the database level regardless of what the client sends.

### Joins in PostgREST are different from SQL

Supabase's PostgREST API uses a special string syntax for joins:
`relation:table!constraint(columns)`. When a table has multiple foreign keys
to the same target table (like `follows` has two keys to `profiles`), you must
use the constraint name to tell PostgREST which path to use.

### RPCs are essential for complex operations

The basic `supabase.from().select()` query builder is great for simple reads
and writes. But for anything that requires multiple tables, aggregation, or
atomic multi-step writes (like creating a conversation and inserting both
participants), a `SECURITY DEFINER` RPC written in PL/pgSQL is the right tool.
It runs entirely on the server and is called from the client with one line:
`supabase.rpc('function_name', { param })`.

### Realtime payloads do not include joins

When a row is inserted and triggers a realtime event, `payload.new` only
contains the raw columns of that row — no related data. To display a
notification with the actor's name and avatar, you must re-fetch the full row
with its joins after receiving the event.

### Shared state prevents stale UI

When multiple components display the same derived data (unread count in the
navbar vs. unread count per conversation in the inbox), they must share the
same state. Keeping them in separate hooks means updates to one never reach the
other. A React context provider (`MessagesProvider`) was the fix — one source
of truth, consumed in multiple places.

### Clock skew between browser and server

When comparing timestamps from different sources (browser-generated
`last_read_at` vs. server-generated `messages.created_at`), even a few hundred
milliseconds of difference causes logic bugs. The fix is to always use the
database clock (`now()`) via a server-side RPC for any write that will later
be compared against other server timestamps.

### Feature-sliced folder structure scales well

Organizing code by feature (`features/auth`, `features/posts`,
`features/messages`) instead of by type (`components`, `hooks`, `utils`) makes
it easy to find everything related to one feature in one folder. Each feature
has its own `api/`, `hooks/`, `components/`, and `pages/` subfolders.
