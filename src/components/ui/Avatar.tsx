interface AvatarProps {
  src?: string | null;
  alt: string;
  name?: string;
  size?: number;
  ring?: boolean;
  online?: boolean;
}

function getInitials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Avatar({
  src,
  alt,
  name,
  size = 40,
  ring = false,
  online = false,
}: AvatarProps) {
  const ringClass = ring
    ? 'ring-2 ring-accent ring-offset-2 ring-offset-white'
    : '';

  return (
    <span className="relative inline-flex shrink-0">
      {src ? (
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          style={{ width: size, height: size }}
          className={`rounded-full bg-brand-100 object-cover ${ringClass}`}
        />
      ) : (
        <span
          aria-label={alt}
          style={{
            width: size,
            height: size,
            fontSize: Math.round(size * 0.4),
          }}
          className={`inline-flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand ${ringClass}`}
        >
          {getInitials(name ?? alt)}
        </span>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
      )}
    </span>
  );
}
