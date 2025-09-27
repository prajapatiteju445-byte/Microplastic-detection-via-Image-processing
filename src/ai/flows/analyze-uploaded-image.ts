'use server';

/**
 * @fileOverview This flow analyzes an image for microplastics, updates the Firestore document with the status
 * and results, and is designed to run as a scalable background worker.
 */

import { ai } from '@/ai/genkit';
import { detectParticles } from '@/services/roboflow';
import { AnalyzeUploadedImageInputSchema, AnalyzeUploadedImageOutputSchema, AnalyzeUploadedImageInput, AnalyzeUploadedImageOutput } from '@/ai/flows/schemas/analyze-uploaded-image-schema';
import { z } from 'genkit';

// This Genkit prompt now ONLY generates the text summary.
const analysisSummaryPrompt = ai.definePrompt(
  {
    name: 'microplasticAnalysisSummaryPrompt',
    input: {schema: z.object({
        particleCount: z.number(),
        particleTypes: z.array(z.object({ type: z.string(), count: z.number() })),
        polymerTypes: z.array(z.object({ type: z.string(), count: z.number() })),
    })},
    output: {schema: z.object({
        analysisSummary: z.string().describe('A concise summary of the findings, written for a non-expert audience. Mention the most common particle shapes and likely polymer types.'),
    })},
    prompt: `You are an expert in environmental science, specializing in microplastic pollution analysis. You have been provided with quantitative data about a water sample.

Your task is to write a brief, easy-to-understand summary of the findings.

Based on the provided data, provide a concise summary.

- Total Particles Detected: {{{particleCount}}}
- Particle Shape Breakdown: {{{json particleTypes}}}
- Hypothesized Polymer Breakdown: {{{json polymerTypes}}}
`
  }
);


// This is the main flow, now refactored to be a callable server action.
const analyzeUploadedImageFlow = ai.defineFlow(
  {
    name: 'analyzeUploadedImageFlow',
    inputSchema: AnalyzeUploadedImageInputSchema,
    outputSchema: AnalyzeUploadedImageOutputSchema,
  },
  async (input) => {
    // 1. Get detections from Roboflow model
    const roboflowResult = await detectParticles(input.imageDataUri);
    const { predictions, image: { width: imageWidth, height: imageHeight } } = roboflowResult;
    const particleCount = predictions.length;

    // 2. Perform all calculations and data transformations in code, not in the LLM.
    const particleTypeCounts: { [key: string]: number } = {};
    const polymerTypeCounts: { [key: string]: number } = {};
    const POLYMER_MAP: { [key: string]: string } = {
        'Fiber': 'PA', // Polyamide
        'Fragment': 'PET', // Polyethylene Terephthalate
        'Film': 'PE', // Polyethylene
        'Pellet': 'PP', // Polypropylene
        'Foam': 'PS' // Polystyrene
    };

    let totalBoundingBoxArea = 0;

    for (const p of predictions) {
        // Count particle shapes
        particleTypeCounts[p.class] = (particleTypeCounts[p.class] || 0) + 1;
        
        // Infer and count polymer types
        const polymer = POLYMER_MAP[p.class] || 'Other';
        polymerTypeCounts[polymer] = (polymerTypeCounts[polymer] || 0) + 1;

        // Sum up bounding box area
        totalBoundingBoxArea += p.width * p.height;
    }

    const toPercentageArray = (counts: { [key: string]: number }) => {
        return Object.entries(counts).map(([type, count]) => ({
            type,
            count,
            percentage: particleCount > 0 ? (count / particleCount) * 100 : 0,
        })).sort((a, b) => b.count - a.count);
    };

    const particleTypes = toPercentageArray(particleTypeCounts);
    const polymerTypes = toPercentageArray(polymerTypeCounts);

    // Normalize particle coordinates for client-side rendering
    const normalizedParticles = predictions.map(p => ({
      x: p.x / imageWidth,
      y: p.y / imageHeight,
      confidence: p.confidence,
      class: p.class,
    }));
    
    const contaminationPercentage = imageHeight * imageWidth > 0 ? (totalBoundingBoxArea / (imageHeight * imageWidth)) * 100 : 0;

    // 3. Get ONLY the summary from Gemini
    const { output } = await analysisSummaryPrompt({
        particleCount,
        particleTypes: particleTypes.map(({type, count}) => ({type, count})),
        polymerTypes: polymerTypes.map(({type, count}) => ({type, count})),
    });
    
    if (!output?.analysisSummary) {
      throw new Error("Analysis failed: AI model did not return a valid summary.");
    }
    
    // 4. Combine all results into the final output
    const finalResult: AnalyzeUploadedImageOutput = {
      analysisSummary: output.analysisSummary,
      particleTypes,
      polymerTypes,
      contaminationPercentage,
      particleCount,
      particles: normalizedParticles,
    };
    
    return finalResult;
  }
);


// Exported wrapper function to be called from the other flow.
export async function analyzeUploadedImage(input: AnalyzeUploadedImageInput): Promise<AnalyzeUploadedImageOutput> {
  return await analyzeUploadedImageFlow(input);
}

    