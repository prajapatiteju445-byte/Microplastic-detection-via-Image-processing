'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye } from 'lucide-react';
import type { Particle } from '@/lib/types';
import type { AnalyzeUploadedImageOutput } from '@/ai/flows/analyze-uploaded-image';

type VisualsPanelProps = {
    image: string | null;
    particles: Particle[];
    isLoading: boolean;
    analysisResult: AnalyzeUploadedImageOutput | null;
};

const getParticleColor = (confidence: number) => {
    if (confidence > 0.9) return 'rgba(59, 130, 246, 0.9)'; // High confidence - blue
    if (confidence > 0.75) return 'rgba(34, 197, 94, 0.8)'; // Medium - green
    return 'rgba(234, 179, 8, 0.7)'; // Low - yellow
};

export default function VisualsPanel({ image, particles, isLoading, analysisResult }: VisualsPanelProps) {
    const hasResults = image && analysisResult && (analysisResult.particleCount > 0 || particles.length > 0);

    if (isLoading) {
        return (
            <Card className="shadow-2xl bg-card/80 backdrop-blur-sm border-border/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                        <Eye className="w-6 h-6 text-primary" />
                        Visual Analysis
                    </CardTitle>
                    <CardDescription>Highlighted microplastic particles in the sample.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full aspect-video rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    if (!hasResults) {
        return null;
    }

    return (
        <Card className="shadow-2xl bg-card/80 backdrop-blur-sm border-border/60">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <Eye className="w-6 h-6 text-primary" />
                    Visual Analysis
                </CardTitle>
                <CardDescription>Highlighted microplastic particles in the sample.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-primary/20 bg-black">
                    <Image src={image!} alt="Analyzed water sample" fill style={{ objectFit: 'contain' }} />
                    {particles.map((p, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full w-2 h-2 border border-white/50"
                            style={{
                                left: `${p.x * 100}%`,
                                top: `${p.y * 100}%`,
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: getParticleColor(p.confidence),
                                boxShadow: `0 0 6px 1px ${getParticleColor(p.confidence)}`,
                            }}
                            title={`Particle ${i + 1}\nConfidence: ${(p.confidence * 100).toFixed(1)}%`}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
