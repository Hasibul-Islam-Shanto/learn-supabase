export const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=1200&q=60';

export function fallbackAvatar(name: string | null): string {
  const n = encodeURIComponent(name ?? 'U');
  return `https://ui-avatars.com/api/?name=${n}&background=321847&color=fff&size=200`;
}
