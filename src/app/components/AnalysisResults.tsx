import { Button } from './ui/button';
import { X, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisResultsProps {
  imageUrl:      string;
  onRemoveImage: () => void;
  onProceed?:    () => void;
}

export function AnalysisResults({ imageUrl, onRemoveImage, onProceed }: AnalysisResultsProps) {
  const handleRemove = () => {
    onRemoveImage();
    toast.info('Image removed. Upload a new one to continue.');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Your Design</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
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
        <button
          onClick={handleRemove}
          className="absolute top-6 right-6 bg-white/90 hover:bg-red-50 border border-gray-200 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          title="Remove image"
        >
          <X className="w-4 h-4 text-red-500" />
        </button>
      </div>

      <Button className="w-full" size="lg" onClick={onProceed}>
        Proceed to Editor
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <button
        onClick={handleRemove}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
      >
        <X className="w-4 h-4" />
        Start over with a different image
      </button>
    </div>
  );
}
