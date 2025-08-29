
'use server';

/**
 * @fileOverview A conversational AI flow that can search for users.
 * 
 * - conversationalSearch - A function that handles the conversational search.
 * - ConversationalSearchInput - The input type for the conversationalSearch function.
 * - ConversationalSearchOutput - The return type for the conversationalSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { connectToUsersDatabase } from '@/lib/mongodb';

// Define the tool for searching users
const searchUsersTool = ai.defineTool(
    {
        name: 'searchUsers',
        description: 'Searches for users in the database by name or username.',
        inputSchema: z.object({
            query: z.string().describe('The name or username to search for.'),
        }),
        outputSchema: z.array(z.object({
            id: z.string(),
            username: z.string(),
            name: z.string(),
            avatar: z.string(),
        })),
    },
    async ({ query }) => {
        console.log(`AI searching for users with query: ${query}`);
        const db = await connectToUsersDatabase();
        const profilesCollection = db.collection('profiles');
        const regex = new RegExp(query, 'i');
        const users = await profilesCollection.find({
            $or: [{ username: { $regex: regex } }, { name: { $regex: regex } }],
        }).limit(5).toArray();

        return users.map(user => ({
            id: user._id.toString(),
            username: user.username,
            name: user.name,
            avatar: user.avatar,
        }));
    }
);


const ConversationalSearchInputSchema = z.object({
    history: z.array(z.object({
        role: z.enum(['user', 'model']),
        content: z.array(z.object({
            text: z.string().optional(),
            toolRequest: z.any().optional(),
            toolResponse: z.any().optional(),
        }))
    })).describe("The conversation history."),
    prompt: z.string().describe("The user's latest prompt."),
});
export type ConversationalSearchInput = z.infer<typeof ConversationalSearchInputSchema>;

// The output will be a stream, so we don't define a specific output schema for the flow itself
export async function conversationalSearch(input: ConversationalSearchInput) {

    const model = ai.getGenerator('gemini-1.5-flash');

    const history = input.history.map(msg => ({
        role: msg.role,
        content: msg.content.map(part => {
             if(part.text) return { text: part.text };
             if(part.toolRequest) return { toolRequest: part.toolRequest };
             if(part.toolResponse) return { toolResponse: part.toolResponse };
             return { text: '' };
        }).filter(Boolean)
    }));

    return model.generateStream({
        prompt: input.prompt,
        history,
        tools: [searchUsersTool],
        config: {
             safetySettings: [
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
              },
               {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
              }
            ],
        }
    });
}
