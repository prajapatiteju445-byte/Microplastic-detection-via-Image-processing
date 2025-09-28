'use client';

import { useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference, DocumentData } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import type { Analysis } from '@/lib/types';
import { Button } from '../ui/button';
import { Loader2, AlertTriangle, FileUp } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import Image from 'next/image';

type AnalysisViewProps = {
    analysisId: string | null;
    onReset: () => void;
};

export default function AnalysisView({ analysisId, onReset }: AnalysisViewProps) {
    const { firestore } = useFirebase();

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
                return 'Detecting particles from image...';
            case 'analyzing':
                return 'Generating AI summary and insights...';
            default:
                return 'Processing...';
        }
    }

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Analysis</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
                <Button onClick={onReset} variant="outline" className="mt-4">
                    <FileUp className="mr-2 h-4 w-4" />
                    Start a New Analysis
                </Button>
            </div>
        );
    }
    
    if (analysis && analysis.status === 'error') {
        return (
            <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Analysis Failed</AlertTitle>
                    <AlertDescription>{analysis.error || 'An unknown error occurred during analysis.'}</AlertDescription>
                </Alert>
                <Button onClick={onReset} variant="outline" className="mt-4">
                    <FileUp className="mr-2 h-4 w-4" />
                    Start a New Analysis
                </Button>
            </div>
        )
    }

    if (isProcessing) {
        return (
            <div className="p-8 flex flex-col items-center justify-center gap-6 text-center">
                <div className="flex items-center gap-3 text-lg font-medium text-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p>
                        {getStatusMessage()}
                    </p>
                </div>
                 <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                    {analysis?.imageDataUri && (
                        <Image src={analysis.imageDataUri} alt="Water sample preview" layout="fill" objectFit="contain" />
                    )}
                 </div>
                 <p className="text-muted-foreground text-sm">The results will appear below as soon as they are ready.</p>
            </div>
        )
    }
    
    if (isComplete) {
       return (
            <div className="p-8 flex flex-col items-center justify-center gap-6 text-center">
                <h2 className="text-2xl font-semibold">Analysis Complete</h2>
                <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                    {analysis?.imageDataUri && (
                        <Image src={analysis.imageDataUri} alt="Analyzed water sample" layout="fill" objectFit="contain" />
                    )}
                </div>
                <p className="text-muted-foreground">Review your results below.</p>
                <Button onClick={onReset} variant="outline" className="mt-4">
                    <FileUp className="mr-2 h-4 w-4" />
                    Analyze Another Sample
                </Button>
            </div>
        );
    }
    
    return null;
}
