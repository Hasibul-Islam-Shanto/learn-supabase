import Button from '../ui/Button';

interface ProfileActionsProps {
  isMe: boolean;
  following: boolean;
  onToggleFollow: () => void;
  onEdit: () => void;
}

export default function ProfileActions({
  isMe,
  following,
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
