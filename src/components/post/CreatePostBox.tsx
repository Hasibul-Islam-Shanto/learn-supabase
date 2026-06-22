import Avatar from '../ui/Avatar';
import { currentUser } from '../../data/mock';
import { ImageIcon, SmileIcon, VideoIcon } from '../ui/icons';

interface CreatePostBoxProps {
  onOpen: () => void;
}

export default function CreatePostBox({ onOpen }: CreatePostBoxProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar src={currentUser.avatar} alt={currentUser.name} size={44} />
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 rounded-full bg-canvas px-4 py-3 text-left text-sm text-muted transition-colors hover:bg-brand-50"
        >
          What's on your mind, {currentUser.name.split(' ')[0]}?
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1 border-t border-line pt-3">
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-muted transition-colors hover:bg-brand-50"
        >
          <ImageIcon size={18} className="text-accent" /> Photo
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-muted transition-colors hover:bg-brand-50"
        >
          <VideoIcon size={18} className="text-brand" /> Video
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-muted transition-colors hover:bg-brand-50"
        >
          <SmileIcon size={18} className="text-amber-500" /> Feeling
        </button>
      </div>
    </div>
  );
}
