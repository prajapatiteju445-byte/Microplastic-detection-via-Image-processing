'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Eye, TestTube2, Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase/provider';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';
import AnalysisView from '@/components/analysis/analysis-view';
import Header from '@/components/layout/header';

export default function Home() {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { firestore, user } = useFirebase();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (file.size > 4.5 * 1024 * 1024) { // 4.5MB limit
        setError('File is too large. Please select an image under 4.5MB.');
        setImageFile(null);
      } else {
        setError(null);
        setImageFile(file);
        // Reset the file input so the same file can be selected again
        if(fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFileChange(file || null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFileChange(file || null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleAnalyze = async () => {
    if (!imageFile || !firestore || !user) {
      setError('Please select a file and ensure you are logged in.');
      return;
    }
    
    setIsUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = async () => {
        const imageDataUri = reader.result as string;
        const analysesCollection = collection(firestore, 'analyses');
        
        const newAnalysisDoc = await addDocumentNonBlocking(analysesCollection, {
          userId: user.uid,
          status: 'new',
          imageDataUri: imageDataUri,
          createdAt: new Date(),
        });
        
        setAnalysisId(newAnalysisDoc.id);
        setIsUploading(false);
      };
      reader.onerror = () => {
          throw new Error("Could not read file for analysis.");
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred during upload.');
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setAnalysisId(null);
    setImageFile(null);
    setError(null);
    setIsUploading(false);
  };

  if (isClient && analysisId) {
    return (
        <div className="min-h-screen w-full bg-secondary">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <AnalysisView analysisId={analysisId} onReset={handleReset}/>
            </main>
        </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-secondary">
        <Header />
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-3">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-xl">1. Upload Image</CardTitle>
                            <CardDescription>Upload a water sample image to begin the analysis.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-center">
                             <div 
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center cursor-pointer hover:border-primary transition-colors bg-background"
                            >
                                <UploadCloud className="h-10 w-10 text-gray-400 mb-4" />
                                {imageFile ? (
                                    <p className="font-semibold text-primary">{imageFile.name}</p>
                                ): (
                                    <>
                                        <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
                                        <p className="text-sm text-muted-foreground mt-1">PNG, JPG, or other image formats (max 4.5MB)</p>
                                    </>
                                )}
                            </div>
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                                ref={fileInputRef}
                            />
                             {error && <p className="text-sm font-medium text-destructive text-center mt-4">{error}</p>}
                             <div className="text-center mt-4 text-sm text-muted-foreground">
                                {imageFile ? (
                                    <span>Selected: <span className="font-medium text-foreground">{imageFile.name}</span></span>
                                ) : (
                                    <span>No file chosen</span>
                                )}
                            </div>
                        </CardContent>
                        <div className="p-6 pt-0">
                             <Button 
                                size="lg" 
                                className="w-full text-lg py-6" 
                                onClick={handleAnalyze} 
                                disabled={!imageFile || isUploading}
                            >
                                {isUploading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                {isUploading ? 'Uploading...' : 'Analyze Sample'}
                            </Button>
                        </div>
                    </Card>
                </div>
                
                {/* Right Column */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TestTube2 className="h-5 w-5 text-muted-foreground"/>
                                Analysis Results
                            </CardTitle>
                            <CardDescription>Detected microplastics and a summary of the findings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 bg-muted/50 rounded-lg">
                                <TestTube2 className="h-10 w-10 mb-4 text-gray-400" />
                                <p className="font-semibold text-foreground/90">Awaiting Analysis</p>
                                <p className="text-sm mt-1">Upload an image and click "Analyze Sample" to see results.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-muted-foreground"/>
                                Visual Analysis
                           </CardTitle>
                            <CardDescription>Highlighted microplastic particles in the sample.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 bg-muted/50 rounded-lg">
                                <Eye className="h-10 w-10 mb-4 text-gray-400" />
                                <p className="font-semibold text-foreground/90">Awaiting Analysis</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    </div>
  );
}
