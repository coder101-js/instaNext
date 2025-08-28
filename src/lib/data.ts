// Mock data for InstaNext

export type User = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  posts: string[];
  followers: number;
  following: number;
  saved: string[];
};

export type Post = {
  id: string;
  userId: string;
  image: string;
  caption: string;
  likes: string[]; // array of user ids
  comments: Comment[];
  createdAt: Date;
  aiHint?: string;
};

export type Comment = {
  id: string;
  userId: string;
  text: string;
  createdAt: Date;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
};

export type Conversation = {
  id: string;
  participants: string[]; // array of user ids
  messages: Message[];
};

// Users
export const users: User[] = [
  {
    id: 'user1',
    username: 'olivia_davis',
    name: 'Olivia Davis',
    avatar: 'https://picsum.photos/id/1027/100/100',
    bio: 'Photographer & Traveler. Capturing moments from around the world.',
    posts: ['post1', 'post2', 'post3'],
    followers: 1258,
    following: 320,
    saved: ['post4'],
  },
  {
    id: 'user2',
    username: 'liam_wilson',
    name: 'Liam Wilson',
    avatar: 'https://picsum.photos/id/1005/100/100',
    bio: 'Food enthusiast and home cook. Sharing my culinary adventures.',
    posts: ['post4'],
    followers: 850,
    following: 150,
    saved: [],
  },
   {
    id: 'user3',
    username: 'sophia_art',
    name: 'Sophia Miller',
    avatar: 'https://picsum.photos/id/1011/100/100',
    bio: 'Digital artist exploring the vibrant and surreal.',
    posts: ['post5', 'post6'],
    followers: 2300,
    following: 50,
    saved: ['post1', 'post2'],
  },
];

// Posts
export const posts: Post[] = [
  {
    id: 'post1',
    userId: 'user1',
    image: 'https://picsum.photos/id/10/600/600',
    aiHint: 'forest path',
    caption: 'Lost in the woods, finding my way. The beauty of nature is a true gift.',
    likes: ['user2', 'user3'],
    comments: [
      { id: 'c1', userId: 'user3', text: 'Stunning shot!', createdAt: new Date(Date.now() - 1000 * 60 * 5) },
      { id: 'c2', userId: 'user2', text: 'I love this path!', createdAt: new Date(Date.now() - 1000 * 60 * 10) },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'post2',
    userId: 'user1',
    image: 'https://picsum.photos/id/22/600/600',
    aiHint: 'coastal view',
    caption: 'Ocean breeze and salty air. Can’t get enough of this view!',
    likes: ['user3'],
    comments: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'post3',
    userId: 'user1',
    image: 'https://picsum.photos/id/24/600/600',
    aiHint: 'city street',
    caption: 'City lights and late night walks.',
    likes: ['user2'],
    comments: [
      { id: 'c3', userId: 'user2', text: 'Great photo!', createdAt: new Date(Date.now() - 1000 * 60 * 3) },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: 'post4',
    userId: 'user2',
    image: 'https://picsum.photos/id/42/600/600',
    aiHint: 'fresh pasta',
    caption: 'Homemade pasta for dinner tonight. There’s nothing better!',
    likes: ['user1', 'user3'],
    comments: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
   {
    id: 'post5',
    userId: 'user3',
    image: 'https://picsum.photos/id/119/600/600',
    aiHint: 'abstract art',
    caption: 'New digital piece, "Cosmic Dreams". What do you see?',
    likes: ['user1', 'user2'],
    comments: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: 'post6',
    userId: 'user3',
    image: 'https://picsum.photos/id/137/600/600',
    aiHint: 'geometric pattern',
    caption: 'Playing with shapes and colors.',
    likes: ['user1'],
    comments: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
];

// Messages and Conversations
export const conversations: Conversation[] = [
    {
        id: 'convo1',
        participants: ['user1', 'user2'],
        messages: [
            { id: 'm1', senderId: 'user1', text: 'Hey, loved your latest post!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
            { id: 'm2', senderId: 'user2', text: 'Thanks Olivia! I appreciate it.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
            { id: 'm3', senderId: 'user1', text: 'That pasta looked delicious. You should share the recipe sometime!', createdAt: new Date(Date.now() - 1000 * 60 * 30) },
        ],
    },
    {
        id: 'convo2',
        participants: ['user1', 'user3'],
        messages: [
            { id: 'm4', senderId: 'user3', text: 'Your travel photos are incredible.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
            { id: 'm5', senderId: 'user1', text: 'Thank you! Your art is amazing too.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) },
        ],
    },
]

// API-like functions to fetch data
export const getUser = async (userId: string): Promise<User | undefined> => {
  return users.find(u => u.id === userId);
}

export const getUserByUsername = async (username: string): Promise<User | undefined> => {
  return users.find(u => u.username === username);
}

export const getPost = async (postId: string): Promise<Post | undefined> => {
  return posts.find(p => p.id === postId);
}

export const getPostsForUser = async (userId: string): Promise<Post[]> => {
  return posts.filter(p => p.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const getFeedPosts = async (): Promise<Post[]> => {
  return [...posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const getSavedPosts = async (userId: string): Promise<Post[]> => {
  const user = await getUser(userId);
  if (!user) return [];
  const savedPostObjects = posts.filter(p => user.saved.includes(p.id));
  return savedPostObjects;
}

export const getConversationsForUser = async (userId: string): Promise<Conversation[]> => {
    return conversations.filter(c => c.participants.includes(userId));
}
