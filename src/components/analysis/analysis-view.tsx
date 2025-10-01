'use client';

import { useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference, DocumentData } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import type { Analysis } from '@/lib/types';
import { Button } from '../ui/button';
import { Loader2, AlertTriangle, FileUp, Microscope, Eye, FileText, TestTube2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';


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

    if (!analysisId) return null;
    
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
            <div className="space-y-8">
                <StatusDisplay status={analysis.status} />
                <Card>
                    <CardHeader>
                        <CardTitle>Uploaded Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full h-96 rounded-lg overflow-hidden border">
                            <Image src={analysis.imageDataUri} alt="Water sample being analyzed" fill objectFit="contain" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    if (analysis.status === 'complete' && analysis.result) {
        const { result } = analysis;

        const chartData = result.particleTypes.map(p => ({ name: p.type, count: p.count }));
        const polymerChartData = result.polymerTypes.map(p => ({ name: p.type, count: p.count }));


       return (
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Analysis Complete</h1>
                        <p className="text-muted-foreground">Review your detailed results for this water sample.</p>
                    </div>
                    <Button onClick={onReset} variant="outline">
                        <Microscope className="mr-2 h-4 w-4" />
                        Analyze Another Sample
                    </Button>
                </div>
                
                <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />Visual Analysis</CardTitle>
                        <CardDescription>Detected particles highlighted on your image.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-gray-900">
                            <Image src={analysis.imageDataUri} alt="Analyzed water sample" fill objectFit="contain" />
                             {result.particles.map((p, i) => (
                                <div key={i} className="absolute rounded-sm" style={{
                                    left: `${p.x * 100}%`,
                                    top: `${p.y * 100}%`,
                                    width: '10px', 
                                    height: '10px',
                                    transform: 'translate(-50%, -50%)',
                                    border: `2px solid hsl(var(--chart-${(i % 5) + 1}))`,
                                    opacity: p.confidence,
                                    boxShadow: `0 0 8px 2px hsl(var(--chart-${(i % 5) + 1}))`,
                                }}/>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                
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
                        <CardTitle className="flex items-center gap-2"><TestTube2 className="h-5 w-5" />Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Total Particles</span>
                            <Badge variant="default" className="text-lg">{result.particleCount}</Badge>
                        </div>
                        <Separator/>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Surface Contamination</span>
                             <Badge variant="secondary" className="text-base">{result.contaminationPercentage.toFixed(2)}%</Badge>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Analysis Details</CardTitle>
                        <CardDescription>A breakdown of the detected particles and their types.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="particle-types">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="particle-types">Particle Shapes</TabsTrigger>
                                <TabsTrigger value="polymer-types">Polymer Types</TabsTrigger>
                            </TabsList>
                            <TabsContent value="particle-types" className="pt-4">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false}/>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))'
                                            }}
                                        />
                                        <Bar dataKey="count" name="Count">
                                             {chartData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </TabsContent>
                            <TabsContent value="polymer-types" className="pt-4">
                                 <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={polymerChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))'
                                            }}
                                        />
                                        <Bar dataKey="count" name="Count">
                                             {polymerChartData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return null;
}
