'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import UploadPanel from '@/components/analysis/upload-panel';
import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Loader2 } from 'lucide-react';
import AnalysisView from '@/components/analysis/analysis-view';
import VisualsPanel from '@/components/analysis/visuals-panel';
import ResultsPanel from '@/components/analysis/results-panel';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, DocumentReference, DocumentData } from 'firebase/firestore';
import { useFirebase, useMemoFirebase } from '@/firebase/provider';
import type { Analysis } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { firestore } = useFirebase();

  const analysisDocRef = useMemoFirebase(() => {
    if (!firestore || !analysisId) return null;
    return doc(firestore, 'analyses', analysisId) as DocumentReference<DocumentData>;
  }, [firestore, analysisId]);

  const { data: analysis, isLoading: isAnalysisLoading, error: analysisError } = useDoc<Analysis>(analysisDocRef);

  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const handleNewAnalysis = (id: string) => {
    setAnalysisId(id);
  };
  
  const handleReset = () => {
    setAnalysisId(null);
  }

  if (isUserLoading || !user) {
    return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p>Authenticating securely...</p>
            </div>
        </main>
      </div>
    )
  }
  
  const isAnalyzingOrProcessing = isAnalysisLoading || (analysisId && analysis?.status !== 'complete' && analysis?.status !== 'error');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-8">
            <div>
              {analysisId ? (
                  <AnalysisView analysisId={analysisId} onReset={handleReset} />
              ) : (
                  <UploadPanel setAnalysisId={handleNewAnalysis} />
              )}
            </div>

            <Separator />

            <div className="flex flex-col gap-8">
              <ResultsPanel 
                  analysisResult={analysis?.result || null}
                  particles={analysis?.result?.particles || []}
                  isLoading={isAnalyzingOrProcessing}
                  isAnalyzing={analysis?.status === 'analyzing'}
              />
              <Separator />
              <VisualsPanel 
                  image={analysis?.imageDataUri || null}
                  particles={analysis?.result?.particles || []}
                  isLoading={isAnalyzingOrProcessing}
                  analysisResult={analysis?.result || null}
              />
            </div>
        </div>
      </main>
    </div>
  );
}
