'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FlaskConical, TestTube2, Percent, Layers, Atom, Shapes } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import type { Particle } from '@/lib/types';
import type { AnalyzeUploadedImageOutput } from '@/ai/flows/analyze-uploaded-image';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ResultsPanelProps = {
    analysisResult: AnalyzeUploadedImageOutput | null;
    particles: Particle[];
    isLoading: boolean;
};

const exportToCSV = (particles: Particle[]) => {
    const headers = 'x_coordinate,y_coordinate,confidence';
    const rows = particles.map(p => `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.confidence.toFixed(4)}`);
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
    Fragment: '#3b82f6', // blue-500
    Fiber: '#22c55e',    // green-500
    Film: '#eab308',     // yellow-500
    Pellet: '#a855f7',   // purple-500
    Foam: '#f97316',     // orange-500
    Other: '#84cc16',    // lime-500
};

const POLYMER_TYPE_COLORS: { [key: string]: string } = {
    PE: '#ef4444',   // red-500
    PP: '#f59e0b',   // amber-500
    PS: '#10b981',   // emerald-500
    PET: '#06b6d4',  // cyan-500
    PVC: '#6366f1',  // indigo-500
    PA: '#d946ef',   // fuchsia-500
    PU: '#ec4899',   // pink-500
    Other: '#8b5cf6',// violet-500
};

export default function ResultsPanel({ analysisResult, particles, isLoading }: ResultsPanelProps) {
    const shapeChartData = analysisResult?.particleTypes?.map(pt => ({ name: pt.type, value: pt.count })) || [];
    const polymerChartData = analysisResult?.polymerTypes?.map(pt => ({ name: pt.type, value: pt.count })) || [];

    return (
        <Card className="h-full flex flex-col shadow-2xl bg-card/80 backdrop-blur-sm border-border/60">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <TestTube2 className="w-6 h-6 text-primary" />
                    Analysis Results
                </CardTitle>
                <CardDescription>Detected microplastics and summary.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <Skeleton className="h-24 w-full rounded-lg" />
                            <Skeleton className="h-24 w-full rounded-lg" />
                            <Skeleton className="h-24 w-full rounded-lg" />
                        </div>
                        <Skeleton className="h-40 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                ) : analysisResult ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                                <FlaskConical className="mx-auto h-7 w-7 text-primary mb-2" />
                                <p className="text-3xl font-bold">{analysisResult.particleCount}</p>
                                <p className="text-sm text-muted-foreground">Total Particles</p>
                            </div>
                            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                                <Percent className="mx-auto h-7 w-7 text-green-400 mb-2" />
                                <p className="text-3xl font-bold">{analysisResult.contaminationPercentage.toFixed(2)}%</p>
                                <p className="text-sm text-muted-foreground">Contamination</p>
                            </div>
                            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                                <Layers className="mx-auto h-7 w-7 text-yellow-400 mb-2" />
                                <p className="text-3xl font-bold">~{(analysisResult.particleCount / 0.5).toFixed(1)}</p>
                                <p className="text-sm text-muted-foreground">Particles/Liter</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            {shapeChartData.length > 0 && (
                                <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                                    <h3 className="font-semibold text-base mb-2 text-center flex items-center justify-center gap-2"><Shapes className="w-5 h-5 text-primary"/>Particle Shape Distribution</h3>
                                    <ResponsiveContainer width="100%" height={150}>
                                        <PieChart>
                                            <Pie data={shapeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" labelLine={false}>
                                                {shapeChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PARTICLE_SHAPE_COLORS[entry.name] || '#8884d8'} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}/>
                                            <Legend iconSize={10} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                             {polymerChartData.length > 0 && (
                                <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                                    <h3 className="font-semibold text-base mb-2 text-center flex items-center justify-center gap-2"><Atom className="w-5 h-5 text-primary"/>Polymer Type Distribution</h3>
                                    <ResponsiveContainer width="100%" height={150}>
                                        <PieChart>
                                            <Pie data={polymerChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" labelLine={false}>
                                                {polymerChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={POLYMER_TYPE_COLORS[entry.name] || '#8884d8'} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }} />
                                            <Legend iconSize={10}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-background/50 rounded-lg border border-border/50 h-full">
                            <h3 className="font-semibold text-base mb-2">AI Analysis Summary</h3>
                            <ScrollArea className="h-32">
                                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-muted-foreground whitespace-pre-wrap font-sans">{analysisResult.analysisSummary}</div>
                            </ScrollArea>
                        </div>
                        
                        <Button onClick={() => exportToCSV(particles)} className="w-full" variant="outline" disabled={particles.length === 0}>
                            <Download className="mr-2 h-4 w-4" />
                            Export Results (CSV)
                        </Button>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center text-muted-foreground/60 p-8 border-2 border-dashed border-border/50 rounded-xl bg-background/20">
                        <TestTube2 className="h-16 w-16 mb-4 text-primary/50" />
                        <h3 className="text-lg font-semibold text-foreground/80">Awaiting Analysis</h3>
                        <p className="text-sm mt-1">Upload an image and click "Analyze Sample" to see the results here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
