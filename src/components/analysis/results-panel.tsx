'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FlaskConical, BarChart3, TestTube2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import type { Particle } from '@/lib/types';

type ResultsPanelProps = {
    image: string | null;
    analysisResult: string | null;
    particles: Particle[];
    isLoading: boolean;
};

const exportToCSV = (particles: Particle[]) => {
    const headers = 'x_coordinate,y_coordinate,confidence';
    const rows = particles.map(p => `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.confidence.toFixed(4)}`);
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows.join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'aqualens_analysis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const getParticleColor = (confidence: number) => {
    if (confidence > 0.9) return 'rgba(59, 130, 246, 0.9)'; // High confidence - blue
    if (confidence > 0.75) return 'rgba(34, 197, 94, 0.8)'; // Medium - green
    return 'rgba(234, 179, 8, 0.7)'; // Low - yellow
};

export default function ResultsPanel({ image, analysisResult, particles, isLoading }: ResultsPanelProps) {
    const hasResults = image && analysisResult && particles.length > 0;

    return (
        <Card className="h-full flex flex-col bg-card/50 border-border/50 shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    2. Analysis Results
                </CardTitle>
                <CardDescription>Detected microplastics and summary.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="w-full aspect-video rounded-lg" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : hasResults ? (
                    <>
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-secondary/20">
                            <Image src={image} alt="Analyzed water sample" fill style={{ objectFit: 'contain' }} />
                            {particles.map((p, i) => (
                                <div
                                    key={i}
                                    className="absolute rounded-full w-2.5 h-2.5 border-2 border-white/80"
                                    style={{
                                        left: `${p.x * 100}%`,
                                        top: `${p.y * 100}%`,
                                        transform: 'translate(-50%, -50%)',
                                        backgroundColor: getParticleColor(p.confidence),
                                        boxShadow: `0 0 8px 2px ${getParticleColor(p.confidence)}`,
                                    }}
                                    title={`Particle ${i + 1}\nConfidence: ${(p.confidence * 100).toFixed(1)}%`}
                                />
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-secondary/50 rounded-lg border">
                                <FlaskConical className="mx-auto h-7 w-7 text-primary mb-2" />
                                <p className="text-3xl font-bold">{particles.length}</p>
                                <p className="text-sm text-muted-foreground">Particles Detected</p>
                            </div>
                            <div className="p-4 bg-secondary/50 rounded-lg border">
                                <BarChart3 className="mx-auto h-7 w-7 text-green-500 mb-2" />
                                <p className="text-3xl font-bold">~{(particles.length / 0.5).toFixed(1)}</p>
                                <p className="text-sm text-muted-foreground">Particles/Liter (Est.)</p>
                            </div>
                        </div>
                        
                        <h3 className="font-semibold mt-2 text-base">AI Analysis Summary</h3>
                        <ScrollArea className="h-32 p-3 border rounded-md bg-secondary/50 text-sm">
                            <pre className="whitespace-pre-wrap font-sans">{analysisResult}</pre>
                        </ScrollArea>
                        
                        <Button onClick={() => exportToCSV(particles)} className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Export Results (CSV)
                        </Button>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center text-muted-foreground/80 p-8 border-2 border-dashed rounded-lg bg-secondary/20">
                        <TestTube2 className="h-16 w-16 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">Awaiting Analysis</h3>
                        <p className="text-sm mt-1">Upload an image and click "Analyze Sample" to see the results here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
