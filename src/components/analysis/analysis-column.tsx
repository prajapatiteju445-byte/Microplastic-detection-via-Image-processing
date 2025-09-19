'use client';

import type { AnalyzeUploadedImageOutput } from '@/ai/flows/analyze-uploaded-image';
import type { Particle } from '@/lib/types';
import ResultsPanel from './results-panel';
import VisualsPanel from './visuals-panel';

type AnalysisColumnProps = {
  image: string | null;
  particles: Particle[];
  analysisResult: AnalyzeUploadedImageOutput | null;
  isLoading: boolean;
};

export default function AnalysisColumn({ image, particles, analysisResult, isLoading }: AnalysisColumnProps) {
  return (
    <div className="flex flex-col gap-8">
      <ResultsPanel
        analysisResult={analysisResult}
        particles={particles}
        isLoading={isLoading}
      />
      <VisualsPanel
        image={image}
        particles={particles}
        isLoading={isLoading}
        analysisResult={analysisResult}
      />
    </div>
  );
}
