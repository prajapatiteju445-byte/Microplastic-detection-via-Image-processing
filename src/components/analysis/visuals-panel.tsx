'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import { Eye, Loader2 } from 'lucide-react';
import type { Particle } from '@/lib/types';
import type { AnalyzeUploadedImageOutput } from '@/ai/flows/schemas/analyze-uploaded-image-schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

type VisualsPanelProps = {
    image: string | null;
    particles: Particle[];
    isLoading: boolean;
    analysisResult: AnalyzeUploadedImageOutput | null;
};

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[240px] border-2 border-dashed rounded-lg bg-card">
        <Eye className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Visual Analysis</h3>
        <p className="text-sm text-muted-foreground">Highlighted microplastic particles in the sample.</p>
    </div>
);

const LoadingState = () => (
     <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg h-48 bg-secondary/50 animate-pulse">
        <Loader2 className="h-10 w-10 text-muted-foreground mb-4 animate-spin" />
        <p className="text-sm text-muted-foreground">Processing Image...</p>
    </div>
);


export default function VisualsPanel({ image, particles, isLoading, analysisResult }: VisualsPanelProps) {
    const getParticleColor = useCallback((confidence: number) => {
        if (confidence > 0.9) return 'rgba(239, 68, 68, 0.8)'; // High confidence - red
        if (confidence > 0.75) return 'rgba(234, 179, 8, 0.8)'; // Medium - yellow
        return 'rgba(34, 197, 94, 0.7)'; // Low - green
    }, []);

    return (
        <Card className="shadow-sm bg-background">
            <CardHeader className="flex flex-row items-center gap-2">
                <Eye className="h-5 w-5" />
                <div>
                    <CardTitle>Visual Analysis</CardTitle>
                    <CardDescription>Highlighted microplastic particles in the sample.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? <LoadingState /> : !analysisResult || !image ? <EmptyState /> : (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-primary/20 shadow-inner">
                        <Image src={image!} alt="Analyzed water sample" layout="fill" objectFit="contain" />
                        {particles.map((p, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    left: `${p.x * 100}%`,
                                    top: `${p.y * 100}%`,
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: getParticleColor(p.confidence),
                                    border: '2px solid rgba(255, 255, 255, 0.9)',
                                    transform: 'translate(-50%, -50%)',
                                    boxShadow: `0 0 8px 3px ${getParticleColor(p.confidence)}`,
                                }}
                                title={`Class: ${p.class}\nConfidence: ${(p.confidence * 100).toFixed(1)}%`}
                            />
                        ))}
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
