import { useNavigate } from 'react-router';
import { BookOpen, Wand2, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'crease_canvas_state';

function getSavedThumbnail(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    return typeof state.uploadedImage === 'string' ? state.uploadedImage : null;
  } catch {
    return null;
  }
}

export function HomePage() {
  const navigate   = useNavigate();
  const savedThumb = getSavedThumbnail();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-12 border-4 border-gray-900">

        {/* Wordmark */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif mb-3">
            <span className="text-gray-900">Crease &amp; </span>
            <span className="inline-block">
              <span className="text-purple-500">C</span>
              <span className="text-orange-400">a</span>
              <span className="text-yellow-400">n</span>
              <span className="text-green-400">v</span>
              <span className="text-blue-400">a</span>
              <span className="text-red-400">s</span>
            </span>
          </h1>
          <p className="text-blue-600 text-lg">A one stop shop for all your pop-up card needs!</p>
        </div>

        {/* CTA cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Learn track */}
          <button
            onClick={() => navigate('/learn')}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl border-3 border-gray-900 hover:shadow-xl transition-all duration-200 hover:scale-105 text-left"
          >
            <div className="bg-blue-100 p-8 rounded-2xl border-3 border-gray-900 self-stretch flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-gray-900 stroke-[2.5]" />
            </div>
            <div>
              <span className="block font-semibold text-gray-900 text-lg text-center">Learn pop-up techniques</span>
              <span className="block text-sm text-gray-500 mt-1 text-center">Step-by-step guides for 6 mechanisms</span>
            </div>
          </button>

          {/* Create track */}
          <button
            onClick={() => navigate('/create')}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl border-3 border-gray-900 hover:shadow-xl transition-all duration-200 hover:scale-105 text-left"
          >
            <div className="bg-pink-100 p-8 rounded-2xl border-3 border-gray-900 self-stretch flex items-center justify-center">
              <Wand2 className="w-16 h-16 text-gray-900 stroke-[2.5]" />
            </div>
            <div>
              <span className="block font-semibold text-gray-900 text-lg text-center">Start creating</span>
              <span className="block text-sm text-gray-500 mt-1 text-center">Upload an image or pick a design element</span>
            </div>
          </button>
        </div>

        {/* Resume in-progress card */}
        {savedThumb && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Resume last card</h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-14 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0 bg-gray-50">
                <img src={savedThumb} alt="Saved card" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">You have an unfinished card. Pick up where you left off.</p>
                <button
                  onClick={() => navigate('/create/editor')}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Continue editing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
