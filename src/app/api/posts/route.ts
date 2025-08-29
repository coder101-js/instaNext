
import { NextRequest, NextResponse } from 'next/server';
import { connectToFeedDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verify } from 'jsonwebtoken';

async function getUserIdFromToken(req: NextRequest): Promise<string | null> {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

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

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { image, caption, aiHint } = await req.json();
    if (!image || !caption) {
      return NextResponse.json({ message: 'Image and caption are required' }, { status: 400 });
    }

    const db = await connectToFeedDatabase();
    const postsCollection = db.collection('posts');

    const newPost = {
      userId,
      image,
      caption,
      aiHint,
      likes: [],
      comments: [],
      createdAt: new Date(),
    };

    const result = await postsCollection.insertOne(newPost);

    return NextResponse.json({ message: 'Post created successfully', postId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
