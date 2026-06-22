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
  fetchPosts: () => Promise<void>;
  updateProfile: (values: EditableProfileFields) => Promise<boolean>;
  uploadImage: (file: File, field: ProfileImageField) => Promise<void>;
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (cancelled) return;
      if (error) console.error(error);
      if (data) setProfile(data as Profile);
      setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

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

  return {
    profile,
    loading,
    posts,
    postsLoading,
    saving,
    uploadingField,
    fetchPosts,
    updateProfile,
    uploadImage,
  };
}
