import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { PostFromRPC, Profile } from '../../types';
import { supabase } from '../../utils/supabase';
import type { EditableProfileFields, ProfileImageField } from './types';

interface UseProfileResult {
  profile: Profile | null;
  loading: boolean;
  posts: PostFromRPC[];
  postsLoading: boolean;
  saving: boolean;
  uploadingField: ProfileImageField | null;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  followPending: boolean;
  fetchPosts: () => Promise<void>;
  updateProfile: (values: EditableProfileFields) => Promise<boolean>;
  uploadImage: (file: File, field: ProfileImageField) => Promise<void>;
  toggleFollow: () => Promise<void>;
}

export function useProfile(
  id: string | undefined,
  currentUserId: string | undefined,
): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostFromRPC[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] =
    useState<ProfileImageField | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followPending, setFollowPending] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (!id) return;
    setPostsLoading(true);
    const [postsRes, likesRes] = await Promise.all([
      supabase
        .from('posts')
        .select(
          `*, author:profiles!posts_author_id_fkey(id, full_name, username, avatar_url),
          like_count:likes(count), comment_count:comments(count)`,
        )
        .eq('author_id', id)
        .order('created_at', { ascending: false }),
      currentUserId
        ? supabase.from('likes').select('post_id').eq('user_id', currentUserId)
        : Promise.resolve({ data: [] as { post_id: string }[], error: null }),
    ]);

    if (postsRes.error) console.error(postsRes.error);
    const myLikedIds = new Set((likesRes.data ?? []).map((l) => l.post_id));
    const mapped: PostFromRPC[] = (postsRes.data ?? []).map((post) => ({
      ...post,
      like_count:
        (post.like_count as unknown as { count: number }[])[0]?.count ?? 0,
      comment_count:
        (post.comment_count as unknown as { count: number }[])[0]?.count ?? 0,
      liked_by_me: myLikedIds.has(post.id),
    }));
    setPosts(mapped);
    setPostsLoading(false);
  }, [id, currentUserId]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const run = async () => {
      const [profileRes, followRes] = await Promise.all([
        supabase
          .from('profiles')
          .select(
            `*,
            follower_count:follows!follows_following_id_fkey(count),
            following_count:follows!follows_follower_id_fkey(count)`,
          )
          .eq('id', id)
          .single(),
        currentUserId && currentUserId !== id
          ? supabase
              .from('follows')
              .select('follower_id')
              .eq('follower_id', currentUserId)
              .eq('following_id', id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);
      if (cancelled) return;
      const { data, error } = profileRes;
      if (error) console.error(error);
      if (data) {
        setProfile(data as Profile);
        setFollowerCount(
          (data.follower_count as unknown as { count: number }[])[0]?.count ??
            0,
        );
        setFollowingCount(
          (data.following_count as unknown as { count: number }[])[0]?.count ??
            0,
        );
      }
      setIsFollowing(Boolean(followRes.data));
      setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [id, currentUserId]);

  useEffect(() => {
    fetchPosts(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchPosts]);

  const updateProfile = useCallback(
    async (values: EditableProfileFields): Promise<boolean> => {
      if (!id) return false;
      setSaving(true);
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name || null,
          username: values.username || null,
          bio: values.bio || null,
          location: values.location || null,
        })
        .eq('id', id)
        .select()
        .single();
      setSaving(false);
      if (error) {
        toast.error(error.message);
        return false;
      }
      setProfile(data as Profile);
      toast.success('Profile updated');
      return true;
    },
    [id],
  );

  const uploadImage = useCallback(
    async (file: File, field: ProfileImageField) => {
      if (!id) return;
      setUploadingField(field);
      const folder = field === 'avatar_url' ? 'avatars' : 'covers';
      const filePath = `${folder}/${id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('meet_images')
        .upload(filePath, file, { upsert: true });
      if (uploadError) {
        toast.error(uploadError.message);
        setUploadingField(null);
        return;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from('meet_images').getPublicUrl(filePath);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [field]: publicUrl })
        .eq('id', id);
      if (updateError) {
        toast.error(updateError.message);
        setUploadingField(null);
        return;
      }
      setProfile((p) => (p ? { ...p, [field]: publicUrl } : p));
      toast.success(
        field === 'avatar_url'
          ? 'Profile photo updated'
          : 'Cover photo updated',
      );
      setUploadingField(null);
    },
    [id],
  );

  const toggleFollow = useCallback(async () => {
    if (!currentUserId || !id || currentUserId === id || followPending) return;
    const next = !isFollowing;
    setIsFollowing(next);
    setFollowerCount((c) => Math.max(0, c + (next ? 1 : -1)));
    setFollowPending(true);
    const { error } = next
      ? await supabase
          .from('follows')
          .insert({ follower_id: currentUserId, following_id: id })
      : await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', id);
    setFollowPending(false);
    if (error) {
      setIsFollowing(!next);
      setFollowerCount((c) => Math.max(0, c + (next ? -1 : 1)));
      toast.error(error.message);
    }
  }, [currentUserId, id, isFollowing, followPending]);

  return {
    profile,
    loading,
    posts,
    postsLoading,
    saving,
    uploadingField,
    followerCount,
    followingCount,
    isFollowing,
    followPending,
    fetchPosts,
    updateProfile,
    uploadImage,
    toggleFollow,
  };
}
