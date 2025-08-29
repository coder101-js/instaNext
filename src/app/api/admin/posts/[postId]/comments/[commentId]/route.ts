
import { NextRequest, NextResponse } from 'next/server';
import { connectToFeedDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(req: NextRequest, { params }: { params: { postId: string, commentId: string } }) {
  try {
    const { postId, commentId } = params;

    if (!postId || !commentId) {
      return NextResponse.json({ message: 'Post ID and Comment ID are required' }, { status: 400 });
    }

    const feedDb = await connectToFeedDatabase();
    const postsCollection = feedDb.collection('posts');

    const result = await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $pull: { comments: { id: commentId } } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }
    if (result.modifiedCount === 0) {
        return NextResponse.json({ message: 'Comment not found on this post' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Comment deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
