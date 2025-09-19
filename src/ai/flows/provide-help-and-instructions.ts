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
  prompt: `You are an AI assistant providing help and instructions for a microplastic detection application called AquaLens.

  Your response should be formatted in Markdown and include the following sections:

  ### How to Use AquaLens
  Provide a clear, step-by-step guide for users:
  1.  **Upload Image:** Explain how to upload an image of a water sample using the drag-and-drop feature or the file selector.
  2.  **Analyze Sample:** Describe what happens when the user clicks the "Analyze Sample" button.
  3.  **View Results:** Detail how the analysis results are displayed, including the image with highlighted particles, the particle count, and the concentration estimate.

  ### How It Works
  Explain the technology behind the application:
  -   Mention that the system uses advanced AI and computer vision (specifically a YOLO model) to analyze the images.
  -   Describe that the AI is trained to identify and highlight microplastic particles from the background.
  -   Explain that the results provide a quantitative estimate of contamination.

  ### Exporting Data
  -   Explain that users can download the raw detection data (particle coordinates and confidence scores) as a CSV file by clicking the "Export Results (CSV)" button.
  -   Briefly mention what the CSV file can be used for (e.g., further analysis, record-keeping).

  Your tone should be informative and easy to understand for users with varying levels of technical expertise.
  `,
});

const provideHelpAndInstructionsFlow = ai.defineFlow({
  name: 'provideHelpAndInstructionsFlow',
  outputSchema: ProvideHelpAndInstructionsOutputSchema,
}, async () => {
  const {output} = await prompt({});
  return output!;
});
