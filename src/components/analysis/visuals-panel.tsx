'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import { Eye, Loader2 } from 'lucide-react';
import type { Particle } from '@/lib/types';
import type { AnalyzeUploadedImageOutput } from '@/ai/flows/schemas/analyze-uploaded-image-schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

type VisualsPanelProps = {
    image: string | null;
    particles: Particle[];
    isLoading: boolean;
    analysisResult: AnalyzeUploadedImageOutput | null;
};

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[15rem]">
        <Eye className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Visual Analysis</h3>
        <p className="text-sm text-muted-foreground mt-1">Analysis visualization appears here.</p>
    </div>
);

const LoadingState = () => (
     <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg min-h-[300px] bg-secondary animate-pulse">
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
        <Card>
            <CardHeader>
                <div className="flex flex-row items-center gap-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <CardTitle className="text-lg">Visual Analysis</CardTitle>
                        <CardDescription>Highlighted microplastic particles in the sample.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? <LoadingState /> : !analysisResult || !image ? <EmptyState /> : (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
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
