'use server';
/**
 * @fileOverview A microplastic detection AI agent that reasons about confidence intervals.
 *
 * - improveDetectionWithConfidenceThreshold - A function that handles the microplastic detection process, enhancing visualization with confidence cues.
 * - ImproveDetectionWithConfidenceThresholdInput - The input type for the improveDetectionWithConfidenceThreshold function.
 * - ImproveDetectionWithConfidenceThresholdOutput - The return type for the improveDetectionWithConfidenceThreshold function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveDetectionWithConfidenceThresholdInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a water sample, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImproveDetectionWithConfidenceThresholdInput = z.infer<typeof ImproveDetectionWithConfidenceThresholdInputSchema>;

const ImproveDetectionWithConfidenceThresholdOutputSchema = z.object({
  analysisResult: z.string().describe('The analysis result with visual cues based on confidence intervals.'),
});
export type ImproveDetectionWithConfidenceThresholdOutput = z.infer<typeof ImproveDetectionWithConfidenceThresholdOutputSchema>;

export async function improveDetectionWithConfidenceThreshold(input: ImproveDetectionWithConfidenceThresholdInput): Promise<ImproveDetectionWithConfidenceThresholdOutput> {
  return improveDetectionWithConfidenceThresholdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveDetectionWithConfidenceThresholdPrompt',
  input: {schema: ImproveDetectionWithConfidenceThresholdInputSchema},
  output: {schema: ImproveDetectionWithConfidenceThresholdOutputSchema},
  prompt: `You are an expert in microplastic detection and image analysis.

You will analyze the provided image of a water sample and identify potential microplastic particles. For each detected particle, you will estimate a confidence level.

Based on the confidence level, you will generate a description of the image analysis results including visual cues for the different confidence intervals.
High confidence detections should be clearly highlighted, medium confidence detections should be indicated with less emphasis, and low confidence detections should be noted but with minimal visual emphasis.

Respond using markdown formatting.

Image: {{media url=photoDataUri}}`,
});

const improveDetectionWithConfidenceThresholdFlow = ai.defineFlow(
  {
    name: 'improveDetectionWithConfidenceThresholdFlow',
    inputSchema: ImproveDetectionWithConfidenceThresholdInputSchema,
    outputSchema: ImproveDetectionWithConfidenceThresholdOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
