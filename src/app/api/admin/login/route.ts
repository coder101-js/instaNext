
import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "abdullahchohan5pansy@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "abdullah36572515";
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = sign({ isAdmin: true, email }, JWT_SECRET, { expiresIn: '1d' });

      cookies().set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });

      return NextResponse.json({ message: 'Login successful' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
