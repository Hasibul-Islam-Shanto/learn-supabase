import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/shared/lib/supabase';

interface UseToggleLikeOptions {
  table: 'likes' | 'comment_likes';
  column: 'post_id' | 'comment_id';
  targetId: string;
  userId?: string;
  initialLiked: boolean;
  initialCount: number;
  onChange?: (liked: boolean, count: number) => void;
}

export function useToggleLike({
  table,
  column,
  targetId,
  userId,
  initialLiked,
  initialCount,
  onChange,
}: UseToggleLikeOptions) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const syncKey = `${targetId}:${initialLiked}:${initialCount}`;
  const [prevSyncKey, setPrevSyncKey] = useState(syncKey);

  if (syncKey !== prevSyncKey) {
    setPrevSyncKey(syncKey);
    setLiked(initialLiked);
    setLikeCount(initialCount);
  }

  const toggle = async () => {
    if (!userId) return;
    const next = !liked;
    const nextCount = Math.max(0, likeCount + (next ? 1 : -1));
    setLiked(next);
    setLikeCount(nextCount);

    const { error } = next
      ? await supabase
          .from(table)
          .insert({ [column]: targetId, user_id: userId })
      : await supabase
          .from(table)
          .delete()
          .eq(column, targetId)
          .eq('user_id', userId);

    if (error) {
      setLiked(!next);
      setLikeCount((c) => Math.max(0, c + (next ? -1 : 1)));
      toast.error(error.message);
      return;
    }

    onChange?.(next, nextCount);
  };

  return { liked, likeCount, toggle };
}
