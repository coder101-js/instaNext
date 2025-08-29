
import { NextRequest, NextResponse } from 'next/server';
import { connectToFeedDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;

    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    const feedDb = await connectToFeedDatabase();
    const postsCollection = feedDb.collection('posts');

    const result = await postsCollection.deleteOne({ _id: new ObjectId(postId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

    