// Summarize analysis results.
'use server';
/**
 * @fileOverview Summarizes the analysis results, including particle counts and concentration estimates.
 *
 * - summarizeAnalysisResults - A function that summarizes the analysis results.
 * - SummarizeAnalysisResultsInput - The input type for the summarizeAnalysisResults function.
 * - SummarizeAnalysisResultsOutput - The return type for the summarizeAnalysisResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAnalysisResultsInputSchema = z.object({
  particleCount: z.number().describe('The number of microplastic particles detected in the sample.'),
  concentrationEstimate: z.string().describe('The estimated concentration of microplastics in the sample (e.g., in particles per liter).'),
  imageDescription: z.string().describe('A description of the image that was analyzed.')
});
export type SummarizeAnalysisResultsInput = z.infer<typeof SummarizeAnalysisResultsInputSchema>;

const SummarizeAnalysisResultsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the microplastic contamination level in the sample.')
});
export type SummarizeAnalysisResultsOutput = z.infer<typeof SummarizeAnalysisResultsOutputSchema>;

export async function summarizeAnalysisResults(input: SummarizeAnalysisResultsInput): Promise<SummarizeAnalysisResultsOutput> {
  return summarizeAnalysisResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAnalysisResultsPrompt',
  input: {schema: SummarizeAnalysisResultsInputSchema},
  output: {schema: SummarizeAnalysisResultsOutputSchema},
  prompt: `You are an expert in environmental science, specializing in microplastic pollution analysis. Given the following analysis results, provide a concise summary of the microplastic contamination level in the water sample.

Image Description: {{{imageDescription}}}
Particle Count: {{{particleCount}}}
Concentration Estimate: {{{concentrationEstimate}}}

Summary: `
});

const summarizeAnalysisResultsFlow = ai.defineFlow(
  {
    name: 'summarizeAnalysisResultsFlow',
    inputSchema: SummarizeAnalysisResultsInputSchema,
    outputSchema: SummarizeAnalysisResultsOutputSchema
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
