'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FlaskConical, TestTube2, Percent, Layers, Atom, Shapes, Loader2, FilePenLine } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Particle } from '@/lib/types';
import type { AnalyzeUploadedImageOutput } from '@/ai/flows/schemas/analyze-uploaded-image-schema';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const PARTICLE_SHAPE_COLORS: { [key: string]: string } = {
    Fragment: 'hsl(var(--chart-1))',
    Fiber: 'hsl(var(--chart-2))',
    Film: 'hsl(var(--chart-3))',
    Pellet: 'hsl(var(--chart-4))',
    Foam: 'hsl(var(--chart-5))',
    Other: '#84cc16',
};

const POLYMER_TYPE_COLORS: { [key: string]: string } = {
    PE: 'hsl(var(--chart-1))',
    PP: 'hsl(var(--chart-2))',
    PS: 'hsl(var(--chart-3))',
    PET: 'hsl(var(--chart-4))',
    PA: 'hsl(var(--chart-5))',
    Other: '#8b5cf6',
};

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[240px] border-2 border-dashed rounded-lg bg-secondary/50">
        <TestTube2 className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Awaiting Analysis</h3>
        <p className="text-sm text-muted-foreground max-w-xs">Upload an image and click "Analyze Sample" to see the results here.</p>
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
        <Card className="shadow-sm bg-background">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FilePenLine className="h-5 w-5" />
                    Analysis Results
                </CardTitle>
                <CardDescription>Detected microplastics and a summary of the findings.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? <LoadingState /> : !analysisResult ? <EmptyState /> : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                            <div className="p-4 rounded-lg bg-secondary/50">
                                <FlaskConical className="h-6 w-6 mx-auto text-primary mb-2" />
                                <p className="text-2xl font-bold">{analysisResult.particleCount}</p>
                                <p className="text-xs text-muted-foreground">Total Particles</p>
                            </div>
                            <div className="p-4 rounded-lg bg-secondary/50">
                                <Percent className="h-6 w-6 mx-auto text-primary mb-2" />
                                <p className="text-2xl font-bold">{analysisResult.contaminationPercentage.toFixed(2)}%</p>
                                <p className="text-xs text-muted-foreground">Contamination</p>
                            </div>
                            <div className="p-4 rounded-lg bg-secondary/50 col-span-2 sm:col-span-1">
                                <Layers className="h-6 w-6 mx-auto text-primary mb-2" />
                                <p className="text-2xl font-bold">~{((analysisResult.particleCount) / 0.5).toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">Particles/Liter (Est.)</p>
                            </div>
                        </div>
                        
                        <div>
                           {isAnalyzing ? (
                                <div className="flex flex-col gap-4">
                                  <Skeleton className="h-24 w-full" />
                                  <Skeleton className="h-24 w-full" />
                                </div>
                           ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {shapeChartData.length > 0 && (
                                    <div className="flex flex-col items-center">
                                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Shapes className="h-4 w-4"/>Particle Shapes</h3>
                                        <ResponsiveContainer width="100%" height={150}>
                                            <PieChart>
                                                <Pie data={shapeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                                                    {shapeChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={PARTICLE_SHAPE_COLORS[entry.name] || '#8884d8'} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius)' }} />
                                                <Legend iconSize={10} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                {polymerChartData.length > 0 && (
                                    <div className="flex flex-col items-center">
                                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Atom className="h-4 w-4"/>Polymer Types</h3>
                                        <ResponsiveContainer width="100%" height={150}>
                                            <PieChart>
                                                <Pie data={polymerChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                                                    {polymerChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={POLYMER_TYPE_COLORS[entry.name] || '#8884d8'} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius)' }} />
                                                <Legend iconSize={10} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                           )}
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold">AI Analysis Summary</h3>
                           {isAnalyzing ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin"/> Generating summary...
                                </div>
                           ) : (
                            <p className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg">{analysisResult.analysisSummary}</p>
                           )}
                        </div>
                        
                        <Button onClick={() => exportToCSV(particles)} variant="outline" disabled={particles.length === 0} className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Export Results (CSV)
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
