import { useNavigate } from 'react-router';
import { BookOpen } from 'lucide-react';

const MECHANISMS = [
  {
    id: 'basic-tab',
    name: 'Basic Tab Pop-Up',
    difficulty: 'Beginner' as const,
    description: 'Simple tab cut from the card itself — perfect for single centred elements.',
    emoji: '📄',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800',
  },
  {
    id: 'v-fold',
    name: 'V-Fold Pop-Up',
    difficulty: 'Beginner' as const,
    description: 'A folded tab glued at the spine creates a strong standing element in the centre.',
    emoji: '🔺',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-green-100 text-green-800',
  },
  {
    id: 'parallel-fold',
    name: 'Parallel Fold',
    difficulty: 'Intermediate' as const,
    description: 'Multiple tabs at different depths produce layered 3D scenes.',
    emoji: '📚',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  {
    id: 'box-fold',
    name: 'Box Pop-Up',
    difficulty: 'Intermediate' as const,
    description: 'A scored cross-shaped template folds into a 3D box when the card opens.',
    emoji: '📦',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  {
    id: 'rotating',
    name: 'Rotating Mechanism',
    difficulty: 'Advanced' as const,
    description: 'Linked paper arms cause design elements to spin as the card opens.',
    emoji: '🌀',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-red-100 text-red-800',
  },
  {
    id: 'accordion',
    name: 'Accordion Fold',
    difficulty: 'Advanced' as const,
    description: 'Zigzag folded strip attached at both ends extends dramatically on opening.',
    emoji: '🪗',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-red-100 text-red-800',
  },
];

export function LearnPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-7 h-7 text-blue-600" />
          <h1 className="text-3xl font-serif text-gray-900">Pop-Up Techniques</h1>
        </div>
        <p className="text-gray-500 mb-10 ml-10">
          Learn how each mechanism works before you start building.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MECHANISMS.map(m => (
            <button
              key={m.id}
              onClick={() => navigate(`/learn/${m.id}`)}
              className={`group text-left bg-white rounded-xl border-2 ${m.border} p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]`}
            >
              <div className={`${m.bg} w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                {m.emoji}
              </div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-lg font-semibold text-gray-900">{m.name}</h2>
                <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${m.badge}`}>
                  {m.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{m.description}</p>
              <span className="block mt-4 text-xs font-medium text-blue-600 group-hover:underline">
                View instructions →
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
