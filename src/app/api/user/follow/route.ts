
import { NextRequest, NextResponse } from 'next/server';
import { connectToUsersDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function getUserIdFromRequest(req: NextRequest) {
    try {
        const userHeader = req.headers.get('x-user-payload');
        if (userHeader) {
            const user = JSON.parse(userHeader);
            return user.id;
        }
        return null;
    } catch (error) {
        return null;
    }
}

export async function POST(req: NextRequest) {
  try {
    const currentUserId = await getUserIdFromRequest(req);
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

    const isFollowing = currentUser.following.includes(userIdToFollow);

    if (isFollowing) {
        // Unfollow
        await profiles.updateOne(
            { _id: new ObjectId(currentUserId) },
            { $pull: { following: userIdToFollow }, $inc: { followingCount: -1 } }
        );
        await profiles.updateOne(
            { _id: new ObjectId(userIdToFollow) },
            { $pull: { followers: currentUserId }, $inc: { followerCount: -1 } }
        );
    } else {
        // Follow
        await profiles.updateOne(
            { _id: new ObjectId(currentUserId) },
            { $addToSet: { following: userIdToFollow }, $inc: { followingCount: 1 } }
        );
        await profiles.updateOne(
            { _id: new ObjectId(userIdToFollow) },
            { $addToSet: { followers: currentUserId }, $inc: { followerCount: 1 } }
        );
    }
    
    // Fetch the updated current user to return it
    const updatedCurrentUserDoc = await profiles.findOne({ _id: new ObjectId(currentUserId) });
    const { _id, ...updatedCurrentUser } = updatedCurrentUserDoc!;


    return NextResponse.json({ 
        message: isFollowing ? 'User unfollowed' : 'User followed',
        updatedCurrentUser: { id: _id.toString(), ...updatedCurrentUser }
     }, { status: 200 });

  } catch (error) {
    console.error('Follow user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
