'use server';

import { analyzeUploadedImage, AnalyzeUploadedImageOutput } from '@/ai/flows/analyze-uploaded-image';
import { provideHelpAndInstructions } from '@/ai/flows/provide-help-and-instructions';

export async function analyzeImageAction(imageDataUri: string): Promise<{ success: true, data: AnalyzeUploadedImageOutput } | { success: false, error: string }> {
  if (!imageDataUri) {
    return { success: false, error: 'No image data provided.' };
  }
  try {
    const result = await analyzeUploadedImage({ photoDataUri: imageDataUri });
    return { success: true, data: result };
  } catch (error) {
    console.error('Analysis failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze image. The AI model may be unavailable or an external service has failed. Please try again later.';
    return { success: false, error: errorMessage };
  }
}

export async function getHelpContentAction() {
  try {
    const result = await provideHelpAndInstructions();
    return { success: true, data: result.helpText };
  } catch (error) {
    console.error('Failed to get help content:', error);
    return { success: false, error: 'Failed to load help content. Please try again later.' };
  }
}
