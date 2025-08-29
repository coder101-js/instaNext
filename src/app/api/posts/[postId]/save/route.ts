
import { NextRequest, NextResponse } from 'next/server';
import { connectToUsersDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verify } from 'jsonwebtoken';

async function getUserIdFromToken(req: NextRequest): Promise<string | null> {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return null;
    }

    try {
        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
        return decoded.userId;
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
}

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;

    const db = await connectToUsersDatabase();
    const profiles = db.collection('profiles');

    const currentUser = await profiles.findOne({ _id: new ObjectId(userId) });

    if (!currentUser) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    if (!currentUser.saved) {
        currentUser.saved = [];
    }
    
    const isSaved = currentUser.saved.includes(postId);
    let updatedUser;

    if (isSaved) {
        // Unsave
        updatedUser = await profiles.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $pull: { saved: postId } },
            { returnDocument: 'after' }
        );
    } else {
        // Save
        updatedUser = await profiles.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $addToSet: { saved: postId } },
            { returnDocument: 'after' }
        );
    }
    
    if (!updatedUser) {
        return NextResponse.json({ message: 'Could not retrieve updated user' }, { status: 500 });
    }

    const { _id, ...userToReturn } = updatedUser;

    return NextResponse.json({ 
        message: isSaved ? 'Post unsaved' : 'Post saved',
        updatedUser: { id: _id.toString(), ...userToReturn }
     }, { status: 200 });

  } catch (error) {
    console.error('Toggle save error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
