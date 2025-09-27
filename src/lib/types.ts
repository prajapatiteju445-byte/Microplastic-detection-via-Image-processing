import { AnalyzeUploadedImageOutput } from "@/ai/flows/schemas/analyze-uploaded-image-schema";
import { Timestamp } from "firebase/firestore";

export type Particle = {
  x: number;
  y: number;
  confidence: number;
  class: string;
};

export type AnalysisResult = AnalyzeUploadedImageOutput;

export type Analysis = {
  id: string;
  userId: string;
  status: 'new' | 'processing' | 'analyzing' | 'complete' | 'error';
  imageDataUri: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  result?: AnalysisResult;
  error?: string;
};
