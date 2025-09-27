'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import UploadPanel from '@/components/analysis/upload-panel';
import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Loader2 } from 'lucide-react';
import AnalysisView from '@/components/analysis/analysis-view';

export default function Home() {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

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
       <div className="flex flex-col min-h-screen bg-background-gradient">
        <Header />
        <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Authenticating securely...</p>
            </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-gradient">
      <Header />
      <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
        <div className="flex-1 flex flex-col items-center justify-center">
        {analysisId ? (
           <AnalysisView analysisId={analysisId} onReset={handleReset} />
        ) : (
          <div className="max-w-2xl mx-auto w-full">
            <UploadPanel setAnalysisId={handleNewAnalysis} />
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
