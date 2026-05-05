import { ArrowLeft, Heart, Flower2, Star, Cake, Gift, Sun, Moon, Cloud, TreePine, Sparkles, Music } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import type { Design, View } from '../types';

const inspirationItems: Design[] = [
  { id: 1,  name: 'Hearts',        icon: Heart,    color: 'text-red-400',    bgColor: 'bg-red-50'    },
  { id: 2,  name: 'Flowers',       icon: Flower2,  color: 'text-pink-400',   bgColor: 'bg-pink-50'   },
  { id: 3,  name: 'Stars',         icon: Star,     color: 'text-yellow-400', bgColor: 'bg-yellow-50' },
  { id: 4,  name: 'Birthday Cake', icon: Cake,     color: 'text-purple-400', bgColor: 'bg-purple-50' },
  { id: 5,  name: 'Gift Box',      icon: Gift,     color: 'text-blue-400',   bgColor: 'bg-blue-50'   },
  { id: 6,  name: 'Sun',           icon: Sun,      color: 'text-orange-400', bgColor: 'bg-orange-50' },
  { id: 7,  name: 'Moon',          icon: Moon,     color: 'text-indigo-400', bgColor: 'bg-indigo-50' },
  { id: 8,  name: 'Clouds',        icon: Cloud,    color: 'text-sky-400',    bgColor: 'bg-sky-50'    },
  { id: 9,  name: 'Trees',         icon: TreePine, color: 'text-green-400',  bgColor: 'bg-green-50'  },
  { id: 10, name: 'Sparkles',      icon: Sparkles, color: 'text-yellow-300', bgColor: 'bg-yellow-50' },
  { id: 11, name: 'Music Notes',   icon: Music,    color: 'text-violet-400', bgColor: 'bg-violet-50' },
  { id: 12, name: 'Hearts Stack',  icon: Heart,    color: 'text-rose-400',   bgColor: 'bg-rose-50'   },
];

interface InspirationGalleryProps {
  onNavigate: (view: View) => void;
  onDesignSelect: (design: Design) => void;
}

export function InspirationGallery({ onNavigate, onDesignSelect }: InspirationGalleryProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => onNavigate('home')}
            className="text-4xl font-serif tracking-wide text-gray-900 hover:opacity-80 transition-opacity mb-2"
          >
            Crease and Canvas
          </button>
          <p className="text-gray-600">Browse design inspiration for your pop-up cards</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => onNavigate('home')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">Design Inspiration</h2>
          <p className="text-gray-600">Choose a design element to create your pop-up card</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {inspirationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`
                relative bg-white rounded-xl p-8 border-2 transition-all duration-200
                hover:shadow-xl hover:scale-105
                ${selectedId === item.id
                  ? 'border-blue-500 ring-4 ring-blue-100'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className={`${item.bgColor} rounded-lg p-6 mb-4`}>
                <item.icon className={`w-16 h-16 mx-auto ${item.color}`} strokeWidth={1.5} />
              </div>
              <h3 className="font-medium text-gray-900 text-center">{item.name}</h3>
            </button>
          ))}
        </div>

        {selectedId !== null && (
          <div className="mt-12 flex justify-center">
            <Button
              size="lg"
              className="px-12"
              onClick={() => {
                const design = inspirationItems.find(d => d.id === selectedId);
                if (design) onDesignSelect(design);
              }}
            >
              Use This Design
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
