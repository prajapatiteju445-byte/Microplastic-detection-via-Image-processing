'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Loader2, UploadCloud, FileText, Eye, TestTube2 } from 'lucide-react';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, DocumentReference, DocumentData, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirebase, useMemoFirebase } from '@/firebase/provider';
import type { Analysis } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { processAnalysisQueue } from '@/ai/flows/process-analysis-queue';
import Image from 'next/image';

export default function Home() {
  const { toast } = useToast();
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { firestore } = useFirebase();
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useState<HTMLInputElement>(null);

  const analysisDocRef = useMemoFirebase(() => {
    if (!firestore || !analysisId) return null;
    return doc(firestore, 'analyses', analysisId) as DocumentReference<DocumentData>;
  }, [firestore, analysisId]);

  const { data: analysis, isLoading: isAnalysisLoading, error: analysisError } = useDoc<Analysis>(analysisDocRef);

  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const handleFile = (file: File) => {
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
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image || !user || isSubmitting || !firestore) {
      toast({ title: 'Error', description: 'Cannot start analysis. Ensure you have uploaded an image and are logged in.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(firestore, 'analyses'), {
        userId: user.uid,
        status: 'new',
        imageDataUri: image,
        createdAt: serverTimestamp(),
      });
      setAnalysisId(docRef.id);
      await processAnalysisQueue({ analysisId: docRef.id });
      toast({ title: 'Success', description: 'Your image has been submitted and is queued for analysis.' });
    } catch (error) {
      console.error("Failed to start analysis:", error);
      toast({ title: 'Submission Failed', description: 'Could not submit your image for analysis. Please try again.', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || !user) {
    return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p>Authenticating securely...</p>
            </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-secondary p-4 sm:p-6 lg:p-8">
      <Header />

      <main className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">

        {/* ===== LEFT COLUMN ===== */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>1. Upload Image</CardTitle>
              <CardDescription>Upload a water sample image to begin the analysis.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div 
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center cursor-pointer hover:border-primary/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                    className="hidden"
                />
                {image ? (
                   <div className="relative w-full h-48">
                      <Image src={image} alt="Uploaded sample" layout="fill" objectFit="contain" />
                   </div>
                ) : (
                  <>
                    <UploadCloud className="h-12 w-12 text-gray-400" />
                    <p className="mt-4 font-semibold text-gray-700">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG, or other image formats</p>
                  </>
                )}
              </div>
              <Button size="lg" className="w-full bg-gray-600 hover:bg-gray-700 text-white" onClick={handleAnalyze} disabled={!image || isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Analyze Sample
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Analysis Results Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription>Detected microplastics and a summary of the findings.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center text-gray-500 py-10">
              <TestTube2 className="h-12 w-12 mb-4" />
              <p className="font-semibold">Awaiting Analysis</p>
              <p className="text-sm">Upload an image and click "Analyze Sample" to see the results here.</p>
            </CardContent>
          </Card>
          
          {/* Visual Analysis Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Visual Analysis
              </CardTitle>
              <CardDescription>Highlighted microplastic particles in the sample.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 rounded-lg bg-gray-100 flex items-center justify-center">
                 <p className="text-sm text-gray-500">Analysis visualization appears here.</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}
