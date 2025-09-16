'use server';
/**
 * @fileOverview This file defines a Genkit flow to provide help and instructions regarding microplastic detection, image processing, and data export options.
 *
 * - provideHelpAndInstructions - A function that returns help and instructions for the application.
 * - ProvideHelpAndInstructionsOutput - The return type for the provideHelpAndInstructions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideHelpAndInstructionsOutputSchema = z.object({
  helpText: z.string().describe('Help and instructions regarding microplastic detection, image processing, and data export options.'),
});

export type ProvideHelpAndInstructionsOutput = z.infer<typeof ProvideHelpAndInstructionsOutputSchema>;

export async function provideHelpAndInstructions(): Promise<ProvideHelpAndInstructionsOutput> {
  return provideHelpAndInstructionsFlow();
}

const prompt = ai.definePrompt({
  name: 'provideHelpAndInstructionsPrompt',
  output: {schema: ProvideHelpAndInstructionsOutputSchema},
  prompt: `You are an AI assistant providing help and instructions for a microplastic detection application.

  Provide clear and concise information regarding the following:
  - The process of microplastic detection using image analysis.
  - How the uploaded images are processed to identify microplastics.
  - Explanation of the analysis results, including particle counts and concentration estimates.
  - Instructions on how to interpret the results correctly.
  - Details on the available data export options (e.g., CSV format) and their usage.

  Your response should be informative and easy to understand for users with varying levels of technical expertise.
  `,
});

const provideHelpAndInstructionsFlow = ai.defineFlow({
  name: 'provideHelpAndInstructionsFlow',
  outputSchema: ProvideHelpAndInstructionsOutputSchema,
}, async () => {
  const {output} = await prompt({});
  return output!;
});
