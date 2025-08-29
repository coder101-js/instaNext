
import { conversationalSearch } from '@/ai/flows/conversational-search-flow';
import { NextRequest, NextResponse } from 'next/server';
import { stream } from 'genkit/next';

export async function POST(req: NextRequest) {
  try {
    const { history, prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const searchStream = await conversationalSearch({ history: history || [], prompt });
    
    // Use the built-in Genkit stream helper for Next.js
    return stream(searchStream);

  } catch (error) {
    console.error('Error in conversational search:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
