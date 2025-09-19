'use server';

/**
 * @fileOverview Analyzes an uploaded image to detect and identify microplastics using a YOLO model.
 *
 * - analyzeUploadedImage - A function that handles the image analysis process.
 * - AnalyzeUploadedImageInput - The input type for the analyzeUploadedImage function.
 * - AnalyzeUploadedImageOutput - The return type for the analyzeUploadedImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUploadedImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a water sample, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeUploadedImageInput = z.infer<typeof AnalyzeUploadedImageInputSchema>;

const AnalyzeUploadedImageOutputSchema = z.object({
  analysisSummary: z.string().describe('A summary of the analysis, including highlighted microplastic particles, particle counts, and concentration estimates.'),
  particleTypes: z.array(z.object({
    type: z.string().describe('The type of microplastic particle detected (e.g., Fragment, Fiber, Film).'),
    count: z.number().describe('The number of particles of this type.'),
    percentage: z.number().describe('The percentage of this particle type out of the total detected particles.'),
  })).describe('A list of detected microplastic particle types and their distribution.'),
  contaminationPercentage: z.number().describe('The overall contamination percentage of the sample area shown in the image.'),
  particleCount: z.number().describe('The total number of microplastic particles detected.'),
});
export type AnalyzeUploadedImageOutput = z.infer<typeof AnalyzeUploadedImageOutputSchema>;


export async function analyzeUploadedImage(input: AnalyzeUploadedImageInput): Promise<AnalyzeUploadedImageOutput> {
  return analyzeUploadedImageFlow(input);
}

const analyzeUploadedImagePrompt = ai.definePrompt({
  name: 'analyzeUploadedImagePrompt',
  input: {schema: AnalyzeUploadedImageInputSchema},
  output: {schema: AnalyzeUploadedImageOutputSchema},
  prompt: `You are an expert in analyzing water sample images for microplastic contamination.

You will receive a water sample image and you must analyze it to identify and quantify microplastic particles.

Based on the analysis, provide a result including:
1.  A quantitative analysis of the different types of particles (e.g., Fragment, Fiber, Film). Provide the count and percentage for each type.
2.  The total count of all detected microplastic particles.
3.  An estimated contamination percentage for the visible area in the image.
4.  A concise summary of the findings.

Image: {{media url=photoDataUri}}`,
});

const analyzeUploadedImageFlow = ai.defineFlow(
  {
    name: 'analyzeUploadedImageFlow',
    inputSchema: AnalyzeUploadedImageInputSchema,
    outputSchema: AnalyzeUploadedImageOutputSchema,
  },
  async input => {
    const {output} = await analyzeUploadedImagePrompt(input);
    return output!;
  }
);
