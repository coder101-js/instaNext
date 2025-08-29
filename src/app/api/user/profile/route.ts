
import { NextRequest, NextResponse } from 'next/server';
import { connectToAuthDatabase, connectToUsersDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// This is a simplified way to get the user ID. 
// In a real app, you'd have more robust session management.
async function getUserIdFromRequest(req: NextRequest) {
    try {
        // In a real app, you'd verify a session token (e.g., JWT) from the Authorization header.
        // For this demo, we are simulating getting the user from a custom header
        // because the client stores user info in localStorage, not cookies.
        const userHeader = req.headers.get('x-user-payload');
        if (userHeader) {
            const user = JSON.parse(userHeader);
            return user.id;
        }
        return null;
    } catch (error) {
        console.error("Error getting user from request:", error);
        return null;
    }
}


export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, bio, username, hashtags, avatar } = await req.json();

    const usersDb = await connectToUsersDatabase();
    const profilesCollection = usersDb.collection('profiles');
    const authDb = await connectToAuthDatabase();
    const authCollection = authDb.collection('users');
    
    const currentUser = await profilesCollection.findOne({ _id: new ObjectId(userId) });
    if (!currentUser) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (hashtags !== undefined) updateData.hashtags = hashtags;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Handle username update separately to check for uniqueness
    if (username !== undefined && username !== currentUser.username) {
        const existingUser = await profilesCollection.findOne({ username: username, _id: { $ne: new ObjectId(userId) } });
        if (existingUser) {
            return NextResponse.json({ message: 'Username is already taken.' }, { status: 409 });
        }
        updateData.username = username;
    }


    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'No profile data provided to update.' }, { status: 400 });
    }
    
    
    await profilesCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: updateData
      }
    );

    // If username was updated, also update it in the auth collection
    if (updateData.username) {
        await authCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { username: updateData.username } }
        );
    }
    
    // Fetch the updated user to return it
    const updatedUser = await profilesCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!updatedUser) {
        return NextResponse.json({ message: 'Could not retrieve updated user profile' }, { status: 404 });
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
    }


    return NextResponse.json(userToReturn, { status: 200 });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
