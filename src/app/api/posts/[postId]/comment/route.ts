
import { NextRequest, NextResponse } from 'next/server';
import { connectToFeedDatabase } from '@/lib/mongodb';
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

async function getUsernameFromToken(req: NextRequest): Promise<string | null> {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return null;
    }

    try {
        const decoded = verify(token, process.env.JWT_SECRET!) as { username: string };
        return decoded.username;
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
}


export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const userId = await getUserIdFromToken(req);
    const username = await getUsernameFromToken(req);
    if (!userId || !username) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ message: 'Comment text is required' }, { status: 400 });
    }

    const db = await connectToFeedDatabase();
    const postsCollection = db.collection('posts');

    const newComment = {
      id: new ObjectId().toString(),
      userId,
      username,
      text,
      createdAt: new Date(),
    };

    const result = await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $push: { comments: { $each: [newComment], $position: 0 } } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Comment added', newComment }, { status: 201 });

  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
