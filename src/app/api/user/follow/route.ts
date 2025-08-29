
import { NextRequest, NextResponse } from 'next/server';
import { connectToUsersDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verify } from 'jsonwebtoken';

async function getUserIdFromToken(req: NextRequest): Promise<string | null> {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return null;
    }

    try {
        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
        return decoded.userId;
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
}


export async function POST(req: NextRequest) {
  try {
    const currentUserId = await getUserIdFromToken(req);
    if (!currentUserId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userIdToFollow } = await req.json();
    if (!userIdToFollow) {
      return NextResponse.json({ message: 'User to follow is required' }, { status: 400 });
    }

    if (currentUserId === userIdToFollow) {
        return NextResponse.json({ message: 'You cannot follow yourself' }, { status: 400 });
    }

    const db = await connectToUsersDatabase();
    const profiles = db.collection('profiles');

    const currentUser = await profiles.findOne({ _id: new ObjectId(currentUserId) });
    const userToFollow = await profiles.findOne({ _id: new ObjectId(userIdToFollow) });

    if (!currentUser || !userToFollow) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Ensure following array exists
    if (!currentUser.following) {
        currentUser.following = [];
    }

    const isFollowing = currentUser.following.includes(userIdToFollow);

    if (isFollowing) {
        // Unfollow
        await profiles.updateOne(
            { _id: new ObjectId(currentUserId) },
            { $pull: { following: userIdToFollow } }
        );
        await profiles.updateOne(
            { _id: new ObjectId(userIdToFollow) },
            { $pull: { followers: currentUserId } }
        );
    } else {
        // Follow
        await profiles.updateOne(
            { _id: new ObjectId(currentUserId) },
            { $addToSet: { following: userIdToFollow } }
        );
        await profiles.updateOne(
            { _id: new ObjectId(userIdToFollow) },
            { $addToSet: { followers: currentUserId } }
        );
    }
    
    const updatedCurrentUserDoc = await profiles.findOne({ _id: new ObjectId(currentUserId) });
    
    if (!updatedCurrentUserDoc) {
        return NextResponse.json({ message: 'Could not retrieve updated user' }, { status: 500 });
    }

    const { _id, password, ...updatedCurrentUserData } = updatedCurrentUserDoc;

    return NextResponse.json({ 
        message: isFollowing ? 'User unfollowed' : 'User followed',
        updatedCurrentUser: { id: _id.toString(), ...updatedCurrentUserData }
     }, { status: 200 });

  } catch (error) {
    console.error('Follow user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
