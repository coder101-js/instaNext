
'use server';

/**
 * @fileOverview A flow to send a password reset link to a user's email.
 * 
 * - sendPasswordReset - A function that generates and sends a password reset link.
 * - SendPasswordResetInput - The input type for the sendPasswordReset function.
 * - SendPasswordResetOutput - The return type for the sendPasswordReset function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as nodemailer from 'nodemailer';
import {sign} from 'jsonwebtoken';

const SendPasswordResetInputSchema = z.object({
  email: z.string().email().describe('The email address to send the reset link to.'),
});
export type SendPasswordResetInput = z.infer<typeof SendPasswordResetInputSchema>;

const SendPasswordResetOutputSchema = z.object({
  success: z.boolean(),
});
export type SendPasswordResetOutput = z.infer<typeof SendPasswordResetOutputSchema>;

export async function sendPasswordReset(input: SendPasswordResetInput): Promise<SendPasswordResetOutput> {
  return sendPasswordResetFlow(input);
}

const sendPasswordResetFlow = ai.defineFlow(
  {
    name: 'sendPasswordResetFlow',
    inputSchema: SendPasswordResetInputSchema,
    outputSchema: SendPasswordResetOutputSchema,
  },
  async ({ email }) => {
    
    // In a real app, first check if a user with this email exists in the database.
    
    const token = sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"InstaNext" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your InstaNext Password',
      text: `Click the link to reset your password: ${resetLink}`,
      html: `<p>Click the link to reset your password:</p><a href="${resetLink}">Reset Password</a>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email.');
    }
  }
);
