

import type { AdminUser, Post } from './data';

// --- MOCKED DATA ---

const MOCK_ADMIN_USERS: AdminUser[] = [
    { id: '1', email: 'chohan@example.com', isVerified: true, name: 'Abdullah C', username: 'chohanspace', avatar: 'https://i.pravatar.cc/150?u=chohanspace', followers: 1200, following: 150, postCount: 2, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), isPrivate: false },
    { id: '2', email: 'jane@example.com', isVerified: false, name: 'Jane Doe', username: 'janedoe', avatar: 'https://i.pravatar.cc/150?u=janedoe', followers: 500, following: 300, postCount: 1, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), isPrivate: false },
    { id: '3', email: 'bob@example.com', isVerified: false, name: 'Bob Smith', username: 'bobsmith', avatar: 'https://i.pravatar.cc/150?u=bobsmith', followers: 250, following: 400, postCount: 0, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), isPrivate: true },
];

const MOCK_POSTS: Post[] = [
    { id: '1', userId: '1', image: 'https://picsum.photos/600/600?random=1', caption: 'First post vibes! What a beautiful day.', likes: ['2', '3'], comments: [ { id: 'c1', userId: '2', username: 'janedoe', text: 'Love this!', createdAt: new Date() } ], createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), aiHint: 'nature landscape' },
    { id: '2', userId: '1', image: 'https://picsum.photos/600/600?random=2', caption: 'Working on some cool new stuff for InstaNext!', likes: ['2'], comments: [], createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), aiHint: 'tech code' },
    { id: '3', userId: '2', image: 'https://picsum.photos/600/600?random=3', caption: 'Exploring the hidden gems of the city. ✨', likes: ['1', '3'], comments: [ { id: 'c2', userId: '1', username: 'chohanspace', text: 'Looks amazing!', createdAt: new Date() } ], createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), aiHint: 'city travel' },
];


export async function getAdminUsers(): Promise<AdminUser[]> {
    console.log("MOCK: Fetching admin users");
    return MOCK_ADMIN_USERS;
}

export async function getPostsForUser(userId: string): Promise<Post[]> {
    console.log(`MOCK: Fetching posts for user ${userId}`);
    return MOCK_POSTS.filter(p => p.userId === userId);
}
