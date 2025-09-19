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
    type: z.string().describe('The shape of microplastic particle detected (e.g., Fragment, Fiber, Film, Pellet, Foam).'),
    count: z.number().describe('The number of particles of this shape.'),
    percentage: z.number().describe('The percentage of this particle shape out of the total detected particles.'),
  })).describe('A list of detected microplastic particle shapes and their distribution.'),
  polymerTypes: z.array(z.object({
      type: z.string().describe('The polymer type of microplastic particle detected (e.g., PE, PP, PET, PVC).'),
      count: z.number().describe('The number of particles of this polymer type.'),
      percentage: z.number().describe('The percentage of this polymer type out of the total detected particles.'),
  })).describe('A list of detected microplastic polymer types and their distribution.'),
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
  prompt: `You are an expert in environmental science and machine learning, specializing in microplastic pollution analysis. You will be using a Gemini ML model for advanced identification.

You will receive a water sample image. Your task is to analyze it to identify and quantify microplastic particles, classifying them by both shape and polymer type.

### Common Particle Shapes:
- **Fibers:** Tiny threads shed from synthetic textiles.
- **Fragments:** Small pieces from the breakdown of larger plastic items.
- **Pellets/Beads:** Manufactured primary microplastics.
- **Foam:** Particles from foam packaging or gear.
- **Films:** Thin sheets from packaging or bags.

### Common Polymer Types:
- **PE (Polyethylene):** From bottles, packaging.
- **PP (Polypropylene):** From various plastic products.
- **PS (Polystyrene):** From foam products, packaging.
- **PET (Polyethylene Terephthalate):** From beverage bottles, food packaging.
- **PVC (Polyvinyl Chloride):** From various plastic items.
- **PA (Polyamide/Nylon):** From textiles, fishing nets.
- **PU (Polyurethane):** From coatings, consumer goods.

Based on your analysis of the image, provide a result including:
1.  A quantitative analysis of the different **shapes** of particles. Provide the count and percentage for each shape.
2.  A quantitative analysis of the different **polymer types** of particles. Provide the count and percentage for each polymer.
3.  The total count of all detected microplastic particles.
4.  An estimated contamination percentage for the visible area in the image.
5.  A concise summary of the findings.

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
