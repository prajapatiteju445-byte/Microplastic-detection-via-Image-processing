'use client';

import { useState, useRef } from 'react';

export default function AquaLens() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">AquaLens</h1>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1: Upload Image */}
          <section>
            <h2 className="text-xl font-bold text-black mb-3">1. Upload Image</h2>
            <p className="text-gray-700 mb-6">Upload a water sample image to begin the analysis.</p>
            
            <hr className="border-gray-300 my-6" />
            
            <div className="text-center space-y-4">
              <div 
                onClick={triggerFileInput}
                className="cursor-pointer hover:bg-gray-50 py-4"
              >
                <p className="font-bold text-black mb-1">
                  <strong>Click to upload</strong> or drag and drop
                </p>
                <p className="text-gray-600 text-sm">
                  PNG, JPG, or other image formats
                </p>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            <hr className="border-gray-300 my-6" />
          </section>

          {/* Section 2: Analyze Sample Button */}
          <section>
            <button className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Analyze Sample
            </button>
            
            <hr className="border-gray-300 my-6" />
          </section>

          {/* Section 3: Analysis Results */}
          <section>
            <h3 className="text-lg font-bold text-black mb-4">Analysis Results</h3>
            <p className="text-gray-700 mb-4">
              Detected microplastics and a summary of the findings.
            </p>
            
            <hr className="border-gray-300 my-6" />
            
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <h4 className="font-semibold text-gray-800 mb-2">Awaiting Analysis</h4>
              <p className="text-gray-600 text-sm">
                Upload an image and click "Analyze Sample" to see the results here.
              </p>
            </div>
            
            <hr className="border-gray-300 my-6" />
          </section>

          {/* Section 4: Visual Analysis */}
          <section>
            <h3 className="text-lg font-bold text-black mb-4">Visual Analysis</h3>
            <p className="text-gray-700">
              Highlighted microplastic particles in the sample.
            </p>
            
            <hr className="border-gray-300 my-6" />
            
            <div className="bg-gray-100 rounded-lg p-8 text-center min-h-[200px] flex items-center justify-center">
              <p className="text-gray-600">
                Visual analysis will appear here
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}