

import { ObjectId } from 'mongodb';


// This file is no longer the source of truth for data.
// It now defines types that are used across the application.
// Data fetching is handled by API routes.

export type User = {
  _id?: ObjectId;
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  posts: string[];
  followers: string[] | number; // Can be array of IDs or a count
  following: string[] | number; // Can be array of IDs or a count
  saved: string[];
  isVerified?: boolean;
  isPrivate?: boolean;
  isFollowingPrivate?: boolean;
};

export type Post = {
  _id?: ObjectId;
  id: string;
  userId: string;
  image: string;
  caption: string;
  likes: string[]; // array of user ids
  comments: Comment[];
  createdAt: Date;
  aiHint?: string;
  author?: User; // Optional author property
};

export type Comment = {
  id: string;
  userId: string;
  username: string;
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
  participants: User[]; // array of user objects
  messages: Message[];
  updatedAt: Date;
};

export type AdminUser = {
    id: string;
    email: string;
    isVerified: boolean;
    name: string;
    username: string;
    avatar: string;
    followers: number;
    following: number;
    postCount: number;
    createdAt: Date;
    isPrivate: boolean;
}


// --- MOCKED DATA ---

const MOCK_USERS: User[] = [
    { id: '1', username: 'chohanspace', name: 'Abdullah C', email: 'chohan@example.com', avatar: 'https://i.pravatar.cc/150?u=chohanspace', bio: 'Building the future, one line of code at a time. 🚀', posts: ['1', '2'], followers: ['2', '3'], following: ['2', '3'], saved: ['3'], isVerified: true, isPrivate: false },
    { id: '2', username: 'janedoe', name: 'Jane Doe', email: 'jane@example.com', avatar: 'https://i.pravatar.cc/150?u=janedoe', bio: 'Just a girl who loves to travel and take photos.', posts: ['3'], followers: ['1'], following: ['1', '3'], saved: [], isPrivate: false },
    { id: '3', username: 'bobsmith', name: 'Bob Smith', email: 'bob@example.com', avatar: 'https://i.pravatar.cc/150?u=bobsmith', bio: 'Foodie, dog lover, and part-time philosopher.', posts: [], followers: ['1', '2'], following: ['1', '2'], saved: [], isPrivate: true },
];

const MOCK_POSTS: Post[] = [
    { id: '1', userId: '1', image: 'https://picsum.photos/600/600?random=1', caption: 'First post vibes! What a beautiful day.', likes: ['2', '3'], comments: [ { id: 'c1', userId: '2', username: 'janedoe', text: 'Love this!', createdAt: new Date() } ], createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), aiHint: 'nature landscape' },
    { id: '2', userId: '1', image: 'https://picsum.photos/600/600?random=2', caption: 'Working on some cool new stuff for InstaNext!', likes: ['2'], comments: [], createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), aiHint: 'tech code' },
    { id: '3', userId: '2', image: 'https://picsum.photos/600/600?random=3', caption: 'Exploring the hidden gems of the city. ✨', likes: ['1', '3'], comments: [ { id: 'c2', userId: '1', username: 'chohanspace', text: 'Looks amazing!', createdAt: new Date() } ], createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), aiHint: 'city travel' },
];

// API-like functions to fetch data - these should only be used in server components or API routes
export const getUser = async (userId: string): Promise<User | null> => {
  console.log(`MOCK: Fetching user with ID: ${userId}`);
  return MOCK_USERS.find(u => u.id === userId) || null;
}

export const getFeedPosts = async (): Promise<Post[]> => {
  console.log("MOCK: Fetching feed posts");
  return MOCK_POSTS;
}
