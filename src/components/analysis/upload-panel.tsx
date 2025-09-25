'use client';

import { useState, useCallback, DragEvent, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2, Microscope, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';
import { analyzeUploadedImage } from '@/ai/flows/analyze-uploaded-image';

type UploadPanelProps = {
    setAnalysisId: (id: string) => void;
};

export default function UploadPanel({ setAnalysisId }: UploadPanelProps) {
    const { toast } = useToast();
    const { firestore, user } = useFirebase();

    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        setImage(null);
        setIsLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

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
    }, [resetState, toast]);


    const handleAnalyze = async () => {
        if (!image || !firestore || !user) {
            toast({
                title: 'Error',
                description: 'Could not submit analysis. Firebase not ready or user not authenticated.',
                variant: 'destructive',
            });
            return;
        };

        setIsLoading(true);
        toast({
            title: 'Sample Submitted',
            description: 'Your image is now being analyzed. This may take a moment.',
        });

        try {
            // 1. Call the server action to perform the heavy lifting first
            const analysisResult = await analyzeUploadedImage({ imageDataUri: image });

            // 2. Once analysis is complete, create the document with the full results
            const finalAnalysisData = {
                userId: user.uid,
                imageDataUri: image,
                status: 'complete' as const,
                result: analysisResult,
                createdAt: serverTimestamp(),
                completedAt: serverTimestamp(),
            };
            
            const analysesCollection = collection(firestore, 'analyses');
            const docRefPromise = addDocumentNonBlocking(analysesCollection, finalAnalysisData);
            
            docRefPromise.then(docRef => {
                if (docRef) {
                    setAnalysisId(docRef.id);
                } else {
                     throw new Error("Failed to create analysis document in Firestore.");
                }
            }).catch(e => {
                 const error = e instanceof Error ? e.message : 'An unknown error occurred during Firestore write.';
                 toast({
                    title: 'Analysis Failed',
                    description: `Could not save analysis results: ${error}`,
                    variant: 'destructive',
                });
                setIsLoading(false);
            })

        } catch(e) {
            const error = e instanceof Error ? e.message : 'An unknown error occurred';
            toast({
                title: 'Analysis Failed',
                description: `Could not complete analysis: ${error}`,
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };
    

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

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            handleFile(event.target.files[0]);
        }
    };

    return (
        <Card className="h-full flex flex-col bg-card/50 border-border/20 shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <FileUp className="w-6 h-6 text-primary" />
                    Upload Image
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
                            onClick={resetState}
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
                            ref={fileInputRef}
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
