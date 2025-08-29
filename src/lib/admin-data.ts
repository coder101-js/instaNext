

import { connectToFeedDatabase, connectToUsersDatabase } from './mongodb';
import type { AdminUser, Post } from './data';
import { ObjectId } from 'mongodb';


export async function getAdminUsers(): Promise<AdminUser[]> {
    const usersDb = await connectToUsersDatabase();
    const profilesCollection = usersDb.collection('profiles');
    const feedDb = await connectToFeedDatabase();
    const postsCollection = feedDb.collection('posts');

    const users = await profilesCollection.find({}).toArray();

    const adminUsers = await Promise.all(users.map(async (user) => {
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
            postCount: postCount,
            createdAt: user._id.getTimestamp(),
            isPrivate: user.isPrivate || false,
        };
    }));

    return adminUsers;
}


export async function getPostsForUser(userId: string): Promise<Post[]> {
    const feedDb = await connectToFeedDatabase();
    const postsCollection = feedDb.collection('posts');
    const posts = await postsCollection.find({ userId: userId }).sort({ createdAt: -1 }).toArray();

    return posts.map(post => ({
        ...post,
        id: post._id.toString(),
        _id: post._id,
    })) as Post[];
}
