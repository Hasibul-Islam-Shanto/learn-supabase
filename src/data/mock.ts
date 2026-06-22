import type { User } from '../types';

interface MockPost {
  id: string;
  authorId: string;
  text: string;
  image?: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
}

export const users: User[] = [
  {
    id: 'u1',
    name: 'John Carter',
    username: 'johncarter',
    avatar: 'https://i.pravatar.cc/150?img=12',
    cover:
      'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=1200&q=60',
    bio: 'Product designer. Coffee, mountains and clean interfaces.',
    location: 'San Francisco, CA',
    followers: 1280,
    following: 312,
    postsCount: 48,
  },
  {
    id: 'u2',
    name: 'Annalise Hane',
    username: 'annalise',
    avatar: 'https://i.pravatar.cc/150?img=45',
    cover:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=60',
    bio: 'Frontend engineer building delightful web apps.',
    location: 'Berlin, DE',
    followers: 842,
    following: 198,
    postsCount: 27,
  },
  {
    id: 'u3',
    name: 'Jaden Chance',
    username: 'jadenc',
    avatar: 'https://i.pravatar.cc/150?img=33',
    cover:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=60',
    bio: 'Photographer & traveler. Chasing golden hours.',
    location: 'Lisbon, PT',
    followers: 5310,
    following: 421,
    postsCount: 132,
  },
  {
    id: 'u4',
    name: 'Arezki Williams',
    username: 'arezki',
    avatar: 'https://i.pravatar.cc/150?img=53',
    cover:
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=60',
    bio: 'Indie maker. Shipping small useful things.',
    location: 'Paris, FR',
    followers: 670,
    following: 240,
    postsCount: 19,
  },
  {
    id: 'u5',
    name: 'Rose James',
    username: 'rosej',
    avatar: 'https://i.pravatar.cc/150?img=20',
    cover:
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&q=60',
    bio: 'Writer of small stories and big ideas.',
    location: 'London, UK',
    followers: 2104,
    following: 510,
    postsCount: 73,
  },
  {
    id: 'u6',
    name: 'Hamid Oskip',
    username: 'hamid',
    avatar: 'https://i.pravatar.cc/150?img=68',
    cover:
      'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1200&q=60',
    bio: 'Backend dev. Databases, coffee, repeat.',
    location: 'Toronto, CA',
    followers: 389,
    following: 144,
    postsCount: 12,
  },
  {
    id: 'u7',
    name: 'Serena Lewis',
    username: 'serena',
    avatar: 'https://i.pravatar.cc/150?img=49',
    cover:
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=60',
    bio: 'UX researcher. Curious about how people think.',
    location: 'Austin, TX',
    followers: 1530,
    following: 287,
    postsCount: 56,
  },
  {
    id: 'u8',
    name: 'April Sky',
    username: 'aprilsky',
    avatar: 'https://i.pravatar.cc/150?img=24',
    cover:
      'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1200&q=60',
    bio: 'Illustrator & doodler. Making the web a friendlier place.',
    location: 'Melbourne, AU',
    followers: 4012,
    following: 365,
    postsCount: 98,
  },
];

export const currentUser: User = users[0];

export const posts: MockPost[] = [
  {
    id: 'p1',
    authorId: 'u1',
    text: 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Spent the afternoon walking through golden fields.',
    image:
      'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=1000&q=60',
    createdAt: '4 hours ago',
    likes: 1200,
    comments: 200,
    shares: 17,
    liked: true,
  },
  {
    id: 'p2',
    authorId: 'u3',
    text: 'New shot from this morning. The light over the coast was unreal today.',
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000&q=60',
    createdAt: '6 hours ago',
    likes: 842,
    comments: 96,
    shares: 33,
  },
  {
    id: 'p3',
    authorId: 'u2',
    text: 'Shipping a little redesign today. Smaller shadows, softer corners, calmer colors. Less is more.',
    createdAt: 'Yesterday',
    likes: 318,
    comments: 41,
    shares: 6,
  },
  {
    id: 'p4',
    authorId: 'u5',
    text: 'Started a new short story this week. Here is the opening line I cannot stop tweaking.',
    image:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&q=60',
    createdAt: '2 days ago',
    likes: 540,
    comments: 88,
    shares: 12,
  },
  {
    id: 'p5',
    authorId: 'u8',
    text: 'Doodle of the day. Trying a warmer palette for a change.',
    image:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1000&q=60',
    createdAt: '3 days ago',
    likes: 2100,
    comments: 173,
    shares: 64,
  },
  {
    id: 'p6',
    authorId: 'u4',
    text: 'Weekend project: a tiny tool that turns notes into checklists. UI only so far, wiring it up next.',
    createdAt: '4 days ago',
    likes: 211,
    comments: 19,
    shares: 4,
  },
];

export function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getPostsByUser(id: string): MockPost[] {
  return posts.filter((p) => p.authorId === id);
}
