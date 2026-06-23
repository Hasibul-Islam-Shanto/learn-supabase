interface UserListSkeletonProps {
  count?: number;
  avatarSize?: number;
  className?: string;
}

export default function UserListSkeleton({
  count = 5,
  avatarSize = 40,
  className = 'space-y-2.5',
}: UserListSkeletonProps) {
  return (
    <ul className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <li key={`skeleton-${i}`} className="flex items-center gap-3">
          <span
            style={{ width: avatarSize, height: avatarSize }}
            className="animate-pulse rounded-full bg-canvas"
          />
          <span className="h-3 w-32 animate-pulse rounded bg-canvas" />
        </li>
      ))}
    </ul>
  );
}
