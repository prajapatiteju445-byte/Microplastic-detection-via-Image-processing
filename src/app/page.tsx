'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import UploadPanel from '@/components/analysis/upload-panel';
import type { Particle } from '@/lib/types';
import type { AnalyzeUploadedImageOutput } from '@/ai/flows/analyze-uploaded-image';
import AnalysisColumn from '@/components/analysis/analysis-column';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

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
    <div className="flex flex-col min-h-screen bg-background-gradient">
      <Header />
      <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-8">
            {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Analysis Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
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
          </div>
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
