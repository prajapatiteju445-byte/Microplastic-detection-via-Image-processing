'use server';

import { provideHelpAndInstructions } from '@/ai/flows/provide-help-and-instructions';

export async function getHelpContentAction() {
  try {
    const result = await provideHelpAndInstructions();
    return { success: true, data: result.helpText };
  } catch (error) {
    console.error('Failed to get help content:', error);
    return { success: false, error: 'Failed to load help content. Please try again later.' };
  }
}
