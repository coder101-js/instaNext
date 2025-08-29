
import { NextRequest, NextResponse } from 'next/server';
import { connectToMessagesDatabase, connectToUsersDatabase } from '@/lib/mongodb';
import { verify } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import type { User, Conversation } from '@/lib/data';

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

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const messagesDb = await connectToMessagesDatabase();
        const conversationsCollection = messagesDb.collection('conversations');

        const userConversations = await conversationsCollection
            .find({ participantIds: userId })
            .sort({ updatedAt: -1 })
            .toArray();

        if (userConversations.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const usersDb = await connectToUsersDatabase();
        const profilesCollection = usersDb.collection('profiles');
        
        const hydratedConversations = await Promise.all(
            userConversations.map(async (convo) => {
                const participantDetails = await profilesCollection.find({ 
                    _id: { $in: convo.participantIds.map((id: string) => new ObjectId(id)) }
                }).toArray();

                const participants = participantDetails.map(p => ({
                     id: p._id.toString(),
                     username: p.username,
                     name: p.name,
                     avatar: p.avatar,
                }));
                
                return {
                    id: convo._id.toString(),
                    participants,
                    messages: convo.messages,
                    updatedAt: convo.updatedAt,
                };
            })
        );
        
        return NextResponse.json(hydratedConversations, { status: 200 });

    } catch (error) {
        console.error('Fetch conversations error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
