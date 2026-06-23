import { supabase } from '@/shared/lib/supabase';
import type { PostFromRPC } from '@/shared/types';

const POST_SELECT = `*, author:profiles!posts_author_id_fkey(id, full_name, username, avatar_url),
  like_count:likes(count), comment_count:comments(count)`;

type RawCount = { count: number }[];

export function mapPostRow(
  raw: Record<string, unknown>,
  likedByMe: boolean,
): PostFromRPC {
  return {
    ...(raw as unknown as PostFromRPC),
    like_count: (raw.like_count as unknown as RawCount)[0]?.count ?? 0,
    comment_count: (raw.comment_count as unknown as RawCount)[0]?.count ?? 0,
    liked_by_me: likedByMe,
  };
}

export async function fetchPostsFeed(userId: string): Promise<PostFromRPC[]> {
  const { data, error } = await supabase.rpc('get_posts', {
    p_user_id: userId,
  });
  if (error) console.error(error);
  return (data as PostFromRPC[]) ?? [];
}

export async function fetchPostsByAuthor(
  authorId: string,
  currentUserId?: string,
): Promise<PostFromRPC[]> {
  const [postsRes, likesRes] = await Promise.all([
    supabase
      .from('posts')
      .select(POST_SELECT)
      .eq('author_id', authorId)
      .order('created_at', { ascending: false }),
    currentUserId
      ? supabase.from('likes').select('post_id').eq('user_id', currentUserId)
      : Promise.resolve({ data: [] as { post_id: string }[], error: null }),
  ]);

  if (postsRes.error) console.error(postsRes.error);
  const likedIds = new Set((likesRes.data ?? []).map((l) => l.post_id));
  return (postsRes.data ?? []).map((row) => {
    const record = row as Record<string, unknown>;
    return mapPostRow(record, likedIds.has(record.id as string));
  });
}

export async function fetchPostById(
  id: string,
  currentUserId?: string,
): Promise<PostFromRPC | null> {
  const [postRes, likedRes] = await Promise.all([
    supabase.from('posts').select(POST_SELECT).eq('id', id).maybeSingle(),
    currentUserId
      ? supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', currentUserId)
          .eq('post_id', id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (postRes.error) console.error(postRes.error);
  if (!postRes.data) return null;
  return mapPostRow(
    postRes.data as Record<string, unknown>,
    Boolean(likedRes.data),
  );
}

export function createPost(input: {
  content: string;
  image_url: string;
  author_id: string;
}) {
  return supabase.from('posts').insert(input);
}

export function updatePost(
  id: string,
  input: { content: string; image_url: string },
) {
  return supabase.from('posts').update(input).eq('id', id);
}

export function deletePost(id: string) {
  return supabase.from('posts').delete().eq('id', id);
}
