'use client';

import { useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference, DocumentData } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import type { Analysis } from '@/lib/types';
import { Button } from '../ui/button';
import { Loader2, AlertTriangle, FileUp, Microscope } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

type AnalysisViewProps = {
    analysisId: string | null;
    onReset: () => void;
};


const StatusDisplay = ({ status }: { status: Analysis['status'] }) => {
    const getStatusInfo = () => {
        switch (status) {
            case 'new':
                return { text: 'In Queue', icon: <Loader2 className="h-4 w-4 animate-spin" />, progress: 10 };
            case 'processing':
                return { text: 'Detecting Particles', icon: <Loader2 className="h-4 w-4 animate-spin" />, progress: 40 };
            case 'analyzing':
                return { text: 'Generating Insights', icon: <Loader2 className="h-4 w-4 animate-spin" />, progress: 75 };
            case 'complete':
                return { text: 'Complete', icon: <div className="h-4 w-4 bg-green-500 rounded-full" />, progress: 100 };
            case 'error':
                 return { text: 'Error', icon: <AlertTriangle className="h-4 w-4 text-destructive" />, progress: 100 };
            default:
                return { text: 'Loading...', icon: <Loader2 className="h-4 w-4 animate-spin" />, progress: 0 };
        }
    };

    const { text, icon, progress } = getStatusInfo();
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Analysis Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                        {icon}
                        <span>{text}</span>
                    </div>
                    <Badge variant={status === 'complete' ? 'default' : 'secondary'}>{progress}%</Badge>
                </div>
                <Progress value={progress} className="w-full" />
            </CardContent>
        </Card>
    );
};


export default function AnalysisView({ analysisId, onReset }: AnalysisViewProps) {
    const { firestore } = useFirebase();

    const analysisDocRef = useMemoFirebase(() => {
        if (!firestore || !analysisId) return null;
        return doc(firestore, 'analyses', analysisId) as DocumentReference<DocumentData>;
    }, [firestore, analysisId]);
    
    const { data: analysis, isLoading, error } = useDoc<Analysis>(analysisDocRef);
    
    const renderError = (title: string, message: string) => (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle /> {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Details</AlertTitle>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
                <Button onClick={onReset} variant="outline" className="mt-6 w-full">
                    <FileUp className="mr-2 h-4 w-4" />
                    Start a New Analysis
                </Button>
            </CardContent>
        </Card>
    );

    if (!analysisId) return null; // Should not happen if component is rendered
    
    if (error) return renderError('Error Loading Analysis', error.message);

    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading analysis details...</p>
            </div>
        )
    }

    if (analysis && analysis.status === 'error') {
        return renderError('Analysis Failed', analysis.error || 'An unknown error occurred during analysis.');
    }
    
    if (!analysis) {
        return renderError('Analysis Not Found', `Analysis with ID ${analysisId} could not be found.`);
    }

    const isProcessing = analysis.status === 'new' || analysis.status === 'processing' || analysis.status === 'analyzing';

    if (isProcessing) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <StatusDisplay status={analysis.status} />
                <Card>
                    <CardHeader>
                        <CardTitle>Uploaded Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                            <Image src={analysis.imageDataUri} alt="Water sample being analyzed" layout="fill" objectFit="contain" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    if (analysis.status === 'complete' && analysis.result) {
        const { result } = analysis;
       return (
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Analysis Complete</h2>
                        <p className="text-muted-foreground">Review your detailed results below.</p>
                    </div>
                    <Button onClick={onReset} variant="outline">
                        <Microscope className="mr-2 h-4 w-4" />
                        Analyze Another Sample
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left side */}
                    <div className="lg:col-span-3 space-y-8">
                        <Card>
                             <CardHeader>
                                <CardTitle>Visual Analysis</CardTitle>
                                <CardDescription>Detected particles highlighted on your image.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                                    <Image src={analysis.imageDataUri} alt="Analyzed water sample" layout="fill" objectFit="contain" />
                                     {result.particles.map((p, i) => (
                                        <div key={i} className="absolute border-2 border-red-500 rounded-sm" style={{
                                            left: `${p.x * 100}%`,
                                            top: `${p.y * 100}%`,
                                            // Note: Roboflow gives center x,y. We need to offset.
                                            // Assuming a fixed size for now as width/height are not in normalized output
                                            width: '10px', 
                                            height: '10px',
                                            transform: 'translate(-50%, -50%)',
                                            opacity: p.confidence
                                        }}/>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Right side */}
                    <div className="lg:col-span-2 space-y-8">
                         <Card>
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{result.analysisSummary}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Key Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Total Particles</span>
                                    <Badge variant="default">{result.particleCount}</Badge>
                                </div>
                                <Separator/>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Contamination</span>
                                     <Badge variant="secondary">{result.contaminationPercentage.toFixed(2)}%</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
    
    return null;
}
