interface AvatarProps {
  src: string
  alt: string
  size?: number
  ring?: boolean
  online?: boolean
}

export default function Avatar({
  src,
  alt,
  size = 40,
  ring = false,
  online = false,
}: AvatarProps) {
  return (
    <span className="relative inline-flex shrink-0">
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover bg-brand-100 ${
          ring ? 'ring-2 ring-accent ring-offset-2 ring-offset-white' : ''
        }`}
      />
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
      )}
    </span>
  )
}
