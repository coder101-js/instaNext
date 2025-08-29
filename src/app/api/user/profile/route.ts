

import { NextRequest, NextResponse } from 'next/server';
import { connectToAuthDatabase, connectToUsersDatabase } from '@/lib/mongodb';
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

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, bio, username, hashtags, avatar, isPrivate, isFollowingPrivate } = await req.json();

    const usersDb = await connectToUsersDatabase();
    const profilesCollection = usersDb.collection('profiles');
    
    const currentUser = await profilesCollection.findOne({ _id: new ObjectId(userId) });
    if (!currentUser) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (hashtags !== undefined) updateData.hashtags = hashtags;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
    if (isFollowingPrivate !== undefined) updateData.isFollowingPrivate = isFollowingPrivate;


    if (username && username !== currentUser.username) {
        const existingUser = await profilesCollection.findOne({ 
            username: username, 
            _id: { $ne: new ObjectId(userId) } 
        });
        if (existingUser) {
            return NextResponse.json({ message: 'Username is already taken.' }, { status: 409 });
        }
        updateData.username = username;
    }

    if (Object.keys(updateData).length === 0) {
        // Return current user if no data is provided to update
        const { _id, ...userToReturn } = currentUser;
        return NextResponse.json({ id: _id.toString(), ...userToReturn }, { status: 200 });
    }
    
    const result = await profilesCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    const updatedUser = result;

    if (!updatedUser) {
        return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
    }

    // If username was updated, also update it in the auth collection
    if (updateData.username) {
        const authDb = await connectToAuthDatabase();
        const authCollection = authDb.collection('users');
        await authCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { username: updateData.username } }
        );
    }
    
    const userToReturn = {
        id: updatedUser._id.toString(),
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        posts: updatedUser.posts || [],
        followers: updatedUser.followers || [],
        following: updatedUser.following || [],
        saved: updatedUser.saved || [],
        isPrivate: updatedUser.isPrivate,
        isFollowingPrivate: updatedUser.isFollowingPrivate
    };

    return NextResponse.json(userToReturn, { status: 200 });

  } catch (error) {
    console.error('Update profile error:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
