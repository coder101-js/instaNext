'use server';

import {conversationalSearch} from '@/ai/flows/conversational-search-flow';
import {NextRequest} from 'next/server';
import {stream} from '@genkit-ai/next';

export async function POST(req: NextRequest) {
  try {
    const {prompt, history} = await req.json();

    return stream(
      await conversationalSearch({
        prompt,
        history,
      })
    );
  } catch (e: any) {
    console.error('Error in chat API:', e);
    return new Response(JSON.stringify({error: e.message}), {
      status: 500,
      headers: {'Content-Type': 'application/json'},
    });
  }
}
