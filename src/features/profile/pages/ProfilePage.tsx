import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { PostFromRPC } from '@/shared/types';
import EmptyState from '@/shared/components/EmptyState';
import LoadingPanel from '@/shared/components/LoadingPanel';
import { useAuth } from '@/features/auth/context/auth-context';
import CreatePostBox from '@/features/posts/components/CreatePostBox';
import PostComposer from '@/features/posts/components/PostComposer';
import DeleteConfirm from '@/features/posts/components/DeleteConfirm';
import { deletePost } from '@/features/posts/api/posts';
import ProfileHeader from '../components/ProfileHeader';
import ProfilePosts from '../components/ProfilePosts';
import EditProfileModal from '../components/EditProfileModal';
import FollowListModal from '../components/FollowListModal';
import { useProfile } from '../hooks/useProfile';
import { useProfilePosts } from '../hooks/useProfilePosts';
import { useFollow } from '../hooks/useFollow';
import type { FollowListType } from '../hooks/useFollowList';
import type { EditableProfileFields, ProfileImageField } from '../types';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { session, refreshProfile } = useAuth();
  const currentUserId = session?.user.id;
  const isMe = currentUserId === id;

  const {
    profile,
    loading,
    followerCount,
    followingCount,
    saving,
    uploadingField,
    updateProfile,
    uploadImage,
  } = useProfile(id);

  const {
    posts,
    loading: postsLoading,
    refetch: fetchPosts,
  } = useProfilePosts(id, currentUserId);

  const {
    isFollowing,
    followerCount: liveFollowerCount,
    followPending,
    toggleFollow,
  } = useFollow({ targetUserId: id, currentUserId, followerCount });

  const [composerOpen, setComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostFromRPC | null>(null);
  const [deletingPost, setDeletingPost] = useState<PostFromRPC | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [followListType, setFollowListType] = useState<FollowListType | null>(
    null,
  );

  const handleSave = async (values: EditableProfileFields) => {
    const ok = await updateProfile(values);
    if (ok) {
      setEditOpen(false);
      if (isMe) await refreshProfile();
    }
  };

  const handleUploadImage = async (file: File, field: ProfileImageField) => {
    await uploadImage(file, field);
    if (isMe) await refreshProfile();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPost) return;
    const { error } = await deletePost(deletingPost.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDeletingPost(null);
    toast.success('Post deleted successfully');
    fetchPosts();
  };

  if (loading) {
    return <LoadingPanel message="Loading profile…" />;
  }

  if (!profile) {
    return (
      <EmptyState>
        <p className="text-brand">Profile not found.</p>
        <Link to="/users" className="mt-2 inline-block text-sm text-accent">
          Browse people
        </Link>
      </EmptyState>
    );
  }

  const displayName = profile.full_name ?? profile.username ?? 'User';

  return (
    <div className="space-y-4">
      <ProfileHeader
        profile={profile}
        isMe={isMe}
        postsCount={posts.length}
        following={isFollowing}
        followPending={followPending}
        followerCount={liveFollowerCount}
        followingCount={followingCount}
        uploadingField={uploadingField}
        onToggleFollow={toggleFollow}
        onEditProfile={() => setEditOpen(true)}
        onUploadImage={handleUploadImage}
        onFollowersClick={() => setFollowListType('followers')}
        onFollowingClick={() => setFollowListType('following')}
      />

      {isMe && <CreatePostBox onOpen={() => setComposerOpen(true)} />}

      <ProfilePosts
        posts={posts}
        loading={postsLoading}
        isMe={isMe}
        emptyName={displayName.split(' ')[0]}
        onEdit={(post) => {
          setEditingPost(post);
          setComposerOpen(true);
        }}
        onDelete={setDeletingPost}
      />

      <PostComposer
        open={composerOpen}
        onClose={() => {
          setComposerOpen(false);
          setEditingPost(null);
        }}
        editingPost={editingPost}
        refetchPosts={fetchPosts}
      />
      <DeleteConfirm
        open={Boolean(deletingPost)}
        onClose={() => setDeletingPost(null)}
        onConfirm={handleDeleteConfirm}
      />

      <EditProfileModal
        key={editOpen ? 'edit-open' : 'edit-closed'}
        open={editOpen}
        profile={profile}
        saving={saving}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />

      {followListType && (
        <FollowListModal
          open
          onClose={() => setFollowListType(null)}
          profileId={profile.id}
          type={followListType}
          displayName={displayName}
        />
      )}
    </div>
  );
}
