'use client';

import { useState, useCallback, DragEvent } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { analyzeImageAction } from '@/app/actions';
import type { Particle } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AnalyzeUploadedImageOutput } from '@/ai/flows/analyze-uploaded-image';

type UploadPanelProps = {
    setImage: (image: string | null) => void;
    setAnalysisResult: (result: AnalyzeUploadedImageOutput | null) => void;
    setParticles: (particles: Particle[]) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    isLoading: boolean;
    image: string | null;
    resetState: () => void;
};

export default function UploadPanel({
    setImage,
    setAnalysisResult,
    setParticles,
    setIsLoading,
    setError,
    isLoading,
    image,
    resetState,
}: UploadPanelProps) {
    const { toast } = useToast();
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = useCallback((file: File) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Invalid File Type',
                description: 'Please upload an image file (PNG, JPG, etc.).',
                variant: 'destructive',
            });
            return;
        }

        resetState();
        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, [setImage, toast, resetState]);

    const onDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            handleFile(event.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const onDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const handleAnalyze = async () => {
        if (!image) return;

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setParticles([]);

        const result = await analyzeImageAction(image);

        if (result.success && result.data) {
            setAnalysisResult(result.data);
            setParticles(result.data.particles);

            toast({
                title: 'Analysis Complete',
                description: `${result.data.particleCount} particles detected.`,
            });
        } else {
            setError(result.error || 'An unknown error occurred.');
            toast({
                title: 'Analysis Failed',
                description: result.error || 'Please try again.',
                variant: 'destructive',
            });
            setAnalysisResult(null);
            setParticles([]);
        }
        setIsLoading(false);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            handleFile(event.target.files[0]);
        }
    };

    return (
        <Card className="h-full flex flex-col bg-card/50 border-border/20 shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    1. Upload Image
                </CardTitle>
                <CardDescription>Upload a water sample image to begin the analysis.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center gap-6 p-6">
                {image ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-primary/20 shadow-inner bg-secondary/20">
                        <Image src={image} alt="Water sample preview" fill style={{ objectFit: 'contain' }} />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 z-10 rounded-full h-8 w-8 opacity-70 hover:opacity-100 transition-opacity"
                            onClick={() => { resetState(); (document.getElementById('file-upload') as HTMLInputElement).value = ''; }}
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove image</span>
                        </Button>
                    </div>
                ) : (
                    <div
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        className={cn(
                            'w-full h-64 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-center p-4 transition-colors',
                            isDragging ? 'border-primary bg-primary/10' : 'border-border/50'
                        )}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer space-y-2 flex flex-col items-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, or other image formats</p>
                        </label>
                    </div>
                )}

                <Button onClick={handleAnalyze} disabled={!image || isLoading} className="w-full text-lg py-6 shadow-md hover:shadow-lg transition-shadow" size="lg">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Microscope className="mr-2 h-5 w-5" />
                            Analyze Sample
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
