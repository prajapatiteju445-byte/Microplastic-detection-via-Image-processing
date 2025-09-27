'use client';

import { useCallback } from 'react';
import Image from 'next/image';
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
        if (confidence > 0.9) return 'rgba(96, 165, 250, 0.9)'; // High confidence
        if (confidence > 0.75) return 'rgba(74, 222, 128, 0.8)'; // Medium
        return 'rgba(251, 191, 36, 0.7)'; // Low
    }, []);

    if (isLoading) {
        return (
            <div>
                <h2><Eye />Visual Analysis</h2>
                <p>Highlighted microplastic particles in the sample.</p>
                <div>
                    <Loader2 className="animate-spin" />
                    <p>Analyzing image...</p>
                </div>
            </div>
        );
    }
    
    if (!analysisResult) {
         return (
            <div>
                 <h2><Eye />Visual Analysis</h2>
                <p>Highlighted microplastic particles in the sample.</p>
                <div>
                    <Eye />
                    <p>Analysis visualization appears here.</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h2><Eye />Visual Analysis</h2>
            <p>Highlighted microplastic particles in the sample.</p>
            <div style={{position: 'relative', width: '100%', aspectRatio: '16/9'}}>
                <Image src={image!} alt="Analyzed water sample" fill style={{ objectFit: 'contain' }} />
                {particles.map((p, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: `${p.x * 100}%`,
                            top: `${p.y * 100}%`,
                            transform: 'translate(-50%, -50%)',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: getParticleColor(p.confidence),
                            boxShadow: `0 0 8px 3px ${getParticleColor(p.confidence)}`,
                        }}
                        title={`Confidence: ${(p.confidence * 100).toFixed(1)}%`}
                    />
                ))}
            </div>
        </div>
    );
}
