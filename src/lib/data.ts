import { connectToFeedDatabase, connectToUsersDatabase } from './mongodb';
import { ObjectId } from 'mongodb';


// This file is no longer the source of truth for data.
// It now defines types that are used across the application.
// Data fetching is handled by API routes.

export type User = {
  _id: ObjectId;
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  posts: string[];
  followers: number;
  following: number;
  saved: string[];
  profileSetupComplete: boolean;
};

export type Post = {
  _id: ObjectId;
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

// API-like functions to fetch data
export const getUser = async (userId: string): Promise<User | null> => {
  if (!ObjectId.isValid(userId)) return null;
  const db = await connectToUsersDatabase();
  const user = await db.collection('profiles').findOne({ _id: new ObjectId(userId) });
  if (user) {
    return { ...user, id: user._id.toString() } as User;
  }
  return null;
}

export const getUserByUsername = async (username: string): Promise<User | null> => {
   const db = await connectToUsersDatabase();
   const user = await db.collection('profiles').findOne({ username });
   if (user) {
    return { ...user, id: user._id.toString() } as User;
  }
   return null;
}

export const getPost = async (postId: string): Promise<Post | null> => {
    if (!ObjectId.isValid(postId)) return null;
   const db = await connectToFeedDatabase();
   const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
   if (post) {
    return { ...post, id: post._id.toString() } as Post;
  }
   return null;
}

export const getPostsForUser = async (userId: string): Promise<Post[]> => {
  const db = await connectToFeedDatabase();
  const posts = await db.collection('posts').find({ userId }).sort({ createdAt: -1 }).toArray();
  return posts.map(p => ({ ...p, id: p._id.toString() })) as Post[];
}

export const getFeedPosts = async (): Promise<Post[]> => {
  const db = await connectToFeedDatabase();
  const posts = await db.collection('posts').find().sort({ createdAt: -1 }).limit(20).toArray();
  return posts.map(p => ({ ...p, id: p._id.toString() })) as Post[];
}

export const getSavedPosts = async (userId: string): Promise<Post[]> => {
  const user = await getUser(userId);
  if (!user || user.saved.length === 0) return [];
  
  const db = await connectToFeedDatabase();
  const postIds = user.saved.map(id => new ObjectId(id));
  const posts = await db.collection('posts').find({ _id: { $in: postIds } }).sort({ createdAt: -1 }).toArray();
  
  return posts.map(p => ({ ...p, id: p._id.toString() })) as Post[];
}

export const getConversationsForUser = async (userId: string): Promise<Conversation[]> => {
    // This is still a mock, needs a real implementation
    return [];
}
