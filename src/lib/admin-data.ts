

import { connectToFeedDatabase, connectToUsersDatabase } from './mongodb';
import { ObjectId } from 'mongodb';
import type { AdminUser, Post, Comment } from './data';

// Helper to serialize MongoDB documents
const serializeObject = (obj: any) => {
    if (!obj) return null;
    const newObj = JSON.parse(JSON.stringify(obj));
    if (obj._id) {
        newObj.id = obj._id.toString();
        delete newObj._id;
    }
    return newObj;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
    try {
        const usersDb = await connectToUsersDatabase();
        const profilesCollection = usersDb.collection('profiles');
        
        const feedDb = await connectToFeedDatabase();
        const postsCollection = feedDb.collection('posts');

        const users = await profilesCollection.find({}).toArray();

        const usersWithPostCounts = await Promise.all(
            users.map(async (user) => {
                const postCount = await postsCollection.countDocuments({ userId: user._id.toString() });
                return {
                    id: user._id.toString(),
                    email: user.email,
                    isVerified: user.isVerified || false,
                    name: user.name,
                    username: user.username,
                    avatar: user.avatar,
                    followers: Array.isArray(user.followers) ? user.followers.length : 0,
                    following: Array.isArray(user.following) ? user.following.length : 0,
                    postCount,
                    createdAt: user._id.getTimestamp(),
                    isPrivate: user.isPrivate || false,
                };
            })
        );
        
        return usersWithPostCounts;
    } catch (error) {
        console.error("Error fetching admin users:", error);
        return [];
    }
}

export async function getPostsForUser(userId: string): Promise<Post[]> {
    try {
        const feedDb = await connectToFeedDatabase();
        const postsCollection = feedDb.collection('posts');

        const posts = await postsCollection.find({ userId }).sort({ createdAt: -1 }).toArray();

        return posts.map(serializeObject);

    } catch (error) {
        console.error(`Error fetching posts for user ${userId}:`, error);
        return [];
    }
}
