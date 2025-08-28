
import { NextRequest, NextResponse } from 'next/server';
import { connectToUsersDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

// This is a simplified way to get the user ID. 
// In a real app, you'd have more robust session management.
async function getUserIdFromRequest(req: NextRequest) {
    try {
        const userCookie = cookies().get('insta-user');
        if (userCookie) {
            const user = JSON.parse(userCookie.value);
            return user.id;
        }
        return null;
    } catch (error) {
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

    const updateData: any = {
        profileSetupComplete: true,
    };
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (username !== undefined) updateData.username = username;
    if (hashtags !== undefined) updateData.hashtags = hashtags;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (Object.keys(updateData).length === 1) {
        return NextResponse.json({ message: 'No profile data provided to update.' }, { status: 400 });
    }
    
    const db = await connectToUsersDatabase();
    const profilesCollection = db.collection('profiles');
    
    const result = await profilesCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: updateData
      }
    );

    if (result.matchedCount === 0) {
        return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
