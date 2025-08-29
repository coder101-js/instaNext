
import { NextRequest, NextResponse } from 'next/server';
import { connectToUsersDatabase } from '@/lib/mongodb';
import { User } from '@/lib/data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || typeof query !== 'string' || query.length < 2) {
      return NextResponse.json([]);
    }

    const db = await connectToUsersDatabase();
    const profilesCollection = db.collection('profiles');

    // Create a case-insensitive regex for searching
    const regex = new RegExp(query, 'i');

    const users = await profilesCollection.find({
      $or: [
        { username: { $regex: regex } },
        { name: { $regex: regex } }
      ]
    }).limit(10).toArray();

    const serializedUsers = users.map(user => {
      const { _id, ...rest } = user;
      return { id: _id.toString(), ...rest } as User;
    });

    return NextResponse.json(serializedUsers, { status: 200 });

  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
