
import { NextRequest, NextResponse } from 'next/server';
import { connectToAuthDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { verify } from 'jsonwebtoken';

interface JwtPayload {
    email: string;
}

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Token and password are required' }, { status: 400 });
    }
    
    let decoded: JwtPayload;
    try {
        decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (e) {
        return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }
    
    const { email } = decoded;

    const db = await connectToAuthDatabase();
    const usersCollection = db.collection('users');

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await usersCollection.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
