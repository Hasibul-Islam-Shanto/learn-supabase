import { useState } from 'react';
import toast from 'react-hot-toast';
import type { PostFromRPC } from '@/shared/types';
import { supabase } from '@/shared/lib/supabase';
import { createPost, updatePost } from '../api/posts';

interface UsePostComposerOptions {
  editingPost?: PostFromRPC | null;
  authorId?: string;
  onClose: () => void;
  refetchPosts: () => void;
}

export function usePostComposer({
  editingPost,
  authorId,
  onClose,
  refetchPosts,
}: UsePostComposerOptions) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const editingKey = editingPost?.id ?? 'new';
  const [prevEditingKey, setPrevEditingKey] = useState(editingKey);

  if (editingKey !== prevEditingKey) {
    setPrevEditingKey(editingKey);
    if (editingPost) {
      setContent(editingPost.content ?? '');
      setImage(editingPost.image_url ?? '');
    } else {
      setContent('');
      setImage('');
    }
  }

  const isEditing = editingPost != null;

  const reset = () => {
    setContent('');
    setImage('');
  };

  const uploadImage = async (file: File) => {
    setImageUploading(true);
    const filePath = `posts/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('meet_images')
      .upload(filePath, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      setImageUploading(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from('meet_images').getPublicUrl(filePath);
    setImage(publicUrl);
    setImageUploading(false);
  };

  const submit = async () => {
    if (content.trim().length === 0 && !image) return;
    setPosting(true);
    try {
      const { error } = isEditing
        ? await updatePost(editingPost.id, { content, image_url: image })
        : await createPost({
            content,
            image_url: image,
            author_id: authorId ?? '',
          });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(
        isEditing ? 'Post updated successfully' : 'Post created successfully',
      );
      refetchPosts();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setPosting(false);
      reset();
      onClose();
    }
  };

  const isFormValid = content.trim().length > 0 || Boolean(image);

  return {
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
  };
}
