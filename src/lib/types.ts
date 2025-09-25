import { AnalyzeUploadedImageOutput } from "@/ai/flows/analyze-uploaded-image";
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
  status: 'new' | 'processing' | 'complete' | 'error';
  imageDataUri: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  result?: AnalysisResult;
  error?: string;
};
