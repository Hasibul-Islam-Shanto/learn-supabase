import { useRef } from 'react';
import type { PostFromRPC } from '@/shared/types';
import Avatar from '@/shared/ui/Avatar';
import Button from '@/shared/ui/Button';
import Modal from '@/shared/ui/Modal';
import { ImageIcon } from '@/shared/ui/icons';
import { useAuth } from '@/features/auth/context/auth-context';
import { fallbackAvatar } from '@/features/profile/helpers';
import { usePostComposer } from '../hooks/usePostComposer';

interface PostComposerProps {
  open: boolean;
  onClose: () => void;
  editingPost?: PostFromRPC | null;
  refetchPosts: () => void;
}

export default function PostComposer({
  open,
  onClose,
  editingPost,
  refetchPosts,
}: PostComposerProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { session, profile } = useAuth();
  const displayName = profile?.full_name ?? profile?.username ?? 'there';
  const avatarSrc = profile?.avatar_url ?? fallbackAvatar(displayName);

  const {
    content,
    setContent,
    image,
    setImage,
    imageUploading,
    posting,
    isEditing,
    isFormValid,
    uploadImage,
    submit,
    reset,
  } = usePostComposer({
    editingPost,
    authorId: session?.user.id,
    onClose,
    refetchPosts,
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImage(file);
    e.target.value = '';
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit post' : 'Create post'}
      footer={
        <>
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={submit}
            disabled={posting || !isFormValid}
          >
            {posting ? 'Posting...' : isEditing ? 'Save changes' : 'Post'}
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <Avatar src={avatarSrc} alt={displayName} size={44} />
        <div>
          <p className="font-semibold text-brand">{displayName}</p>
          {profile?.username && (
            <p className="text-xs text-muted">@{profile.username}</p>
          )}
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder={`What's on your mind, ${displayName.split(' ')[0]}?`}
        className="mt-4 w-full resize-none rounded-xl bg-canvas p-3 text-[15px] text-brand placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        className="hidden"
        onChange={handleImageChange}
        disabled={imageUploading}
      />

      {image && (
        <div className="relative mt-3 overflow-hidden rounded-xl">
          <img src={image} alt="" className="max-h-64 w-full object-cover" />
          <button
            type="button"
            onClick={() => setImage('')}
            className="absolute right-2 top-2 rounded-full bg-brand-900/60 px-2.5 py-1 text-xs font-semibold text-white"
          >
            Remove
          </button>
        </div>
      )}

      {imageUploading && (
        <div className="mt-3 flex justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between rounded-xl border border-line px-4 py-2.5">
        <span className="text-sm font-medium text-brand">Add to your post</span>
        <button
          type="button"
          aria-label="Add photo"
          onClick={() => imageInputRef.current?.click()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-accent hover:bg-accent-50"
        >
          <ImageIcon />
        </button>
      </div>
    </Modal>
  );
}
