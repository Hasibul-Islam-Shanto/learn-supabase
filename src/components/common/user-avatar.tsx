import type { User } from "@supabase/supabase-js";
import Avatar from "../ui/Avatar";

function displayName(user: User): string {
  return (
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Account"
  );
}

function avatarUrl(user: User): string {
  const fromMeta = user.user_metadata?.avatar_url as string | undefined;
  if (fromMeta) return fromMeta;
  const name = encodeURIComponent(displayName(user));
  return `https://ui-avatars.com/api/?name=${name}&background=321847&color=fff`;
}

const UserAvatar = ({ user }: { user: User }) => {
  return <Avatar src={avatarUrl(user)} alt={user.email ?? displayName(user)} size={38} />;
};

export default UserAvatar;
