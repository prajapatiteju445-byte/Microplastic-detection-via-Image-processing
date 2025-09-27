'use client';

import { useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference, DocumentData } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import type { Analysis } from '@/lib/types';
import { Button } from '../ui/button';
import { Loader2, AlertTriangle, FileUp } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

type AnalysisViewProps = {
    analysisId: string | null;
    onReset: () => void;
};

export default function AnalysisView({ analysisId, onReset }: AnalysisViewProps) {
    const { firestore } = useFirebase();

    // Memoize the document reference to prevent re-renders
    const analysisDocRef = useMemoFirebase(() => {
        if (!firestore || !analysisId) return null;
        return doc(firestore, 'analyses', analysisId) as DocumentReference<DocumentData>;
    }, [firestore, analysisId]);
    
    const { data: analysis, isLoading, error } = useDoc<Analysis>(analysisDocRef);
    
    if (!analysisId) {
        return null;
    }

    const isProcessing = isLoading || (analysis && (analysis.status === 'new' || analysis.status === 'processing' || analysis.status === 'analyzing'));
    const isComplete = analysis?.status === 'complete';
    
    const getStatusMessage = () => {
        if (!analysis) return 'Loading analysis...';
        switch (analysis.status) {
            case 'new':
                return 'Analysis is in the queue...';
            case 'processing':
                return 'Detecting particles...';
            case 'analyzing':
                return 'Generating AI summary...';
            default:
                return 'Processing...';
        }
    }

    if (error) {
        return (
            <div>
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Analysis</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
                <Button onClick={onReset} variant="outline">
                    <FileUp className="mr-2 h-4 w-4" />
                    Start a New Analysis
                </Button>
            </div>
        );
    }
    
    if (analysis && analysis.status === 'error') {
        return (
            <div>
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Analysis Failed</AlertTitle>
                    <AlertDescription>{analysis.error || 'An unknown error occurred during analysis.'}</AlertDescription>
                </Alert>
                <Button onClick={onReset} variant="outline">
                    <FileUp className="mr-2 h-4 w-4" />
                    Start a New Analysis
                </Button>
            </div>
        )
    }

    if (isProcessing) {
        return (
            <div>
                <div>
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p>
                        {getStatusMessage()}
                    </p>
                </div>
                 <div>
                    {analysis?.imageDataUri && (
                        <img src={analysis.imageDataUri} alt="Water sample preview" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                    )}
                 </div>
                 <p>Analysis is running. The right panels will update automatically upon completion.</p>
            </div>
        )
    }
    
    if (isComplete) {
       // When complete, we show the main visual panel instead of the loading state.
        return (
             <div>
                 <h2>Analysis Complete</h2>
                  <div>
                    {analysis?.imageDataUri && (
                        <img src={analysis.imageDataUri} alt="Water sample preview" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                    )}
                 </div>
                 <p>Review your results in the panels on the right. You can start a new analysis below.</p>
            </div>
        );
    }
    
    return null;
}
