import { config } from 'dotenv';
config();

import '@/ai/flows/provide-help-and-instructions.ts';
import '@/ai/flows/summarize-analysis-results.ts';
import '@/ai/flows/improve-detection-with-confidence-threshold.ts';
import '@/ai/flows/analyze-uploaded-image.ts';
import '@/ai/flows/process-analysis-queue.ts';
