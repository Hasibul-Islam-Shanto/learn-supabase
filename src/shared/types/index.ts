export interface ProfileSummary {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at?: string | null;
  like_count: number;
  liked_by_me: boolean;
  author: ProfileSummary | null;
}

export interface PostFromRPC {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  like_count: number;
  liked_by_me: boolean | null;
  comment_count: number | null;
}

export interface DiscoverUser {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  follower_count: number;
  is_following: boolean;
}

export interface SearchUserResult {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export type NotificationType = 'like' | 'comment' | 'follow';

export interface AppNotification {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: NotificationType;
  post_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
  actor: ProfileSummary | null;
}
