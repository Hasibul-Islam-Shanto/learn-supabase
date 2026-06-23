import type { Profile } from '../../types';
import { LocationIcon } from '../ui/icons';
import ProfileActions from './ProfileActions';
import ProfileAvatar from './ProfileAvatar';
import ProfileCover from './ProfileCover';
import ProfileStats from './ProfileStats';
import { fallbackAvatar } from './helpers';
import type { ProfileImageField } from './types';

interface ProfileHeaderProps {
  profile: Profile;
  isMe: boolean;
  postsCount: number;
  following: boolean;
  followPending: boolean;
  followerCount: number;
  followingCount: number;
  uploadingField: ProfileImageField | null;
  onToggleFollow: () => void;
  onEditProfile: () => void;
  onUploadImage: (file: File, field: ProfileImageField) => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

export default function ProfileHeader({
  profile,
  isMe,
  postsCount,
  following,
  followPending,
  followerCount,
  followingCount,
  uploadingField,
  onToggleFollow,
  onEditProfile,
  onUploadImage,
  onFollowersClick,
  onFollowingClick,
}: ProfileHeaderProps) {
  const displayName = profile.full_name ?? profile.username ?? 'User';

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <ProfileCover
        coverUrl={profile.cover_url}
        editable={isMe}
        uploading={uploadingField === 'cover_url'}
        onUpload={(file) => onUploadImage(file, 'cover_url')}
      />

      <div className="px-4 pb-4 sm:px-6">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <ProfileAvatar
              src={profile.avatar_url ?? fallbackAvatar(displayName)}
              alt={displayName}
              editable={isMe}
              uploading={uploadingField === 'avatar_url'}
              onUpload={(file) => onUploadImage(file, 'avatar_url')}
            />
            <div className="pb-1">
              <h1 className="text-xl font-bold text-brand">{displayName}</h1>
              {profile.username && (
                <p className="text-sm text-muted">@{profile.username}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pb-1">
            <ProfileActions
              isMe={isMe}
              following={following}
              pending={followPending}
              onToggleFollow={onToggleFollow}
              onEdit={onEditProfile}
            />
          </div>
        </div>

        {profile.bio && (
          <p className="mt-4 max-w-xl text-sm text-brand-900">{profile.bio}</p>
        )}

        {profile.location && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
            <LocationIcon /> {profile.location}
          </p>
        )}

        <ProfileStats
          posts={postsCount}
          followers={followerCount}
          following={followingCount}
          onFollowersClick={onFollowersClick}
          onFollowingClick={onFollowingClick}
        />
      </div>
    </div>
  );
}
