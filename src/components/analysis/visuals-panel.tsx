'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Loader2 } from 'lucide-react';
import type { Particle } from '@/lib/types';
import type { AnalyzeUploadedImageOutput } from '@/ai/flows/schemas/analyze-uploaded-image-schema';

type VisualsPanelProps = {
    image: string | null;
    particles: Particle[];
    isLoading: boolean;
    analysisResult: AnalyzeUploadedImageOutput | null;
};

export default function VisualsPanel({ image, particles, isLoading, analysisResult }: VisualsPanelProps) {
    const getParticleColor = useCallback((confidence: number) => {
        if (confidence > 0.9) return 'rgba(96, 165, 250, 0.9)'; // High confidence - blue-400
        if (confidence > 0.75) return 'rgba(74, 222, 128, 0.8)'; // Medium - green-400
        return 'rgba(251, 191, 36, 0.7)'; // Low - amber-400
    }, []);

    if (isLoading) {
        return (
            <Card className="shadow-sm bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-foreground" />
                        Visual Analysis
                    </CardTitle>
                    <CardDescription>Highlighted microplastic particles in the sample.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center w-full aspect-video rounded-xl border-2 border-dashed border-border/50 bg-background/20">
                         <div className="text-center text-muted-foreground/60">
                            <Loader2 className="h-12 w-12 mx-auto mb-2 text-primary/50 animate-spin" />
                            <p className="text-sm">Analyzing image...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (!analysisResult) {
         return (
            <Card className="shadow-sm bg-card">
                <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-foreground" />
                        Visual Analysis
                    </CardTitle>
                    <CardDescription>Highlighted microplastic particles in the sample.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center w-full aspect-video rounded-xl border-2 border-dashed border-border/50 bg-background/20">
                         <div className="text-center text-muted-foreground/60">
                            <Eye className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-sm mt-2 text-muted-foreground/80">Analysis visualization appears here.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="shadow-sm bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-foreground" />
                    Visual Analysis
                </CardTitle>
                <CardDescription>Highlighted microplastic particles in the sample.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-primary/10 bg-background">
                    <Image src={image!} alt="Analyzed water sample" fill style={{ objectFit: 'contain' }} />
                    {particles.map((p, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full w-2.5 h-2.5 border border-white/50"
                            style={{
                                left: `${p.x * 100}%`,
                                top: `${p.y * 100}%`,
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: getParticleColor(p.confidence),
                                boxShadow: `0 0 8px 3px ${getParticleColor(p.confidence)}`,
                                transition: 'all 0.3s ease',
                            }}
                            title={`Particle ${i + 1}\nConfidence: ${(p.confidence * 100).toFixed(1)}%`}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
