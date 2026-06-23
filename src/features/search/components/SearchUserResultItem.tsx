import type { SearchUserResult } from '@/shared/types';
import UserListRow from '@/shared/components/UserListRow';

interface SearchUserResultItemProps {
  user: SearchUserResult;
  onSelect?: () => void;
}

export default function SearchUserResultItem({
  user,
  onSelect,
}: SearchUserResultItemProps) {
  return (
    <UserListRow
      user={user}
      onClick={onSelect}
      bold
      showBio
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-50"
    />
  );
}
