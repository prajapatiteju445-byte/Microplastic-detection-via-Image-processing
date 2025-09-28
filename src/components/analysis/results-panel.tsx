'use client';

import { Button } from '@/components/ui/button';
import { Download, FlaskConical, TestTube2, Percent, Layers, Atom, Shapes, Loader2, FilePenLine } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Particle } from '@/lib/types';
import type { AnalyzeUploadedImageOutput } from '@/ai/flows/schemas/analyze-uploaded-image-schema';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

type ResultsPanelProps = {
    analysisResult: AnalyzeUploadedImageOutput | null;
    particles: Particle[];
    isLoading: boolean;
    isAnalyzing?: boolean;
};

const exportToCSV = (particles: Particle[]) => {
    const headers = 'x_coordinate,y_coordinate,confidence,class';
    const rows = particles.map(p => `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.confidence.toFixed(4)},${p.class}`);
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows.join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'aqualens_analysis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[15rem] text-muted-foreground">
        <TestTube2 className="h-10 w-10 mb-4" />
        <h4 className="text-lg font-semibold text-foreground">Awaiting Analysis</h4>
        <p className="text-sm mt-1">Upload an image and click "Analyze Sample" to see the results here.</p>
    </div>
);

const LoadingState = () => (
    <div className="space-y-6 p-4">
        <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
    </div>
);

export default function ResultsPanel({ analysisResult, particles, isLoading, isAnalyzing }: ResultsPanelProps) {
    const shapeChartData = analysisResult?.particleTypes?.map(pt => ({ name: pt.type, value: pt.count })) || [];
    const polymerChartData = analysisResult?.polymerTypes?.map(pt => ({ name: pt.type, value: pt.count })) || [];
    
    return (
        <Card>
            <CardHeader>
                 <div className="flex flex-row items-center gap-3">
                    <FilePenLine className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <CardTitle>Analysis Results</CardTitle>
                        <CardDescription>Detected microplastics and a summary of the findings.</CardDescription>
                    </div>
                 </div>
            </CardHeader>
            <CardContent>
                {isLoading ? <LoadingState /> : !analysisResult ? <EmptyState /> : (
                    <div className="space-y-6">
                        {/* ... content for when analysis is complete ... */}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
