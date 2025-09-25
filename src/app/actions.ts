'use server';

import { provideHelpAndInstructions } from '@/ai/flows/provide-help-and-instructions';

// The analyzeImageAction is no longer needed as the analysis is now triggered by a Firestore event.
// The client will write directly to Firestore to create an analysis job.

export async function getHelpContentAction() {
  try {
    const result = await provideHelpAndinstructions();
    return { success: true, data: result.helpText };
  } catch (error) {
    console.error('Failed to get help content:', error);
    return { success: false, error: 'Failed to load help content. Please try again later.' };
  }
}
