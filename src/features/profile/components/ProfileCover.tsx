import { useRef } from 'react';
import { CameraIcon } from '@/shared/ui/icons';
import { FALLBACK_COVER } from '../helpers';

interface ProfileCoverProps {
  coverUrl: string | null;
  editable: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
}

export default function ProfileCover({
  coverUrl,
  editable,
  uploading,
  onUpload,
}: ProfileCoverProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div className="relative h-44 w-full sm:h-56">
      <img
        src={coverUrl ?? FALLBACK_COVER}
        alt=""
        className="h-full w-full object-cover"
      />
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
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-900/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-brand-900/70 disabled:opacity-60"
          >
            <CameraIcon size={14} />
            {uploading ? 'Uploading…' : 'Change cover'}
          </button>
        </>
      )}
    </div>
  );
}
