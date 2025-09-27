'use client';

import { useState, useCallback, DragEvent, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { UploadCloud, X, Loader2, Microscope, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase/provider';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { processAnalysisQueue } from '@/ai/flows/process-analysis-queue';
import Image from 'next/image';

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
        if (!image || !firestore || !user) {
            toast({
                title: 'Services Not Ready',
                description: 'The application is still initializing or you are not logged in. Please wait a moment and try again.',
                variant: 'destructive',
            });
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
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-0">
                {image ? (
                    <div className="relative group">
                        <div className="relative w-full h-80 rounded-t-xl overflow-hidden border-b">
                          <Image src={image} alt="Water sample preview" layout="fill" objectFit="contain" />
                        </div>
                        <div className="absolute top-3 right-3 z-10">
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={resetState}
                                disabled={isSubmitting}
                                className="h-8 w-8 rounded-full shadow-md"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove image</span>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-xl cursor-pointer bg-secondary/50 hover:bg-secondary/70 transition-colors",
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
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                            <div className="p-4 bg-primary/10 text-primary rounded-full mb-4">
                                <ImageIcon className="w-10 h-10" />
                            </div>
                            <p className="mb-2 text-lg text-foreground font-semibold">
                                Drag & drop your image here
                            </p>
                            <p className="text-sm text-muted-foreground">or <span className="text-primary font-semibold">click to browse</span></p>
                             <p className="mt-4 text-xs text-muted-foreground">PNG, JPG, or other image formats (Max 4MB)</p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4">
                <Button size="lg" onClick={handleAnalyze} disabled={!canAnalyze} className="w-full font-semibold text-base shadow-md">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Submitting for Analysis...
                        </>
                    ) : (
                        "Analyze Sample"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
