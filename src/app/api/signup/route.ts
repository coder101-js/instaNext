
import { NextRequest, NextResponse } from 'next/server';
import { connectToAuthDatabase, connectToUsersDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { User } from '@/lib/data';

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json({ message: 'Email, username, and password are required' }, { status: 400 });
    }

    const authDb = await connectToAuthDatabase();
    const usersCollection = authDb.collection('users');

    const existingUser = await usersCollection.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
        let message = "User already exists.";
        if (existingUser.email === email) {
            message = "An account with this email already exists."
        } else if (existingUser.username === username) {
            message = "This username is already taken."
        }
      return NextResponse.json({ message }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await usersCollection.insertOne({
      email,
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });
    
    // Create user profile in the users database
    const usersDb = await connectToUsersDatabase();
    const profilesCollection = usersDb.collection('profiles');
    const newUserProfile: Omit<User, 'id'> = {
        username,
        name: username, // Default name to username
        email,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        bio: "",
        posts: [],
        followers: 0,
        following: 0,
        saved: [],
        profileSetupComplete: false, // New flag
    };

    await profilesCollection.insertOne({ _id: result.insertedId, ...newUserProfile });


    return NextResponse.json({ message: 'User created successfully', userId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
