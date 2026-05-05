import { useNavigate } from 'react-router';
import { Upload, Palette } from 'lucide-react';

export function CreateLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-gray-900 mb-3">Create a Pop-Up Card</h1>
          <p className="text-gray-500 text-lg">Choose how to begin your design</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload path */}
          <button
            onClick={() => navigate('/create/upload')}
            className="group flex flex-col items-center gap-5 p-10 bg-white rounded-2xl border-2 border-gray-200 hover:border-pink-400 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="bg-pink-100 p-6 rounded-2xl group-hover:bg-pink-200 transition-colors">
              <Upload className="w-14 h-14 text-pink-600" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Start from your image</h2>
              <p className="text-sm text-gray-500">Upload a drawing or photo to use as a design element</p>
            </div>
          </button>

          {/* Browse elements path */}
          <button
            onClick={() => navigate('/create/elements')}
            className="group flex flex-col items-center gap-5 p-10 bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="bg-purple-100 p-6 rounded-2xl group-hover:bg-purple-200 transition-colors">
              <Palette className="w-14 h-14 text-purple-600" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Browse design elements</h2>
              <p className="text-sm text-gray-500">Pick from 12 ready-made themes with style variants</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
