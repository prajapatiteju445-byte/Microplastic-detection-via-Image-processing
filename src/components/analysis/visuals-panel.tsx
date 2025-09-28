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
        <Eye className="h-10 w-10 text-muted-foreground" />
    </div>
);

const LoadingState = () => (
     <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg min-h-[300px] bg-secondary animate-pulse">
        <Loader2 className="h-10 w-10 text-muted-foreground mb-4 animate-spin" />
        <p className="text-sm text-muted-foreground">Processing Image...</p>
    </div>
);


export default function VisualsPanel({ image, particles, isLoading, analysisResult }: VisualsPanelProps) {

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-row items-center gap-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <CardTitle>Visual Analysis</CardTitle>
                        <CardDescription>Highlighted microplastic particles in the sample.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? <LoadingState /> : !analysisResult || !image ? <EmptyState /> : (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                       {/* This will be shown when analysis is complete */}
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
