import { supabase } from '@/shared/lib/supabase';
import type { Profile } from '@/shared/types';
import type { EditableProfileFields, ProfileImageField } from '../types';

export interface ProfileWithCounts {
  profile: Profile;
  followerCount: number;
  followingCount: number;
}

export async function fetchProfileWithCounts(
  id: string,
): Promise<ProfileWithCounts | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `*,
      follower_count:follows!follows_following_id_fkey(count),
      following_count:follows!follows_follower_id_fkey(count)`,
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }
  if (!data) return null;

  return {
    profile: data as Profile,
    followerCount:
      (data.follower_count as unknown as { count: number }[])[0]?.count ?? 0,
    followingCount:
      (data.following_count as unknown as { count: number }[])[0]?.count ?? 0,
  };
}

export async function fetchIsFollowing(
  currentUserId: string,
  profileId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', currentUserId)
    .eq('following_id', profileId)
    .maybeSingle();
  return Boolean(data);
}

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
    .select()
    .single();
}

export async function uploadProfileImage(
  id: string,
  file: File,
  field: ProfileImageField,
): Promise<{ publicUrl: string | null; error: { message: string } | null }> {
  const folder = field === 'avatar_url' ? 'avatars' : 'covers';
  const filePath = `${folder}/${id}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('meet_images')
    .upload(filePath, file, { upsert: true });
  if (uploadError) return { publicUrl: null, error: uploadError };

  const {
    data: { publicUrl },
  } = supabase.storage.from('meet_images').getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ [field]: publicUrl })
    .eq('id', id);
  if (updateError) return { publicUrl: null, error: updateError };

  return { publicUrl, error: null };
}
