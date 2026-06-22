interface IconProps {
  size?: number;
  className?: string;
  filled?: boolean;
}

function base(size: number, className: string) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

export const HomeIcon = ({ size = 22, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);

export const UsersIcon = ({ size = 22, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const ProfileIcon = ({ size = 22, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const GroupsIcon = ({ size = 22, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18" />
  </svg>
);

export const SavedIcon = ({ size = 22, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
  </svg>
);

export const BellIcon = ({ size = 20, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const MessageIcon = ({ size = 20, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
  </svg>
);

export const SearchIcon = ({ size = 18, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const HeartIcon = ({ size = 20, className = '', filled }: IconProps) => (
  <svg {...base(size, className)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l1.7 1.7L12 21.5l7.1-7.1 1.7-1.7a5 5 0 0 0 0-7.1Z" />
  </svg>
);

export const CommentIcon = ({ size = 20, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
  </svg>
);

export const ShareIcon = ({ size = 20, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
  </svg>
);

export const MoreIcon = ({ size = 20, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

export const EditIcon = ({ size = 18, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const TrashIcon = ({ size = 18, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const ImageIcon = ({ size = 20, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

export const VideoIcon = ({ size = 20, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="m22 8-6 4 6 4V8Z" />
  </svg>
);

export const SmileIcon = ({ size = 20, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <path d="M9 9h.01M15 9h.01" />
  </svg>
);

export const PlusIcon = ({ size = 18, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CameraIcon = ({ size = 18, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2Z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const LocationIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const MailIcon = ({ size = 18, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const LockIcon = ({ size = 18, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export const SendIcon = ({ size = 18, className = '' }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22 11 13 2 9l20-7Z" />
  </svg>
);
