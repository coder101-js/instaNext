
import { NextRequest, NextResponse } from 'next/server';
import { connectToAuthDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const db = await connectToAuthDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Don't send the password back
    const { password: _, ...userWithoutPassword } = user;
    
    // In a real app, you would fetch the full user profile from the users DB
    // For now, we will return a slimmed down user object
    const userToReturn = {
        id: user._id.toString(),
        username: user.username,
        name: user.username,
        email: user.email,
        avatar: `https://i.pravatar.cc/150?u=${user.email}`,
        bio: "InstaNext user",
        posts: [],
        followers: 0,
        following: 0,
        saved: [],
    }


    return NextResponse.json(userToReturn, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
