import { useRef, useState } from "react";
import type { PostFromRPC } from "../../types";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { ImageIcon, SmileIcon, VideoIcon } from "../ui/icons";
import toast from "react-hot-toast";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../../context/auth-context";
import UserAvatar from "../common/user-avatar";

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
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [posting, setPosting] = useState<boolean>(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();
  const currentUser = session?.user;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const filePath = `posts/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("meet_images")
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast.error(uploadError.message);
      setImageUploading(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("meet_images").getPublicUrl(filePath);
    setImage(publicUrl);
    setImageUploading(false);
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (content.trim().length === 0 && !image) return;
    setPosting(true);
    try {
      const { error } = await supabase.from("posts").insert({
        content,
        image_url: image,
        author_id: currentUser.id,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Post created successfully");
      onClose();
      refetchPosts();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setPosting(false);
      setContent("");
      setImage("");
      onClose();
    }
  };

  const isFormValid = content.trim().length > 0 || image;
  const isEditing = Boolean(editingPost);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit post" : "Create post"}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              setContent("");
              setImage("");
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={handleSubmit}
            disabled={posting || !isFormValid}
          >
            {posting ? "Posting..." : isEditing ? "Save changes" : "Post"}
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <UserAvatar user={currentUser} />
        <div>
          <p className="font-semibold text-brand">
            {currentUser?.user_metadata?.name}
          </p>
          <p className="text-xs text-muted">Public</p>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder={`What's on your mind, ${currentUser?.user_metadata?.name?.split(" ")[0]}?`}
        className="mt-4 w-full resize-none rounded-xl bg-canvas p-3 text-[15px] text-brand placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        className="hidden"
        onChange={handleImageUpload}
        disabled={imageUploading}
      />

      {image && (
        <div className="relative mt-3 overflow-hidden rounded-xl">
          <img src={image} alt="" className="max-h-64 w-full object-cover" />
          <button
            type="button"
            onClick={() => setImage("")}
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
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Add photo"
            onClick={() => imageInputRef.current?.click()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-accent hover:bg-accent-50"
          >
            <ImageIcon />
          </button>
          <button
            type="button"
            aria-label="Add video"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand hover:bg-brand-50"
          >
            <VideoIcon />
          </button>
          <button
            type="button"
            aria-label="Add feeling"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-amber-500 hover:bg-amber-50"
          >
            <SmileIcon />
          </button>
        </div>
      </div>
    </Modal>
  );
}
