'use client';

import { useState, useCallback, DragEvent, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        if (!image || !firestore || !user) {
            toast({
                title: 'Services Not Ready',
                description: 'The application is still initializing or you are not logged in. Please wait a moment and try again.',
                variant: 'destructive',
            });
            setIsSubmitting(false);
            return;
        };

        setIsSubmitting(true);
        toast({
            title: 'Sample Submitted',
            description: 'Your image has been queued for analysis. This may take a moment.',
        });

        try {
            const initialAnalysisData = {
                userId: user.uid,
                imageDataUri: image,
                status: 'new' as const,
                createdAt: serverTimestamp(),
            };
            
            const analysesCollection = collection(firestore, 'analyses');
            const docRef = await addDoc(analysesCollection, initialAnalysisData);
            setAnalysisId(docRef.id);
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
        <div>
            <h2>1. Upload Image</h2>
            <p>Upload a water sample image to begin the analysis.</p>
            
            {image ? (
                <div>
                    <img src={image} alt="Water sample preview" style={{ objectFit: 'contain', width: '100%', height: '100px' }} />
                    <Button
                        variant="destructive"
                        size="icon"
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
                >
                    <input
                        type="file"
                        id="file-upload"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                    <label htmlFor="file-upload">
                        <UploadCloud />
                        <p>
                            <span>Click to upload</span> or drag and drop
                        </p>
                        <p>PNG, JPG, or other image formats</p>
                    </label>
                </div>
            )}

            <Button onClick={handleAnalyze} disabled={!canAnalyze} size="lg">
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    "Analyze Sample"
                )}
            </Button>
        </div>
    );
}
