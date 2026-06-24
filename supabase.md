# Supabase in This Project — A Complete Journey

This document walks through every Supabase feature used in this social app, from
the simplest setup to the most complex real-time messaging patterns. Follow it
top-to-bottom to understand how to build a production-ready app with Supabase.

---

## About This Project

This is a social media application called **Meet** — similar to a simple version
of Twitter/Facebook. Users can sign up, write posts, comment, like, follow each
other, get notifications, and send direct messages.

Every piece of data — users, posts, messages, notifications — lives in Supabase.
There is no separate backend server. The React frontend talks directly to
Supabase via the JavaScript client.

---

## What Supabase Does in This App

Here is a plain-English map of which Supabase feature powers which app feature:

| App Feature                                       | Supabase Feature Used                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Sign up / Sign in / Sign out                      | **Auth** — `supabase.auth.signUp`, `signInWithPassword`, `signOut`                                |
| Stay logged in across page refreshes              | **Auth** — session stored in localStorage, restored via `getSession`                              |
| Show who is logged in anywhere in the app         | **Auth** — `onAuthStateChange` listener in a React context                                        |
| User profile (name, bio, avatar, cover)           | **Database** — `profiles` table, read/update with `supabase.from()`                               |
| Create, edit, delete posts                        | **Database** — `posts` table, `insert` / `update` / `delete`                                      |
| Show post author name and avatar on each post     | **Database** — foreign key join: `author:profiles!posts_author_id_fkey(...)`                      |
| Like / unlike a post or comment                   | **Database** — `likes` / `comment_likes` tables, insert or delete a row                           |
| Show like counts and comment counts on posts      | **Database** — aggregate count join: `like_count:likes(count)`                                    |
| Comment on a post, edit or delete a comment       | **Database** — `comments` table, CRUD operations                                                  |
| Follow / unfollow another user                    | **Database** — `follows` table, insert or delete a row                                            |
| Show follower and following counts on a profile   | **Database** — two aggregate count joins on the `follows` table                                   |
| Search for users by name or username              | **Database** — `.or()` filter with `ilike` (case-insensitive search)                              |
| Upload a profile photo or cover photo             | **Storage** — upload to `meet_images` bucket, save the public URL to `profiles`                   |
| Attach an image to a post                         | **Storage** — upload to `meet_images` bucket, save the public URL to `posts`                      |
| Notifications (like, comment, follow)             | **Database + Triggers** — `notifications` table, rows inserted automatically by Postgres triggers |
| Bell icon shows unread count, mark as read        | **Database + Realtime** — `update` to set `is_read`, live subscription for new inserts            |
| 1:1 direct messages                               | **Database** — `conversations`, `conversation_participants`, `messages` tables                    |
| Create a new conversation or open an existing one | **RPC** — `get_or_create_conversation()` (atomic, no race conditions)                             |
| Inbox with last message preview and unread count  | **RPC** — `get_conversations()` (complex join done on the server)                                 |
| Messages appear instantly without refresh         | **Realtime** — subscribe to `messages` table inserts on a channel                                 |
| Unread badge in the navbar                        | **Realtime** — `MessagesProvider` subscribes to new messages, counts unread                       |
| Home feed (posts from people you follow)          | **RPC** — `get_posts()` (server-side join for followed users + liked_by_me)                       |
| Only see your own notifications / messages        | **RLS** — Row Level Security policies enforce access at the database level                        |
| Can only edit/delete your own posts or comments   | **RLS** — `using (auth.uid() = author_id)` policy on update/delete                                |

---

## Supabase Features Used — One Line Each

| Feature                  | What it does in simple terms                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**                 | Manages user accounts and login sessions. Gives you `session.user.id` which is used everywhere.                                                   |
| **Database (PostgREST)** | A Postgres database you query from the browser. No SQL — you use a chainable JS API.                                                              |
| **Joins**                | Fetch related rows in one query (e.g. post + author profile) using foreign key relationships.                                                     |
| **Aggregate counts**     | Count related rows (e.g. how many likes a post has) without fetching the rows themselves.                                                         |
| **Storage**              | Upload images and get back a public CDN URL to store in the database.                                                                             |
| **Row Level Security**   | Database-level access rules. Even if the client sends a broad query, Postgres only returns rows the user is allowed to see.                       |
| **Triggers**             | Postgres functions that run automatically when rows change. Used to create notifications and update timestamps.                                   |
| **RPCs**                 | Custom SQL functions you call like an API. Used when a task is too complex for the basic query builder (joins + aggregates + writes in one call). |
| **Realtime**             | WebSocket subscriptions to database changes. New messages and notifications appear live without polling.                                          |

---

## Table of Contents

1. [What is Supabase?](#1-what-is-supabase)
2. [Project Setup — Client Initialization](#2-project-setup--client-initialization)
3. [Authentication](#3-authentication)
   - Sign Up
   - Sign In
   - Session Management & Auth State
   - Sign Out
4. [Database — Basic CRUD](#4-database--basic-crud)
   - Reading Data
   - Inserting Data
   - Updating Data
   - Deleting Data
5. [Filtering, Ordering, and Limiting](#5-filtering-ordering-and-limiting)
6. [Joins — Embedding Related Data](#6-joins--embedding-related-data)
7. [Aggregate Counts via Joins](#7-aggregate-counts-via-joins)
8. [Storage — File Uploads](#8-storage--file-uploads)
9. [Row Level Security (RLS)](#9-row-level-security-rls)
   - profiles
   - posts
   - comments
   - likes / comment_likes
   - follows
   - notifications
   - conversations / messages
10. [Database Triggers](#10-database-triggers)
11. [RPCs — Custom Server Functions](#11-rpcs--custom-server-functions)
12. [Realtime — Live Subscriptions](#12-realtime--live-subscriptions)
13. [Full Schema Reference](#13-full-schema-reference)

---

## 1. What is Supabase?

Supabase is an open-source Firebase alternative. It gives you:

- **Authentication** — email/password, social logins, JWTs
- **Database** — a full Postgres database
- **Storage** — S3-compatible file storage
- **Realtime** — live database change subscriptions
- **Edge Functions** — server-side logic (not used in this project)

Everything is accessed via the JavaScript client (`@supabase/supabase-js`).

---

## 2. Project Setup — Client Initialization

**Install the package:**

```bash
npm install @supabase/supabase-js
```

**Create the client once and export it:**

```ts
// src/shared/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**`.env` file (never commit):**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

> Use `VITE_` prefix because this app is built with Vite. The anon key is safe
> to ship in the browser — Supabase's Row Level Security prevents unauthorized
> access at the database level.

Import and use this single `supabase` instance throughout the app:

```ts
import { supabase } from '@/shared/lib/supabase';
```

---

## 3. Authentication

### Sign Up

```ts
// src/features/auth/pages/SignUpPage.tsx
const { data, error } = await supabase.auth.signUp({
  email,
  password,
});
```

`data.user` contains the new user. On success, navigate to sign-in.

### Sign In

```ts
// src/features/auth/pages/SignInPage.tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

Supabase stores the JWT in `localStorage` automatically. On the next app load,
the session is restored without requiring the user to log in again.

### Session Management & Auth State

Wrap the whole app in an `AuthProvider` that:

1. Reads the current session once on mount via `getSession()`
2. Subscribes to future changes via `onAuthStateChange()`

```ts
// src/app/providers/AuthProvider.tsx
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setSession(data.session);
    setLoading(false);
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return () => subscription.unsubscribe();
}, []);
```

The `session` object contains `session.user.id` — the currently logged-in user's
UUID. This is used everywhere to scope queries.

After the session loads, fetch the user's profile row from the `profiles` table:

```ts
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

Expose session and profile through a context so any component can access them:

```ts
// src/features/auth/context/auth-context.ts
export const AuthContext = createContext<{
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}>({ ... });

export const useAuth = () => useContext(AuthContext);
```

### Sign Out

```ts
// src/shared/layout/UserMenu.tsx
const { error } = await supabase.auth.signOut();
```

Supabase clears the local JWT. `onAuthStateChange` fires and sets `session` to
`null`, which React Router uses to redirect back to `/signin`.

---

## 4. Database — Basic CRUD

All database operations use the `supabase.from('table_name')` pattern.

### Reading Data

```ts
// src/features/profile/api/profile.ts
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', id)
  .single(); // expects exactly one row; errors if none found
```

Use `.maybeSingle()` if the row might not exist (returns `null` instead of an
error):

```ts
// src/features/posts/api/posts.ts
const { data } = await supabase
  .from('likes')
  .select('post_id')
  .eq('user_id', currentUserId)
  .eq('post_id', id)
  .maybeSingle();
```

### Inserting Data

```ts
// src/features/posts/api/posts.ts
export function createPost(input: {
  content: string;
  image_url: string;
  author_id: string;
}) {
  return supabase.from('posts').insert(input);
}
```

```ts
// src/features/posts/api/comments.ts
export function addComment(postId: string, authorId: string, content: string) {
  return supabase
    .from('comments')
    .insert({ post_id: postId, author_id: authorId, content });
}
```

### Updating Data

```ts
// src/features/posts/api/posts.ts
export function updatePost(
  id: string,
  input: { content: string; image_url: string },
) {
  return supabase.from('posts').update(input).eq('id', id);
}
```

```ts
// src/features/profile/api/profile.ts
export function updateProfileFields(id: string, values: EditableProfileFields) {
  return supabase
    .from('profiles')
    .update({
      full_name: values.full_name || null,
      username: values.username || null,
      bio: values.bio || null,
      location: values.location || null,
    })
    .eq('id', id)
    .select() // return the updated row
    .single();
}
```

Mark a notification as read:

```ts
// src/features/notifications/hooks/useNotifications.ts
await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId);
```

### Deleting Data

```ts
// src/features/posts/api/posts.ts
export function deletePost(id: string) {
  return supabase.from('posts').delete().eq('id', id);
}
```

```ts
// src/features/posts/api/comments.ts
export function deleteComment(id: string, authorId: string) {
  return supabase
    .from('comments')
    .delete()
    .eq('id', id)
    .eq('author_id', authorId); // extra guard: only delete your own
}
```

---

## 5. Filtering, Ordering, and Limiting

```ts
// src/features/notifications/hooks/useNotifications.ts
const { data } = await supabase
  .from('notifications')
  .select(...)
  .eq('recipient_id', userId)        // WHERE recipient_id = userId
  .order('created_at', { ascending: false })  // ORDER BY created_at DESC
  .limit(30);                         // LIMIT 30
```

**Multiple filters on the same query:**

```ts
await supabase
  .from('comment_likes')
  .select('comment_id')
  .eq('user_id', currentUserId)
  .in('comment_id', commentIds); // WHERE comment_id IN (...)
```

**Case-insensitive text search with `.or()`:**

```ts
// src/features/search/api/search.ts
supabase
  .from('profiles')
  .select('id, full_name, username, avatar_url, bio')
  .or(`full_name.ilike.%${pattern}%,username.ilike.%${pattern}%`)
  .order('full_name', { ascending: true })
  .limit(limit);
```

**Exclude a row with `.neq()`:**

```ts
request = request.neq('id', excludeUserId);
```

---

## 6. Joins — Embedding Related Data

PostgREST (what Supabase's API is built on) lets you embed related rows inline
using foreign key relationships.

**Syntax:** `relation_name:foreign_table!constraint_name(columns)`

**Fetch a post with its author's profile:**

```ts
// src/features/posts/api/posts.ts
const POST_SELECT = `
  *,
  author:profiles!posts_author_id_fkey(id, full_name, username, avatar_url)
`;

const { data } = await supabase.from('posts').select(POST_SELECT);
// data[0].author.full_name ✓
```

**Fetch comments with their authors:**

```ts
// src/features/posts/api/comments.ts
const COMMENT_SELECT = `
  id, post_id, author_id, content, created_at, updated_at,
  author:profiles!comments_author_id_fkey(id, full_name, username, avatar_url),
  like_count:comment_likes(count)
`;
```

**Fetch messages with the sender's profile:**

```ts
// src/features/messages/api/messages.ts
const MESSAGE_SELECT = `
  id, conversation_id, sender_id, content, created_at,
  sender:profiles!messages_sender_id_fkey(id, full_name, username, avatar_url)
`;
```

**Fetch a follow list (followers or following) using two foreign keys to the
same table:**

```ts
// src/features/profile/api/follows.ts
// Followers: people who follow this profile
const relation = `follower:profiles!follows_follower_id_fkey(id, full_name, username, avatar_url)`;

// Following: people this profile follows
const relation = `following:profiles!follows_following_id_fkey(id, full_name, username, avatar_url)`;
```

When two foreign keys both point to the same table you must use the constraint
name (e.g. `follows_follower_id_fkey`) to disambiguate.

---

## 7. Aggregate Counts via Joins

You can use embedded relationships to count related rows without fetching them
all.

**Count likes and comments on posts:**

```ts
// src/features/posts/api/posts.ts
const POST_SELECT = `
  *,
  author:profiles!posts_author_id_fkey(id, full_name, username, avatar_url),
  like_count:likes(count),
  comment_count:comments(count)
`;
```

The result comes back as `[{ count: 5 }]` — extract it:

```ts
like_count: (raw.like_count as { count: number }[])[0]?.count ?? 0,
```

**Count followers and following on a profile:**

```ts
// src/features/profile/api/profile.ts
const { data } = await supabase
  .from('profiles')
  .select(
    `
    *,
    follower_count:follows!follows_following_id_fkey(count),
    following_count:follows!follows_follower_id_fkey(count)
  `,
  )
  .eq('id', id)
  .single();

const followerCount =
  (data.follower_count as { count: number }[])[0]?.count ?? 0;
```

**Count followers per user (in a list):**

```ts
// src/features/users/api/users.ts
supabase.from('profiles').select(`
    id, full_name, username, avatar_url, cover_url, bio,
    follower_count:follows!follows_following_id_fkey(count)
  `);
```

---

## 8. Storage — File Uploads

Supabase Storage is used for two types of files in this app:

- **Profile images** — avatars and cover photos (`avatars/`, `covers/` folders)
- **Post images** — images attached to posts (`posts/` folder)

All files go into a single bucket called `meet_images`.

### Upload a file

```ts
// src/features/posts/hooks/usePostComposer.ts
const filePath = `posts/${Date.now()}_${file.name}`;

const { error } = await supabase.storage
  .from('meet_images')
  .upload(filePath, file, { upsert: true }); // upsert: overwrite if exists
```

### Get the public URL

```ts
const {
  data: { publicUrl },
} = supabase.storage.from('meet_images').getPublicUrl(filePath);

// publicUrl is an https:// CDN link — store it in the database
```

### Upload a profile image and update the profile row

```ts
// src/features/profile/api/profile.ts
export async function uploadProfileImage(id, file, field) {
  const folder = field === 'avatar_url' ? 'avatars' : 'covers';
  const filePath = `${folder}/${id}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('meet_images')
    .upload(filePath, file, { upsert: true });

  if (uploadError) return { publicUrl: null, error: uploadError };

  const {
    data: { publicUrl },
  } = supabase.storage.from('meet_images').getPublicUrl(filePath);

  // Save the URL back to the profiles table
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ [field]: publicUrl })
    .eq('id', id);

  return { publicUrl, error: updateError };
}
```

### Storage RLS policies

Storage access is controlled by policies on `storage.objects`. Users can only
upload into their own folder (`avatars/<user-id>/`):

```sql
-- Anyone can read images publicly
create policy "avatars public read"
on storage.objects for select to public
using (
  bucket_id = 'meet_images'
  and (storage.foldername(name))[1] = 'avatars'
);

-- Only the owner can upload their avatar
create policy "avatars owner insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'meet_images'
  and (storage.foldername(name))[1] = 'avatars'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Post images: authenticated users can upload
create policy "posts images insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'meet_images'
  and (storage.foldername(name))[1] = 'posts'
);
```

---

## 9. Row Level Security (RLS)

RLS is Postgres's built-in access control. It automatically filters query
results based on the current user — even if the client sends a broad `select *`.

**Enable RLS on a table and add policies:**

```sql
alter table public.posts enable row level security;
-- With RLS on and no policies, no one can access the table.
-- You must add explicit policies.
```

Every policy has a `for` clause (SELECT / INSERT / UPDATE / DELETE) and a
`using`/`with check` expression evaluated per-row.

### profiles

```sql
alter table public.profiles enable row level security;

-- Everyone can read all profiles (search, posts, avatars)
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- A user can only insert their own profile row
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- A user can only update their own profile row
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

No DELETE policy — profile rows are tied to `auth.users` with `on delete cascade`.

### posts

```sql
alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Users can create their own posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = author_id);
```

### comments

```sql
alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Users can create their own comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Authors can update their comments"
  on public.comments for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Authors can delete their comments"
  on public.comments for delete
  using (auth.uid() = author_id);
```

### likes / comment_likes

Both tables use the same three-policy pattern. Shown for `likes`:

```sql
alter table public.likes enable row level security;

-- Needed for like counts and "liked by me" queries
create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

-- A user can only insert a like as themselves
create policy "Users can like as themselves"
  on public.likes for insert
  with check (auth.uid() = user_id);

-- A user can only delete their own like
create policy "Users can remove their own likes"
  on public.likes for delete
  using (auth.uid() = user_id);
```

`comment_likes` uses `to authenticated` (slightly stricter read):

```sql
alter table public.comment_likes enable row level security;

create policy "Authenticated users can read comment likes"
  on public.comment_likes for select to authenticated
  using (true);

create policy "Users can like comments"
  on public.comment_likes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can unlike their comment likes"
  on public.comment_likes for delete to authenticated
  using (auth.uid() = user_id);
```

### follows

```sql
alter table public.follows enable row level security;

create policy "follows read"
  on public.follows for select to authenticated
  using (true);

create policy "follows insert own"
  on public.follows for insert to authenticated
  with check (auth.uid() = follower_id);

create policy "follows delete own"
  on public.follows for delete to authenticated
  using (auth.uid() = follower_id);
```

### notifications

Rows are created only by server-side triggers (no client INSERT). Reads and
updates are scoped to the recipient only:

```sql
alter table public.notifications enable row level security;

create policy "Users can read their own notifications"
  on public.notifications for select to authenticated
  using (auth.uid() = recipient_id);

create policy "Users can update their own notifications"
  on public.notifications for update to authenticated
  using (auth.uid() = recipient_id);
```

### conversations / conversation_participants / messages

Messaging is private — only participants can see or send:

```sql
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- Helper function to avoid recursive RLS lookups
create or replace function public.is_conversation_participant(p_conversation_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = p_conversation_id
      and user_id = auth.uid()
  );
$$;

-- Only participants can see a conversation
create policy "conversations_select_participant"
  on public.conversations for select
  using (public.is_conversation_participant(id));

-- Only participants can see the participant rows
create policy "participants_select_own"
  on public.conversation_participants for select
  using (public.is_conversation_participant(conversation_id));

-- Only the participant can update their own row (e.g. last_read_at)
create policy "participants_update_own"
  on public.conversation_participants for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Only participants can read messages
create policy "messages_select_participant"
  on public.messages for select
  using (public.is_conversation_participant(conversation_id));

-- Only a participant can send as themselves
create policy "messages_insert_participant"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and public.is_conversation_participant(conversation_id)
  );
```

---

## 10. Database Triggers

Triggers run automatically on the Postgres server side when rows change.
This project uses them in two ways:

### Auto-create a profile on sign-up

When a new user registers, Supabase inserts a row into `auth.users`. This
trigger creates the matching `profiles` row automatically:

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Auto-create notifications on likes, comments, and follows

Each of these actions fires a `SECURITY DEFINER` trigger that inserts into
`notifications`. Example for post likes:

```sql
create or replace function public.notify_on_like()
returns trigger language plpgsql security definer set search_path = public
as $$
declare v_author uuid;
begin
  select author_id into v_author from public.posts where id = new.post_id;
  if v_author is not null and v_author <> new.user_id then
    insert into public.notifications
      (recipient_id, actor_id, type, post_id)
    values
      (v_author, new.user_id, 'like', new.post_id);
  end if;
  return new;
end;
$$;

create trigger on_post_liked
  after insert on public.likes
  for each row execute function public.notify_on_like();
```

Similar triggers exist for `comments` (type `'comment'`) and `follows`
(type `'follow'`).

### Bump conversation `updated_at` on new messages

The inbox sorts by most-recent activity. This trigger updates the parent
conversation whenever a new message arrives:

```sql
create or replace function public.touch_conversation_on_message()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  update public.conversations
    set updated_at = new.created_at
    where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation_on_message();
```

---

## 11. RPCs — Custom Server Functions

When the built-in PostgREST API is not enough (complex joins, atomic operations,
business logic), you write a `SECURITY DEFINER` SQL/PL/pgSQL function and call
it from the client with `supabase.rpc()`.

### `get_posts` — Home feed with liked-by-me

Returns the home feed for a user (posts from people they follow) with a
`liked_by_me` flag already computed:

```ts
// src/features/posts/api/posts.ts
export async function fetchPostsFeed(userId: string) {
  const { data, error } = await supabase.rpc('get_posts', {
    p_user_id: userId,
  });
  return (data as PostFromRPC[]) ?? [];
}
```

### `get_conversations` — Inbox with preview and unread count

Returns one row per conversation with the other user's profile, last message
preview, and unread count — all in one round-trip:

```ts
// src/features/messages/api/conversations.ts
export async function fetchConversations(userId: string) {
  const { data, error } = await supabase.rpc('get_conversations', {
    p_user_id: userId,
  });
  return ((data as ConversationRow[]) ?? []).map((row) => ({
    id: row.conversation_id,
    updated_at: row.updated_at,
    other_user: row.other_user,
    last_message: row.last_message,
    unread_count: Number(row.unread_count) || 0,
  }));
}
```

The SQL definition returns a `table(...)`:

```sql
create or replace function public.get_conversations(p_user_id uuid)
returns table (
  conversation_id uuid,
  updated_at timestamptz,
  other_user json,
  last_message json,
  unread_count bigint
)
language sql security definer stable set search_path = public
as $$
  select
    c.id as conversation_id,
    c.updated_at,
    json_build_object(
      'id', other_profile.id,
      'full_name', other_profile.full_name,
      'username', other_profile.username,
      'avatar_url', other_profile.avatar_url
    ) as other_user,
    (
      select json_build_object('content', m.content, 'created_at', m.created_at, 'sender_id', m.sender_id)
      from public.messages m
      where m.conversation_id = c.id
      order by m.created_at desc limit 1
    ) as last_message,
    (
      select count(*) from public.messages m
      where m.conversation_id = c.id
        and m.sender_id <> p_user_id
        and m.created_at > me.last_read_at
    ) as unread_count
  from public.conversations c
  join public.conversation_participants me
    on me.conversation_id = c.id and me.user_id = p_user_id
  join public.conversation_participants other
    on other.conversation_id = c.id and other.user_id <> p_user_id
  join public.profiles other_profile on other_profile.id = other.user_id
  order by c.updated_at desc;
$$;
```

### `get_or_create_conversation` — Atomic 1:1 conversation

Finds an existing direct conversation between two users, or creates one. Atomic
— no race conditions possible:

```ts
// src/features/messages/api/conversations.ts
export async function getOrCreateConversation(otherUserId: string) {
  const { data, error } = await supabase.rpc('get_or_create_conversation', {
    p_other_user_id: otherUserId,
  });
  return { conversationId: data as string, error };
}
```

```sql
create or replace function public.get_or_create_conversation(p_other_user_id uuid)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_conversation_id uuid;
begin
  if p_other_user_id = v_user_id then
    raise exception 'Cannot start a conversation with yourself';
  end if;

  -- Try to find an existing 1:1 conversation
  select cp.conversation_id into v_conversation_id
  from public.conversation_participants cp
  join public.conversation_participants other
    on other.conversation_id = cp.conversation_id
  where cp.user_id = v_user_id and other.user_id = p_other_user_id
  limit 1;

  if v_conversation_id is not null then
    return v_conversation_id;
  end if;

  -- Create a new conversation and add both participants
  insert into public.conversations default values returning id into v_conversation_id;
  insert into public.conversation_participants (conversation_id, user_id)
  values (v_conversation_id, v_user_id), (v_conversation_id, p_other_user_id);

  return v_conversation_id;
end;
$$;
```

### `mark_conversation_read` — Server-clock read marking

Sets `last_read_at` using `now()` on the server to avoid client/server clock
skew:

```ts
// src/features/messages/api/messages.ts
export function markConversationRead(conversationId: string) {
  return supabase.rpc('mark_conversation_read', {
    p_conversation_id: conversationId,
  });
}
```

```sql
create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns void language sql security definer set search_path = public
as $$
  update public.conversation_participants
    set last_read_at = now()
    where conversation_id = p_conversation_id
      and user_id = auth.uid();
$$;
```

---

## 12. Realtime — Live Subscriptions

Supabase Realtime broadcasts Postgres change events to the browser over a
WebSocket. You subscribe to a channel and react to INSERT / UPDATE / DELETE
events.

**Required setup (run in SQL Editor):**

```sql
-- Add the table to the realtime publication
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.messages;
```

### Notifications — subscribe to new inserts for the current user

```ts
// src/features/notifications/hooks/useNotifications.ts
const channel = supabase
  .channel(`notifications:${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `recipient_id=eq.${userId}`, // only my notifications
    },
    async (payload) => {
      const inserted = payload.new as NotificationRow;
      // Re-fetch the full row to include the joined actor profile
      const { data } = await supabase
        .from('notifications')
        .select(`..., ${ACTOR_SELECT}`)
        .eq('id', inserted.id)
        .single();
      setNotifications((prev) => [normalize(data), ...prev]);
    },
  )
  .subscribe();

// Always clean up the channel when the component unmounts
return () => supabase.removeChannel(channel);
```

The `filter` option (`recipient_id=eq.${userId}`) means the browser only
receives events for this specific user — no filtering needed in JS.

### Messages — subscribe to new messages in a conversation

```ts
// src/features/messages/hooks/useMessages.ts
const channel = supabase
  .channel(`messages:${conversationId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    },
    async (payload) => {
      const inserted = payload.new as { id: string };
      // Re-fetch full row to get the sender join
      const full = await fetchMessageById(inserted.id);
      if (!full) return;
      setMessages((prev) =>
        prev.some((m) => m.id === full.id) ? prev : [...prev, full],
      );
    },
  )
  .subscribe();
```

### Conversation list — refresh inbox on any new message

The inbox in `MessagesProvider` subscribes to all message INSERTs (no filter)
and refetches conversations via the `get_conversations` RPC on each one. RLS
ensures the RPC only returns conversations the current user participates in:

```ts
// src/app/providers/MessagesProvider.tsx
const channel = supabase
  .channel(`conversations:${userId}`)
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    () => load(false), // re-run get_conversations RPC
  )
  .subscribe();
```

### Pattern summary

| Hook               | Table           | Event  | Filter                                 |
| ------------------ | --------------- | ------ | -------------------------------------- |
| `useNotifications` | `notifications` | INSERT | `recipient_id=eq.${userId}`            |
| `useMessages`      | `messages`      | INSERT | `conversation_id=eq.${conversationId}` |
| `MessagesProvider` | `messages`      | INSERT | none (RPC handles scoping)             |

---

## 13. Full Schema Reference

All tables used in this project:

| Table                       | Key Columns                                                                                   | Purpose                               |
| --------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------- |
| `profiles`                  | `id` (= auth.users.id), `username`, `full_name`, `avatar_url`, `cover_url`, `bio`, `location` | One row per registered user           |
| `posts`                     | `id`, `author_id`, `content`, `image_url`, `created_at`, `updated_at`                         | User posts                            |
| `comments`                  | `id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`                           | Replies on posts                      |
| `likes`                     | `post_id`, `user_id` (composite PK)                                                           | Post likes (one per user per post)    |
| `comment_likes`             | `comment_id`, `user_id` (composite PK)                                                        | Comment likes                         |
| `follows`                   | `follower_id`, `following_id` (composite PK)                                                  | Follow relationships                  |
| `notifications`             | `id`, `recipient_id`, `actor_id`, `type`, `post_id`, `comment_id`, `is_read`                  | Like / comment / follow notifications |
| `conversations`             | `id`, `created_at`, `updated_at`                                                              | 1:1 message threads                   |
| `conversation_participants` | `conversation_id`, `user_id`, `last_read_at`                                                  | Who is in each thread                 |
| `messages`                  | `id`, `conversation_id`, `sender_id`, `content`, `created_at`                                 | Individual messages                   |

**Triggers:**

| Trigger                       | On                  | Does                             |
| ----------------------------- | ------------------- | -------------------------------- |
| `on_auth_user_created`        | `auth.users INSERT` | Creates a `profiles` row         |
| `on_post_liked`               | `likes INSERT`      | Creates a `like` notification    |
| `on_comment_added`            | `comments INSERT`   | Creates a `comment` notification |
| `on_followed`                 | `follows INSERT`    | Creates a `follow` notification  |
| `messages_touch_conversation` | `messages INSERT`   | Bumps `conversations.updated_at` |

**RPCs:**

| Function                                         | Type               | Purpose                                |
| ------------------------------------------------ | ------------------ | -------------------------------------- |
| `get_posts(p_user_id)`                           | `SECURITY DEFINER` | Feed posts with liked_by_me            |
| `get_conversations(p_user_id)`                   | `SECURITY DEFINER` | Inbox with preview + unread count      |
| `get_or_create_conversation(p_other_user_id)`    | `SECURITY DEFINER` | Find or atomically create a 1:1 thread |
| `mark_conversation_read(p_conversation_id)`      | `SECURITY DEFINER` | Update last_read_at with server clock  |
| `is_conversation_participant(p_conversation_id)` | Helper             | Used inside RLS policies               |
