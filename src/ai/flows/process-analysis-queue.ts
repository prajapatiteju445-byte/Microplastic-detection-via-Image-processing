'use server';

/**
 * @fileOverview This flow orchestrates the analysis of a queued image. It fetches the
 * analysis document, runs the image analysis, and updates the document with the results or an error.
 * This is designed to be triggered as a background task.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server-init';
import { analyzeUploadedImage } from './analyze-uploaded-image';

// Initialize Firebase Admin SDK for server-side operations.
const { firestore } = initializeFirebase();

const ProcessAnalysisQueueInputSchema = z.object({
  analysisId: z.string().describe('The ID of the analysis document in Firestore.'),
});
export type ProcessAnalysisQueueInput = z.infer<typeof ProcessAnalysisQueueInputSchema>;

export async function processAnalysisQueue(input: ProcessAnalysisQueueInput): Promise<void> {
  return processAnalysisQueueFlow(input);
}

const processAnalysisQueueFlow = ai.defineFlow(
  {
    name: 'processAnalysisQueueFlow',
    inputSchema: ProcessAnalysisQueueInputSchema,
    outputSchema: z.void(),
  },
  async ({ analysisId }) => {
    const analysisDocRef = doc(firestore, 'analyses', analysisId);

    try {
      // 1. Mark the job as 'processing'.
      await updateDoc(analysisDocRef, { status: 'processing' });

      // 2. Fetch the document to get the image data.
      const docSnap = await getDoc(analysisDocRef);
      if (!docSnap.exists()) {
        throw new Error(`Analysis document with ID ${analysisId} not found.`);
      }
      const imageDataUri = docSnap.data()?.imageDataUri;
      if (!imageDataUri) {
        throw new Error(`Image data URI is missing in analysis document ${analysisId}.`);
      }
      
      // 3. Mark as 'analyzing' right before the AI call
       await updateDoc(analysisDocRef, { status: 'analyzing' });

      // 4. Perform the actual analysis by calling the other flow.
      const analysisResult = await analyzeUploadedImage({ imageDataUri });

      // 5. Update the document with the final results and mark as 'complete'.
      await updateDoc(analysisDocRef, {
        status: 'complete',
        result: analysisResult,
        completedAt: serverTimestamp(),
        error: null, // Clear any previous errors
      });

      console.log(`Successfully completed analysis for document: ${analysisId}`);

    } catch (error) {
      console.error(`Failed to process analysis for document ${analysisId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during processing.';
      
      // 6. If any step fails, update the document with an error status.
      await updateDoc(analysisDocRef, {
        status: 'error',
        error: errorMessage,
        completedAt: serverTimestamp(),
      });
    }
  }
);
