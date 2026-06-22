interface StatProps {
  label: string;
  value: number;
}

function Stat({ label, value }: StatProps) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-brand">{value.toLocaleString()}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

interface ProfileStatsProps {
  posts: number;
  followers: number;
  following: number;
}

export default function ProfileStats({
  posts,
  followers,
  following,
}: ProfileStatsProps) {
  return (
    <div className="mt-4 flex gap-8 border-t border-line pt-4">
      <Stat label="Posts" value={posts} />
      <Stat label="Followers" value={followers} />
      <Stat label="Following" value={following} />
    </div>
  );
}
