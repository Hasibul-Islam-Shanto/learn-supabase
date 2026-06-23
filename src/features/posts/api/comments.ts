import { supabase } from '@/shared/lib/supabase';
import type { Comment } from '@/shared/types';

const COMMENT_SELECT = `id, post_id, author_id, content, created_at, updated_at,
  author:profiles!comments_author_id_fkey(id, full_name, username, avatar_url),
  like_count:comment_likes(count)`;

interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  author: Comment['author'];
  like_count: { count: number }[];
}

export async function fetchComments(
  postId: string,
  currentUserId?: string,
): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_SELECT)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    console.error(error);
    return [];
  }

  const rows = (data ?? []) as unknown as CommentRow[];
  const commentIds = rows.map((row) => row.id);

  let likedIds = new Set<string>();
  if (currentUserId && commentIds.length > 0) {
    const { data: likesData, error: likesError } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', currentUserId)
      .in('comment_id', commentIds);
    if (likesError) console.error(likesError);
    likedIds = new Set((likesData ?? []).map((l) => l.comment_id));
  }

  return rows.map((row) => ({
    id: row.id,
    post_id: row.post_id,
    author_id: row.author_id,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    like_count: row.like_count[0]?.count ?? 0,
    liked_by_me: likedIds.has(row.id),
    author: row.author,
  }));
}

export function addComment(postId: string, authorId: string, content: string) {
  return supabase
    .from('comments')
    .insert({ post_id: postId, author_id: authorId, content });
}

export function updateComment(
  id: string,
  authorId: string,
  content: string,
  updatedAt: string,
) {
  return supabase
    .from('comments')
    .update({ content, updated_at: updatedAt })
    .eq('id', id)
    .eq('author_id', authorId);
}

export function deleteComment(id: string, authorId: string) {
  return supabase
    .from('comments')
    .delete()
    .eq('id', id)
    .eq('author_id', authorId);
}
