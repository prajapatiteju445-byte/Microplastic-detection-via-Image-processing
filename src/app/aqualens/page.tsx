'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon } from 'lucide-react';

export default function AquaLensPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisComplete(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisComplete(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    // Simulate analysis process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">AquaLens</h1>
          <p className="text-blue-600">Advanced Water Sample Analysis</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Analysis */}
          <div className="space-y-8">
            {/* Upload Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Upload Image</h2>
              </div>
              <p className="text-gray-600 mb-6">Upload a water sample image to begin the analysis.</p>

              <div className="space-y-4">
                {/* File Input */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={triggerFileInput}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Choose File
                  </button>
                  <span className="text-gray-500">
                    {selectedFile ? selectedFile.name : 'No file chosen'}
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <p className="font-semibold text-blue-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-gray-500 text-sm">
                    PNG, JPG, or other image formats
                  </p>
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isAnalyzing}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Sample'}
                </button>
              </div>
            </div>

            {/* Analysis Results Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Analysis Results
              </h3>
              
              {analysisComplete ? (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Microplastics Detected</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• 12 microplastic particles identified</li>
                      <li>• Predominant type: Polyethylene fragments</li>
                      <li>• Concentration: 8.5 particles/mL</li>
                    </ul>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Summary: The sample shows moderate microplastic contamination typical of urban water sources.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {selectedFile 
                      ? 'Click "Analyze Sample" to see results' 
                      : 'Upload an image to begin analysis'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Visual Analysis */}
          <div className="space-y-8">
            {/* Visual Analysis Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                Visual Analysis
              </h3>
              
              <div className="bg-gray-100 rounded-xl p-8 text-center min-h-[300px] flex items-center justify-center">
                {analysisComplete ? (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-12 h-12 text-blue-600" />
                    </div>
                    <p className="font-semibold text-blue-800 mb-2">
                      Microplastic Particles Highlighted
                    </p>
                    <p className="text-gray-600 text-sm">
                      Red markers indicate detected microplastic particles in the sample
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500">
                      {selectedFile 
                        ? 'Awaiting Analysis' 
                        : 'Upload an image and click "Analyze Sample" to see the visual analysis'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
