

import { NextRequest, NextResponse } from 'next/server';
import { connectToAuthDatabase, connectToFeedDatabase, connectToUsersDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // This is a highly destructive operation. We need to delete the user from all databases.
    const userObjectId = new ObjectId(userId);

    // 1. Delete from auth database
    const authDb = await connectToAuthDatabase();
    await authDb.collection('users').deleteOne({ _id: userObjectId });

    // 2. Delete from users (profiles) database
    const usersDb = await connectToUsersDatabase();
    await usersDb.collection('profiles').deleteOne({ _id: userObjectId });

    // 3. Delete user's posts and comments from feed database
    const feedDb = await connectToFeedDatabase();
    await feedDb.collection('posts').deleteMany({ userId: userId });
    
    // 4. Remove user's comments and likes from other posts (optional, but good for cleanup)
    await feedDb.collection('posts').updateMany(
      { "comments.userId": userId },
      { $pull: { comments: { userId: userId } } }
    );
     await feedDb.collection('posts').updateMany(
      { likes: userId },
      { $pull: { likes: userId } }
    );
    
    // 5. Remove user from other users' followers/following lists
    await usersDb.collection('profiles').updateMany(
        { following: userId },
        { $pull: { following: userId }}
    );
    await usersDb.collection('profiles').updateMany(
        { followers: userId },
        { $pull: { followers: userId }}
    );


    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    const body = await req.json();

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const usersDb = await connectToUsersDatabase();
    const profilesCollection = usersDb.collection('profiles');
    
    // Construct the update object from the request body
    const updateData: Record<string, any> = {};
    if (body.followers !== undefined) updateData.followers = Array(body.followers).fill('dummy_id');
    if (body.following !== undefined) updateData.following = Array(body.following).fill('dummy_id');

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }
    
    const result = await profilesCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User stats updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Update user stats error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
