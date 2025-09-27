import { z } from 'zod';

// Define the input schema for the main analysis flow
export const AnalyzeUploadedImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a water sample, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeUploadedImageInput = z.infer<typeof AnalyzeUploadedImageInputSchema>;


// Define the output schema for the analysis result, consistent with frontend types
export const AnalysisResultSchema = z.object({
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
  particles: z.array(z.object({
    x: z.number().describe('The normalized x-coordinate (0-1) of the particle center.'),
    y: z.number().describe('The normalized y-coordinate (0-1) of the particle center.'),
    confidence: z.number(),
    class: z.string(),
  })).describe('A list of detected particle objects with their normalized coordinates and confidence levels.'),
});
export type AnalyzeUploadedImageOutput = z.infer<typeof AnalysisResultSchema>;
