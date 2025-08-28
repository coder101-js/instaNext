
import { NextRequest, NextResponse } from 'next/server';
import { connectToAuthDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json({ message: 'Email, username, and password are required' }, { status: 400 });
    }

    const db = await connectToAuthDatabase();
    const usersCollection = db.collection('users');

    // Check if user already exists with the same email or username
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    const result = await usersCollection.insertOne({
      email,
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'User created successfully', userId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
