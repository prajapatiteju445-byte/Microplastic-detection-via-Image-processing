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
    return { success: false, error: 'Failed to analyze image. The AI model may be unavailable. Please try again later.' };
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
