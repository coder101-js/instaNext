'use server';

/**
 * @fileOverview A generic flow to send email notifications.
 *
 * - sendNotification - A function that sends an email.
 * - SendNotificationInput - The input type for the sendNotification function.
 * - SendNotificationOutput - The return type for the sendNotification function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as nodemailer from 'nodemailer';

const SendNotificationInputSchema = z.object({
  email: z.string().email().describe('The email address to send the notification to.'),
  subject: z.string().describe('The subject of the email.'),
  htmlBody: z.string().describe('The HTML content of the email.'),
  textBody: z.string().describe('The plain text content of the email.'),
});
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

const SendNotificationOutputSchema = z.object({
  success: z.boolean(),
});
export type SendNotificationOutput = z.infer<typeof SendNotificationOutputSchema>;

export async function sendNotification(input: SendNotificationInput): Promise<SendNotificationOutput> {
  return sendNotificationFlow(input);
}

const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: SendNotificationOutputSchema,
  },
  async ({ email, subject, htmlBody, textBody }) => {
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
      subject: subject,
      text: textBody,
      html: htmlBody,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Notification email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending notification email:', error);
      throw new Error('Failed to send notification email.');
    }
  }
);
