
import { NextRequest, NextResponse } from 'next/server';
import { connectToFeedDatabase, connectToUsersDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const serializeObject = (obj: any) => {
    if (!obj) return null;
    const newObj = JSON.parse(JSON.stringify(obj));
    if (obj._id) {
        newObj.id = obj._id.toString();
        delete newObj._id;
    }
    return newObj;
};

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
};

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params;

    if (!username) {
      return NextResponse.json({ message: 'Username is required' }, { status: 400 });
    }

    const usersDb = await connectToUsersDatabase();
    const profilesCollection = usersDb.collection('profiles');
    const userDoc = await profilesCollection.findOne({ username });

    if (!userDoc) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = serializeUserForProfile(userDoc);
    
    const feedDb = await connectToFeedDatabase();
    const postsCollection = feedDb.collection('posts');
    
    // Fetch user posts
    const userPosts = await postsCollection.find({ userId: user.id }).sort({ createdAt: -1 }).toArray();

    // Fetch saved posts
    let savedPosts = [];
    if (userDoc.saved && userDoc.saved.length > 0) {
        const postIds = userDoc.saved.map((id: string) => new ObjectId(id));
        savedPosts = await postsCollection.find({ _id: { $in: postIds } }).sort({ createdAt: -1 }).toArray();
    }


    return NextResponse.json({
        user,
        posts: userPosts.map(serializeObject),
        savedPosts: savedPosts.map(serializeObject)
    }, { status: 200 });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
