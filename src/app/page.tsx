'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import UploadPanel from '@/components/analysis/upload-panel';
import type { Particle } from '@/lib/types';
import type { AnalyzeUploadedImageOutput } from '@/ai/flows/analyze-uploaded-image';
import AnalysisColumn from '@/components/analysis/analysis-column';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeUploadedImageOutput | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setImage(null);
    setAnalysisResult(null);
    setParticles([]);
    setIsLoading(false);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <UploadPanel
            setImage={setImage}
            setAnalysisResult={setAnalysisResult}
            setParticles={setParticles}
            setIsLoading={setIsLoading}
            setError={setError}
            isLoading={isLoading}
            image={image}
            resetState={resetState}
          />
          <AnalysisColumn
            image={image}
            particles={particles}
            analysisResult={analysisResult}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
