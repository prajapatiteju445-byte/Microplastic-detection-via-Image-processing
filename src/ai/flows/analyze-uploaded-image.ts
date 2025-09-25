'use server';

/**
 * @fileOverview This flow analyzes an image for microplastics, updates the Firestore document with the status
 * and results, and is designed to run as a scalable background worker.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { detectParticles } from '@/services/roboflow';

// Define the input schema for the main analysis flow
const AnalyzeUploadedImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a water sample, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeUploadedImageInput = z.infer<typeof AnalyzeUploadedImageInputSchema>;


// Define the output schema for the analysis result, consistent with frontend types
const AnalysisResultSchema = z.object({
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


// This Genkit prompt performs the core AI analysis.
const analysisPrompt = ai.definePrompt({
  name: 'microplasticAnalysisPrompt',
  input: {
    schema: z.object({
      predictions: z.array(
        z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
          confidence: z.number(),
          class: z.string(),
          class_id: z.number(),
        })
      ),
    }),
  },
  output: { schema: AnalysisResultSchema },
  prompt: `You are an expert in environmental science and machine learning, specializing in microplastic pollution analysis. You have been provided with a set of microplastic detections from a water sample image, identified by a Roboflow YOLO model.

Your task is to interpret these raw detection results and generate a comprehensive analysis.

### Common Particle Shapes:
- **Fibers:** Tiny threads shed from synthetic textiles.
- **Fragments:** Small pieces from the breakdown of larger plastic items.
- **Pellets/Beads:** Manufactured primary microplastics.
- **Foam:** Particles from foam packaging or gear.
- **Films:** Thin sheets from packaging or bags.

### Common Polymer Types (Hypothesized based on shape and appearance):
- **PE (Polyethylene):** Likely from fragments of bottles, packaging.
- **PP (Polypropylene):** Likely from fragments of various plastic products.
- **PS (Polystyrene):** Likely from foam particles.
- **PET (Polyethylene Terephthalate):** Likely from fragments of beverage bottles, food packaging.
- **PVC (Polyvinyl Chloride):** Likely from fragments of various plastic items.
- **PA (Polyamide/Nylon):** Likely from fibers from textiles, fishing nets.
- **PU (Polyurethane):** Likely from foam or fragments of coatings, consumer goods.

Based on the provided detection data, provide a result including:
1. A quantitative analysis of the different **shapes** of particles detected by the model. Provide the count and percentage for each shape.
2. A quantitative analysis hypothesizing the different **polymer types** of particles. You must infer the polymer type based on the detected shape. Provide the count and percentage for each polymer.
3. The total count of all detected microplastic particles.
4. An estimated contamination percentage for the visible area in the image, considering the area covered by the bounding boxes of the detected particles.
5. A concise summary of the findings.
6. The original particle detection data, with coordinates normalized to a 0-1 scale.

Detections:
{{#each predictions}}
- Class: {{class}}, Confidence: {{confidence}}, BoundingBox: [{{x}}, {{y}}, {{width}}, {{height}}]
{{/each}}
`,
});


// This is the main flow, now refactored to be a callable server action.
const analyzeUploadedImageFlow = ai.defineFlow(
  {
    name: 'analyzeUploadedImageFlow',
    inputSchema: AnalyzeUploadedImageInputSchema,
    outputSchema: AnalysisResultSchema,
  },
  async (input) => {
    // 1. Get detections from Roboflow model
    const roboflowResult = await detectParticles(input.imageDataUri);
    const { width: imageWidth, height: imageHeight } = roboflowResult.image;

    // 2. Normalize coordinates for client-side rendering
    const normalizedParticles = roboflowResult.predictions.map(p => ({
      x: p.x / imageWidth,
      y: p.y / imageHeight,
      confidence: p.confidence,
      class: p.class,
    }));

    // 3. Get summary and detailed analysis from Gemini
    const { output: analysisResult } = await analysisPrompt({
      predictions: roboflowResult.predictions,
    });
    
    if (!analysisResult) {
      throw new Error('Failed to get analysis from the language model.');
    }
    
    // 4. Combine all results into the final output
    const finalResult: AnalyzeUploadedImageOutput = {
      ...analysisResult,
      particleCount: roboflowResult.predictions.length,
      particles: normalizedParticles,
    };
    
    return finalResult;
  }
);


// Exported wrapper function to be called from the frontend.
export async function analyzeUploadedImage(input: AnalyzeUploadedImageInput): Promise<AnalyzeUploadedImageOutput> {
  return await analyzeUploadedImageFlow(input);
}