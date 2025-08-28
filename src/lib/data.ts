// This file is no longer the source of truth for data.
// It now defines types that are used across the application.
// Data fetching is handled by API routes.

export type User = {
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

// Mock data is kept for reference but is not used by the app anymore.
// API-like functions to fetch data
export const getUser = async (userId: string): Promise<User | undefined> => {
  // This will be replaced by an API call
  return undefined;
}

export const getUserByUsername = async (username: string): Promise<User | undefined> => {
   // This will be replaced by an API call
  return undefined;
}

export const getPost = async (postId: string): Promise<Post | undefined> => {
   // This will be replaced by an API call
  return undefined;
}

export const getPostsForUser = async (userId: string): Promise<Post[]> => {
  // This will be replaced by an API call
  return [];
}

export const getFeedPosts = async (): Promise<Post[]> => {
  // This will be replaced by an API call
  return [];
}

export const getSavedPosts = async (userId: string): Promise<Post[]> => {
  // This will be replaced by an API call
  return [];
}

export const getConversationsForUser = async (userId: string): Promise<Conversation[]> => {
    // This will be replaced by an API call
    return [];
}
