import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Profile } from '@/shared/types';
import {
  fetchProfileWithCounts,
  updateProfileFields,
  uploadProfileImage,
} from '../api/profile';
import type { EditableProfileFields, ProfileImageField } from '../types';

export function useProfile(id: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] =
    useState<ProfileImageField | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const run = async () => {
      const result = await fetchProfileWithCounts(id);
      if (cancelled) return;
      if (result) {
        setProfile(result.profile);
        setFollowerCount(result.followerCount);
        setFollowingCount(result.followingCount);
      }
      setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const updateProfile = useCallback(
    async (values: EditableProfileFields): Promise<boolean> => {
      if (!id) return false;
      setSaving(true);
      const { data, error } = await updateProfileFields(id, values);
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
      const { publicUrl, error } = await uploadProfileImage(id, file, field);
      if (error) {
        toast.error(error.message);
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
    followerCount,
    followingCount,
    saving,
    uploadingField,
    updateProfile,
    uploadImage,
  };
}
