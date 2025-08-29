
'use server';
/**
 * @fileOverview A conversational AI flow for general chat.
 *
 * - chat - A function that handles the chat process.
 * - Message - The type for a message in the conversation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Message as GenkitMessage} from 'genkit/ai';

export const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.object({text: z.string()})),
});

export type Message = z.infer<typeof MessageSchema>;

const ChatInputSchema = z.array(MessageSchema);

export const chat = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async messages => {
    const history: GenkitMessage[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      history,
      prompt: 'Continue the conversation.',
      config: {
        // You can adjust temperature for more creative responses
        temperature: 0.7,
      },
    });

    return llmResponse.text;
  }
);
