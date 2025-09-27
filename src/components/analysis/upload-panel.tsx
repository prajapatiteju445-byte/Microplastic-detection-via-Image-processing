'use client';

import { useState, useCallback, DragEvent, useRef } from 'react';
import { UploadCloud, X, Loader2, Microscope, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase/provider';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { processAnalysisQueue } from '@/ai/flows/process-analysis-queue';

type UploadPanelProps = {
    setAnalysisId: (id: string) => void;
};

export default function UploadPanel({ setAnalysisId }: UploadPanelProps) {
    const { toast } = useToast();
    const { firestore, user, isUserLoading, areServicesAvailable } = useFirebase();

    const [image, setImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        setImage(null);
        setIsSubmitting(false);
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
        
        // Limit file size to ~4.4MB to be safe with base64 encoding overhead
        if (file.size > 4.4 * 1024 * 1024) {
             toast({
                title: 'Image Too Large',
                description: 'Please upload an image smaller than 4MB.',
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
        // Final safeguard: Check all dependencies right before the operation.
        if (!image || !firestore || !user) {
            toast({
                title: 'Services Not Ready',
                description: 'The application is still initializing or you are not logged in. Please wait a moment and try again.',
                variant: 'destructive',
            });
            setIsSubmitting(false); // Ensure button is re-enabled if clicked too early
            return;
        };

        setIsSubmitting(true);
        toast({
            title: 'Sample Submitted',
            description: 'Your image has been queued for analysis. This may take a moment.',
        });

        try {
            // 1. Create the initial analysis document in Firestore with 'new' status.
            const initialAnalysisData = {
                userId: user.uid,
                imageDataUri: image,
                status: 'new' as const,
                createdAt: serverTimestamp(),
            };
            
            const analysesCollection = collection(firestore, 'analyses');
            const docRef = await addDoc(analysesCollection, initialAnalysisData);

            // 2. Immediately update the UI to show the analysis view.
            setAnalysisId(docRef.id);
            
            // 3. Trigger the background processing flow and DO NOT wait for it.
            // This is "fire-and-forget"
            processAnalysisQueue({ analysisId: docRef.id });

        } catch(e) {
            const error = e instanceof Error ? e.message : 'An unknown error occurred';
            toast({
                title: 'Submission Failed',
                description: `Could not queue analysis: ${error}`,
                variant: 'destructive',
            });
            setIsSubmitting(false);
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

    const canAnalyze = image && !isSubmitting && areServicesAvailable && !isUserLoading;

    return (
        <Card className="h-full flex flex-col bg-card/50 border-border/20 shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <FileUp className="w-6 h-6 text-primary" />
                    Submit a Sample
                </CardTitle>
                <CardDescription>Upload a water sample image to begin the analysis.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center gap-6 p-6">
                {image ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-primary/20 shadow-inner bg-secondary/20">
                        <img src={image} alt="Water sample preview" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 z-10 rounded-full h-8 w-8 opacity-70 hover:opacity-100 transition-opacity"
                            onClick={resetState}
                            disabled={isSubmitting}
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
                            <p className="text-xs text-muted-foreground">PNG, JPG, or other image formats (Max 4MB)</p>
                        </label>
                    </div>
                )}

                <Button onClick={handleAnalyze} disabled={!canAnalyze} className="w-full text-lg py-6 shadow-md hover:shadow-lg transition-shadow" size="lg">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Submitting...
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
