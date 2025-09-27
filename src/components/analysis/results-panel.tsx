'use client';

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
    Fragment: '#3b82f6',
    Fiber: '#22c55e',
    Film: '#eab308',
    Pellet: '#a855f7',
    Foam: '#f97316',
    Other: '#84cc16',
};

const POLYMER_TYPE_COLORS: { [key: string]: string } = {
    PE: '#ef4444',
    PP: '#f59e0b',
    PS: '#10b981',
    PET: '#06b6d4',
    PVC: '#6366f1',
    PA: '#d946ef',
    PU: '#ec4899',
    Other: '#8b5cf6',
};

export default function ResultsPanel({ analysisResult, particles, isLoading, isAnalyzing }: ResultsPanelProps) {
    const shapeChartData = analysisResult?.particleTypes?.map(pt => ({ name: pt.type, value: pt.count })) || [];
    const polymerChartData = analysisResult?.polymerTypes?.map(pt => ({ name: pt.type, value: pt.count })) || [];
    
    if (isLoading) {
        return (
             <div>
                <h2><FilePenLine />Analysis Results</h2>
                <p>Detected microplastics and a summary of the findings.</p>
                <Skeleton className="h-40 w-full" />
            </div>
        )
    }

    if (!analysisResult) {
        return (
            <div>
                <h2><FilePenLine />Analysis Results</h2>
                <p>Detected microplastics and a summary of the findings.</p>
                <div>
                    <TestTube2 />
                    <h3>Awaiting Analysis</h3>
                    <p>Upload an image and click "Analyze Sample" to see the results here.</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h2><FilePenLine />Analysis Results</h2>
            <p>Detected microplastics and a summary of the findings.</p>
            
            <div>
                <div>
                    <FlaskConical />
                    <p>{analysisResult.particleCount}</p>
                    <p>Total Particles</p>
                </div>
                <div>
                    <Percent />
                    <p>{analysisResult.contaminationPercentage.toFixed(2)}%</p>
                    <p>Contamination</p>
                </div>
                <div>
                    <Layers />
                    <p>~{((analysisResult.particleCount) / 0.5).toFixed(1)}</p>
                    <p>Particles/Liter</p>
                </div>
            </div>
            
            <div>
               {isAnalyzing ? (
                    <>
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    </>
               ) : (
                <>
                    {shapeChartData.length > 0 && (
                        <div>
                            <h3><Shapes />Particle Shape Distribution</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={shapeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8">
                                        {shapeChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PARTICLE_SHAPE_COLORS[entry.name] || '#8884d8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {polymerChartData.length > 0 && (
                        <div>
                            <h3><Atom/>Polymer Type Distribution</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={polymerChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8">
                                        {polymerChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={POLYMER_TYPE_COLORS[entry.name] || '#8884d8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </>
               )}
            </div>

            <div>
                <h3>AI Analysis Summary</h3>
               {isAnalyzing ? (
                    <div>
                        <Loader2 className="animate-spin"/> Generating summary...
                    </div>
               ) : (
                <div>{analysisResult.analysisSummary}</div>
               )}
            </div>
            
            <Button onClick={() => exportToCSV(particles)} variant="outline" disabled={particles.length === 0}>
                <Download />
                Export Results (CSV)
            </Button>
        </div>
    );
}
