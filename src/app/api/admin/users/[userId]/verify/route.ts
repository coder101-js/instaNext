
import { NextRequest, NextResponse } from 'next/server';
import { connectToUsersDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    const { isVerified } = await req.json();

    if (!userId || typeof isVerified !== 'boolean') {
      return NextResponse.json({ message: 'User ID and verification status are required' }, { status: 400 });
    }

    const usersDb = await connectToUsersDatabase();
    const profilesCollection = usersDb.collection('profiles');
    
    const result = await profilesCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isVerified } }
    );
    
    if (result.matchedCount === 0) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User verification status updated' }, { status: 200 });

  } catch (error) {
    console.error('Verify user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
