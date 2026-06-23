import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { PostFromRPC } from '../types';
import CreatePostBox from '../components/post/CreatePostBox';
import PostComposer from '../components/post/PostComposer';
import DeleteConfirm from '../components/post/DeleteConfirm';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfilePosts from '../components/profile/ProfilePosts';
import EditProfileModal from '../components/profile/EditProfileModal';
import { useProfile } from '../components/profile/useProfile';
import type {
  EditableProfileFields,
  ProfileImageField,
} from '../components/profile/types';
import { useAuth } from '../context/auth-context';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { session, refreshProfile } = useAuth();
  const currentUserId = session?.user.id;
  const isMe = currentUserId === id;

  const {
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
  } = useProfile(id, currentUserId);

  const [composerOpen, setComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostFromRPC | null>(null);
  const [deletingPost, setDeletingPost] = useState<PostFromRPC | null>(null);
  const [editOpen, setEditOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-brand">Profile not found.</p>
        <Link to="/users" className="mt-2 inline-block text-sm text-accent">
          Browse people
        </Link>
      </div>
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
        followerCount={followerCount}
        followingCount={followingCount}
        uploadingField={uploadingField}
        onToggleFollow={toggleFollow}
        onEditProfile={() => setEditOpen(true)}
        onUploadImage={handleUploadImage}
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
        onRefetch={fetchPosts}
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
        onConfirm={() => setDeletingPost(null)}
      />

      <EditProfileModal
        key={editOpen ? 'edit-open' : 'edit-closed'}
        open={editOpen}
        profile={profile}
        saving={saving}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
