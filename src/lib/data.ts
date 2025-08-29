
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
  profileSetupComplete: boolean;
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

const serializeObject = (obj: any) => {
    if (!obj) return null;
    const newObj = JSON.parse(JSON.stringify(obj, (key, value) => key === 'followers' || key === 'following' ? value.length : value ));
    if (obj._id) {
        newObj.id = obj._id.toString();
        delete newObj._id;
    }
    // ensure followers and following are arrays of strings (ids) for the client if needed, or counts
    if (obj.followers) newObj.followers = Array.isArray(obj.followers) ? obj.followers.map(String) : [];
    if (obj.following) newObj.following = Array.isArray(obj.following) ? obj.following.map(String) : [];

    return newObj;
}

const serializeUserForProfile = (user: any) => {
    if (!user) return null;
    const serialized = {
        ...user,
        id: user._id.toString(),
        followers: Array.isArray(user.followers) ? user.followers.length : (user.followers || 0),
        following: Array.isArray(user.following) ? user.following.length : (user.following || 0),
    };
    delete serialized._id;
    return serialized;
}


// API-like functions to fetch data
export const getUser = async (userId: string): Promise<User | null> => {
  if (!ObjectId.isValid(userId)) return null;
  const db = await connectToUsersDatabase();
  const user = await db.collection('profiles').findOne({ _id: new ObjectId(userId) });
  return serializeUserForProfile(user);
}

export const getUserByUsername = async (username: string): Promise<User | null> => {
   const db = await connectToUsersDatabase();
   const user = await db.collection('profiles').findOne({ username });
   return serializeUserForProfile(user);
}

export const getPost = async (postId: string): Promise<Post | null> => {
    if (!ObjectId.isValid(postId)) return null;
   const db = await connectToFeedDatabase();
   const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
   return serializeObject(post);
}

export const getPostsForUser = async (userId: string): Promise<Post[]> => {
  const db = await connectToFeedDatabase();
  const posts = await db.collection('posts').find({ userId }).sort({ createdAt: -1 }).toArray();
  return posts.map(serializeObject) as Post[];
}

export const getFeedPosts = async (): Promise<Post[]> => {
  const db = await connectToFeedDatabase();
  const posts = await db.collection('posts').find().sort({ createdAt: -1 }).limit(20).toArray();
  return posts.map(serializeObject) as Post[];
}

export const getSavedPosts = async (userId: string): Promise<Post[]> => {
  const db = await connectToUsersDatabase();
  const userDoc = await db.collection('profiles').findOne({_id: new ObjectId(userId)});

  if (!userDoc || !userDoc.saved || userDoc.saved.length === 0) return [];
  
  const feedDb = await connectToFeedDatabase();
  const postIds = userDoc.saved.map((id: string) => new ObjectId(id));
  const posts = await feedDb.collection('posts').find({ _id: { $in: postIds } }).sort({ createdAt: -1 }).toArray();
  
  return posts.map(serializeObject) as Post[];
}

export const getConversationsForUser = async (userId: string): Promise<Conversation[]> => {
    // This is still a mock, needs a real implementation
    return [];
}
