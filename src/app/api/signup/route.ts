
import { NextRequest, NextResponse } from 'next/server';
import { connectToAuthDatabase, connectToUsersDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { User } from '@/lib/data';
import { sendNotification } from '@/ai/flows/send-notification-flow';

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json({ message: 'Email, username, and password are required' }, { status: 400 });
    }

    const authDb = await connectToAuthDatabase();
    const authCollection = authDb.collection('users');

    const existingAuthUser = await authCollection.findOne({
      $or: [{ email }, { username }],
    });

    if (existingAuthUser) {
        let message = "User already exists.";
        if (existingAuthUser.email === email) {
            message = "An account with this email already exists."
        } else if (existingAuthUser.username === username) {
            message = "This username is already taken."
        }
      return NextResponse.json({ message }, { status: 409 });
    }

    const usersDb = await connectToUsersDatabase();
    const profilesCollection = usersDb.collection('profiles');

    const existingProfile = await profilesCollection.findOne({
        $or: [{ email }, { username }],
    });

    if (existingProfile) {
        let message = "User already exists.";
        if (existingProfile.email === email) {
            message = "An account with this email already exists."
        } else if (existingProfile.username === username) {
            message = "This username is already taken."
        }
      return NextResponse.json({ message }, { status: 409 });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const authResult = await authCollection.insertOne({
      email,
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });
    
    const newUserProfile: Omit<User, 'id' | '_id'> = {
        username,
        name: username, // Default name to username
        email,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        bio: "",
        posts: [],
        followers: 0,
        following: 0,
        saved: [],
        profileSetupComplete: false, // User needs to complete profile setup
    };

    await profilesCollection.insertOne({ _id: authResult.insertedId, ...newUserProfile });
    
    await sendNotification({
        email,
        subject: 'Welcome to InstaNext!',
        textBody: 'Thank you for signing up for InstaNext. We are excited to have you on board.',
        htmlBody: '<h3>Welcome to InstaNext!</h3><p>Thank you for signing up. We are excited to have you on board.</p>',
    });

    return NextResponse.json({ message: 'User created successfully', userId: authResult.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
