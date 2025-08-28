
import { NextRequest, NextResponse } from 'next/server';
import { connectToUsersDatabase } from '@/lib/mongodb';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

interface JwtPayload {
    id: string;
}

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

    const { name, bio } = await req.json();

    if (typeof name !== 'string' || typeof bio !== 'string') {
        return NextResponse.json({ message: 'Invalid name or bio' }, { status: 400 });
    }
    
    const db = await connectToUsersDatabase();
    const profilesCollection = db.collection('profiles');
    
    const result = await profilesCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
            name, 
            bio,
            profileSetupComplete: true // Mark as complete
        } 
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
