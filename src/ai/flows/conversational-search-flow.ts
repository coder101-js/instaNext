'use server';
/**
 * @fileOverview A conversational search agent that can find users.
 *
 * - conversationalSearch - A function that handles the conversational search process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Message} from 'genkit/experimental/ai';

const SearchUsersInputSchema = z.object({
  query: z.string().describe('The search query for users, like a name or username.'),
});

const searchUsersTool = ai.defineTool(
  {
    name: 'searchUsers',
    description: 'Search for users by their name or username.',
    inputSchema: SearchUsersInputSchema,
    outputSchema: z.any(),
  },
  async ({query}) => {
    // In a real app, you'd fetch this from your API.
    // The API route /api/user/search is already available for this.
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/search?q=${query}`);
        if (!response.ok) {
            console.error("Failed to fetch users:", response.statusText);
            return [];
        }
        const users = await response.json();
        // We only need a subset of user data for the display card.
        return users.map((u: any) => ({
            id: u.id,
            username: u.username,
            name: u.name,
            avatar: u.avatar
        }));
    } catch (error) {
        console.error("Error in searchUsersTool:", error);
        return [];
    }
  }
);

const ConversationalSearchInputSchema = z.object({
  prompt: z.string(),
  history: z.array(Message.schema),
});

export async function conversationalSearch(
  input: z.infer<typeof ConversationalSearchInputSchema>
) {
  const llm = ai.getModel('googleai/gemini-2.5-flash');

  return llm.generate({
    ...input,
    tools: [searchUsersTool],
    system: `You are InstaNext AI, a helpful assistant integrated into a social media app.
             Your primary function is to help users find other users on the platform.
             When a user asks you to find someone, use the searchUsers tool.
             When presenting the results, do not just list the JSON. Introduce the results naturally. For example: "Sure, I found these users for you:".
             If you can't find anyone, say something like "I couldn't find any users matching that search."
             Be friendly and conversational.`,
  });
}
