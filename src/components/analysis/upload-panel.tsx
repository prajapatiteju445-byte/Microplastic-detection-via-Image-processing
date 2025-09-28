'use client';

import { useState, useCallback, DragEvent, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase/provider';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { processAnalysisQueue } from '@/ai/flows/process-analysis-queue';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

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

        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, [toast]);


    const handleAnalyze = async () => {
        // This function will be implemented later to handle the analysis process.
        // For now, it will just show a toast.
        toast({
            title: 'Analysis Started',
            description: 'Your image is being analyzed. This is a placeholder.',
        });
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

    const canAnalyze = image && !isSubmitting;

    return (
        <Card>
            <CardHeader>
                <CardTitle>1. Upload Image</CardTitle>
                <CardDescription>Upload a water sample image to begin the analysis.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    className={cn(
                        "flex flex-col items-center justify-center w-full min-h-[20rem] border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors",
                        isDragging && "border-primary bg-primary/10"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        id="file-upload"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center text-muted-foreground">
                        <UploadCloud className="w-12 h-12 mb-4" />
                        <p className="mb-2 text-md">
                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs">PNG, JPG, or other image formats</p>
                    </div>
                </div>
                <div>
                    <Button variant="secondary" size="lg" onClick={handleAnalyze} disabled={!canAnalyze} className="w-full font-bold text-base bg-gray-600 hover:bg-gray-700 text-white">
                        Analyze Sample
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
