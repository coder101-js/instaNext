'use server';

import {chat} from '@/ai/flows/chat-flow';
import {NextRequest, NextResponse} from 'next/server';
import {stream} from '@genkit-ai/next/server';

export async function POST(req: NextRequest) {
  try {
    const {messages} = await req.json();
    return stream(chat(messages));
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {error: 'An unexpected error occurred.'},
      {status: 500}
    );
  }
}
