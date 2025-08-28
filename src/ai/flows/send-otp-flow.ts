'use server';

/**
 * @fileOverview A flow to send a One-Time Password (OTP) to a user's email.
 * 
 * - sendOtp - A function that generates and sends an OTP.
 * - SendOtpInput - The input type for the sendOtp function.
 * - SendOtpOutput - The return type for the sendOtp function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as nodemailer from 'nodemailer';

const SendOtpInputSchema = z.object({
  email: z.string().email().describe('The email address to send the OTP to.'),
});
export type SendOtpInput = z.infer<typeof SendOtpInputSchema>;

const SendOtpOutputSchema = z.object({
  otp: z.string().describe('The 6-digit OTP that was sent to the user.'),
});
export type SendOtpOutput = z.infer<typeof SendOtpOutputSchema>;

export async function sendOtp(input: SendOtpInput): Promise<SendOtpOutput> {
  return sendOtpFlow(input);
}

const sendOtpFlow = ai.defineFlow(
  {
    name: 'sendOtpFlow',
    inputSchema: SendOtpInputSchema,
    outputSchema: SendOtpOutputSchema,
  },
  async ({ email }) => {
    // In a real app, you would check if the user already exists.
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Nodemailer transport configuration
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      secure: (process.env.MAIL_PORT === '465'), // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"InstaNext" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your InstaNext Verification Code',
      text: `Your OTP is: ${otp}`,
      html: `<b>Your OTP is: ${otp}</b>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`OTP email sent to ${email}`);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      // In a real app, you'd have more robust error handling.
      throw new Error('Failed to send OTP email.');
    }
    
    // In a production app, you would not return the OTP. 
    // You'd store it (e.g., in a database or cache with an expiry) 
    // and have a separate flow to verify it.
    return { otp };
  }
);
