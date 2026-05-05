import { Button } from './ui/button';
import { X, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { toast } from 'sonner';
import type { AnalysisResult } from '../types';

interface AnalysisResultsProps {
  imageUrl:     string;
  analysisData: AnalysisResult | null;
  isAnalyzing:  boolean;
  onRemoveImage: () => void;
  onProceed?:   () => void;
}

export function AnalysisResults({
  imageUrl,
  analysisData,
  isAnalyzing,
  onRemoveImage,
  onProceed,
}: AnalysisResultsProps) {
  const handleRemove = () => {
    onRemoveImage();
    toast.info('Image removed. Upload a new one to continue.');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Uploaded image */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Your Design</h2>
            <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove image
            </Button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 relative group">
            <img
              src={imageUrl}
              alt="Uploaded design"
              className="w-full h-auto rounded-lg shadow-md"
            />
            {/* ×-button on the thumbnail */}
            <button
              onClick={handleRemove}
              className="absolute top-6 right-6 bg-white/90 hover:bg-red-50 border border-gray-200 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              title="Remove image"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
            Start over with a different image
          </button>
        </div>

        {/* Analysis */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Design Analysis</h2>

          {isAnalyzing ? (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-gray-600">Analysing your design…</p>
              </div>
            </Card>
          ) : analysisData ? (
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Colour Palette</h3>
                <div className="flex gap-2 flex-wrap">
                  {analysisData.colors.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-lg shadow-md border-2 border-white" style={{ backgroundColor: color }} />
                      <span className="text-xs text-gray-600 font-mono">{color}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Design Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Style:</span>
                    <span className="font-medium">{analysisData.style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Complexity:</span>
                    <span className="font-medium">{analysisData.complexity}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <h3 className="font-semibold text-gray-900">Suggested Card Types</h3>
                </div>
                <div className="space-y-2">
                  {analysisData.suggestedUses.map((use, idx) => (
                    <button
                      key={idx}
                      onClick={onProceed}
                      className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-gray-800 transition-colors text-sm"
                    >
                      {use}
                    </button>
                  ))}
                </div>
              </Card>

              <Button className="w-full" size="lg" onClick={onProceed}>
                Generate Pop-Up Card
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
