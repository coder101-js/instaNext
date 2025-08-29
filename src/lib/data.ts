

import { connectToFeedDatabase, connectToUsersDatabase } from './mongodb';
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
  participants: string[]; // array of user ids
  messages: Message[];
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


const serializeUserForProfile = (user: any): User | null => {
    if (!user) return null;
    const serialized = {
        ...user,
        id: user._id.toString(),
        followers: Array.isArray(user.followers) ? user.followers.length : (user.followers || 0),
        following: Array.isArray(user.following) ? user.following.length : (user.following || 0),
        isVerified: user.username === 'chohanspace',
    };
    delete serialized._id;
    return serialized as User;
}

const serializeObject = (obj: any) => {
    if (!obj) return null;
    const newObj = JSON.parse(JSON.stringify(obj));
    if (obj._id) {
        newObj.id = obj._id.toString();
        delete newObj._id;
    }
    return newObj;
}

// API-like functions to fetch data - these should only be used in server components or API routes
export const getUser = async (userId: string): Promise<User | null> => {
  if (!ObjectId.isValid(userId)) return null;
  const db = await connectToUsersDatabase();
  const user = await db.collection('profiles').findOne({ _id: new ObjectId(userId) });
  return serializeUserForProfile(user);
}

export const getFeedPosts = async (): Promise<Post[]> => {
  const db = await connectToFeedDatabase();
  const posts = await db.collection('posts').find().sort({ createdAt: -1 }).limit(20).toArray();
  return posts.map(serializeObject) as Post[];
}
