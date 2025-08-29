
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear the admin-token cookie
    cookies().delete('admin-token');
    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
