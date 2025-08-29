

import { connectToFeedDatabase, connectToUsersDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

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


// --- DATA FETCHING FUNCTIONS ---
// These are used by server components to get data for rendering.

export async function getUser(userId: string): Promise<User | null> {
    try {
        const usersDb = await connectToUsersDatabase();
        const userDoc = await usersDb.collection('profiles').findOne({ _id: new ObjectId(userId) });
        if (!userDoc) {
            return null;
        }
        const { _id, ...userData } = userDoc;
        return { id: _id.toString(), ...userData } as User;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null; // Return null on error
    }
}

export async function getFeedPosts(): Promise<Post[]> {
    try {
        const feedDb = await connectToFeedDatabase();
        const postDocs = await feedDb.collection('posts').find().sort({ createdAt: -1 }).limit(20).toArray();
        
        return postDocs.map(doc => {
            const { _id, ...postData } = doc;
            return { id: _id.toString(), ...postData };
        }) as Post[];
    } catch (error) {
        console.error("Error fetching feed posts:", error);
        return []; // Return empty array on error
    }
}
