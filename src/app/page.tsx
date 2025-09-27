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
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';


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
       <div>
        <Header />
        <main>
            <div>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p>Authenticating securely...</p>
            </div>
        </main>
      </div>
    )
  }
  
  const isComplete = analysis?.status === 'complete';
  const isAnalyzingOrProcessing = isAnalysisLoading || (analysisId && analysis?.status !== 'complete' && analysis?.status !== 'error');

  return (
    <div>
      <Header />
      <main>
          <div>
            {analysisId ? (
                <AnalysisView analysisId={analysisId} onReset={handleReset} />
            ) : (
                <UploadPanel setAnalysisId={handleNewAnalysis} />
            )}

            <VisualsPanel 
                image={analysis?.imageDataUri || null}
                particles={analysis?.result?.particles || []}
                isLoading={isAnalyzingOrProcessing}
                analysisResult={analysis?.result || null}
            />
            <ResultsPanel 
                analysisResult={analysis?.result || null}
                particles={analysis?.result?.particles || []}
                isLoading={isAnalyzingOrProcessing}
                isAnalyzing={analysis?.status === 'analyzing'}
            />
            
            {isComplete && (
               <div>
                   <Button onClick={handleReset} variant="outline" size="lg">
                      <FileUp className="mr-2 h-4 w-4" />
                      Analyze Another Sample
                  </Button>
              </div>
            )}
          </div>
      </main>
    </div>
  );
}
