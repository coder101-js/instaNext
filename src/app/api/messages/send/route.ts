
import { NextRequest, NextResponse } from 'next/server';
import { connectToMessagesDatabase } from '@/lib/mongodb';
import { verify } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import type { Message } from '@/lib/data';

async function getUserIdFromToken(req: NextRequest): Promise<string | null> {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return null;
    try {
        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const senderId = await getUserIdFromToken(req);
        if (!senderId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { recipientId, text } = await req.json();
        if (!recipientId || !text) {
            return NextResponse.json({ message: 'Recipient and text are required' }, { status: 400 });
        }

        const messagesDb = await connectToMessagesDatabase();
        const conversationsCollection = messagesDb.collection('conversations');

        const participantIds = [senderId, recipientId].sort();

        const newMessage: Message = {
            id: new ObjectId().toString(),
            senderId,
            text,
            createdAt: new Date(),
        };

        const result = await conversationsCollection.findOneAndUpdate(
            { participantIds },
            {
                $push: { messages: newMessage },
                $set: { updatedAt: new Date() },
                $setOnInsert: { participantIds }
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );

        return NextResponse.json({ message: 'Message sent', newMessage }, { status: 201 });

    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
