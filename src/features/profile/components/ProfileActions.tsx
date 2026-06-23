import Button from '@/shared/ui/Button';

interface ProfileActionsProps {
  isMe: boolean;
  following: boolean;
  pending?: boolean;
  onToggleFollow: () => void;
  onEdit: () => void;
}

export default function ProfileActions({
  isMe,
  following,
  pending = false,
  onToggleFollow,
  onEdit,
}: ProfileActionsProps) {
  if (isMe) {
    return (
      <Button variant="outline" size="sm" onClick={onEdit}>
        Edit profile
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={following ? 'outline' : 'accent'}
        size="sm"
        disabled={pending}
        onClick={onToggleFollow}
      >
        {following ? 'Following' : 'Follow'}
      </Button>
      <Button variant="outline" size="sm">
        Message
      </Button>
    </>
  );
}
