import { useRef } from 'react';
import Avatar from '../ui/Avatar';
import { CameraIcon } from '../ui/icons';

interface ProfileAvatarProps {
  src: string;
  alt: string;
  editable: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
}

export default function ProfileAvatar({
  src,
  alt,
  editable,
  uploading,
  onUpload,
}: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div className="relative inline-flex">
      <Avatar src={src} alt={alt} size={96} ring />
      {editable && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label="Change profile photo"
            className="absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-accent text-white shadow-sm transition hover:bg-accent-600 disabled:opacity-60"
          >
            {uploading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <CameraIcon size={15} />
            )}
          </button>
        </>
      )}
    </div>
  );
}
