import { AnalyzeUploadedImageOutput } from "@/ai/flows/analyze-uploaded-image";

export type Particle = {
  x: number;
  y: number;
  confidence: number;
};

export type AnalysisResult = AnalyzeUploadedImageOutput;
