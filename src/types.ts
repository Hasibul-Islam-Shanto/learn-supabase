export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  cover: string;
  bio: string;
  location?: string;
  followers: number;
  following: number;
  postsCount: number;
}

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

export interface Post {
  id: string;
  author_id: string;
  content: string;
  image_url: string;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
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
