
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

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;

    const db = await connectToFeedDatabase();
    const postsCollection = db.collection('posts');

    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    const isLiked = post.likes.includes(userId);
    let updatedPost;

    if (isLiked) {
      // Unlike
      const result = await postsCollection.findOneAndUpdate(
        { _id: new ObjectId(postId) },
        { $pull: { likes: userId } },
        { returnDocument: 'after' }
      );
      updatedPost = result;
    } else {
      // Like
      const result = await postsCollection.findOneAndUpdate(
        { _id: new ObjectId(postId) },
        { $addToSet: { likes: userId } },
        { returnDocument: 'after' }
      );
      updatedPost = result;
    }
    
    return NextResponse.json({ message: isLiked ? 'Post unliked' : 'Post liked', post: updatedPost }, { status: 200 });

  } catch (error) {
    console.error('Toggle like error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
