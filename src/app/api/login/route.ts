
import { NextRequest, NextResponse } from 'next/server';
import { connectToAuthDatabase, connectToUsersDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const authDb = await connectToAuthDatabase();
    const usersCollection = authDb.collection('users');

    const authUser = await usersCollection.findOne({ email });

    if (!authUser) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, authUser.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Fetch the full user profile from the users DB
    const usersDb = await connectToUsersDatabase();
    const profilesCollection = usersDb.collection('profiles');
    const userProfile = await profilesCollection.findOne({ _id: authUser._id });

    if (!userProfile) {
        // This case should ideally not happen if signup is working correctly
        return NextResponse.json({ message: 'User profile not found.' }, { status: 404 });
    }
    
    const userToReturn = {
        id: userProfile._id.toString(),
        username: userProfile.username,
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.avatar,
        bio: userProfile.bio,
        posts: userProfile.posts,
        followers: userProfile.followers,
        following: userProfile.following,
        saved: userProfile.saved,
    }


    return NextResponse.json(userToReturn, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
