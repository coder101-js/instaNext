
import { NextRequest, NextResponse } from 'next/server';
import { connectToFeedDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

async function getUserIdFromRequest(req: NextRequest) {
    try {
        const userCookie = cookies().get('insta-user');
        if (userCookie) {
            const user = JSON.parse(userCookie.value);
            return user.id;
        }
        return null;
    } catch (error) {
        return null;
    }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
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
