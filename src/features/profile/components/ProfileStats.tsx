interface StatProps {
  label: string;
  value: number;
  onClick?: () => void;
}

function Stat({ label, value, onClick }: StatProps) {
  const content = (
    <>
      <p className="text-lg font-bold text-brand">{value.toLocaleString()}</p>
      <p className="text-xs text-muted">{label}</p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-center transition-colors hover:text-brand"
      >
        {content}
      </button>
    );
  }

  return <div className="text-center">{content}</div>;
}

interface ProfileStatsProps {
  posts: number;
  followers: number;
  following: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

export default function ProfileStats({
  posts,
  followers,
  following,
  onFollowersClick,
  onFollowingClick,
}: ProfileStatsProps) {
  return (
    <div className="mt-4 flex gap-8 border-t border-line pt-4">
      <Stat label="Posts" value={posts} />
      <Stat label="Followers" value={followers} onClick={onFollowersClick} />
      <Stat label="Following" value={following} onClick={onFollowingClick} />
    </div>
  );
}
