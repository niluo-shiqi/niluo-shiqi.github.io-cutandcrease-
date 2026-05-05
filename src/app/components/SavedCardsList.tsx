import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FolderHeart, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import type { PersistedState } from '../types';

interface SavedCard {
  id: string;
  savedAt: string;
  thumbnail: string | null;
  cardText: string;
}

const STORAGE_KEY = 'crease_canvas_state';
const CARDS_KEY   = 'crease_canvas_saved_cards';

function loadCards(): SavedCard[] {
  try {
    const raw = localStorage.getItem(CARDS_KEY);
    return raw ? (JSON.parse(raw) as SavedCard[]) : [];
  } catch {
    return [];
  }
}

function saveCards(cards: SavedCard[]) {
  try { localStorage.setItem(CARDS_KEY, JSON.stringify(cards)); } catch { /* quota */ }
}

function getCurrentCard(): SavedCard | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as Partial<PersistedState>;
    if (!state.uploadedImage && (!state.layers || state.layers.length === 0)) return null;
    return {
      id: Date.now().toString(),
      savedAt: new Date().toLocaleDateString(),
      thumbnail: state.uploadedImage ?? null,
      cardText: state.cardData?.text ?? 'Untitled Card',
    };
  } catch {
    return null;
  }
}

export function SavedCardsList() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<SavedCard[]>(loadCards);

  useEffect(() => { saveCards(cards); }, [cards]);

  const addCurrentCard = () => {
    const card = getCurrentCard();
    if (!card) return;
    setCards(prev => [card, ...prev]);
  };

  const removeCard = (id: string) => setCards(prev => prev.filter(c => c.id !== id));

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-gray-900 flex items-center gap-3">
              <FolderHeart className="w-8 h-8 text-rose-400" />
              My Cards
            </h1>
            <p className="text-gray-500 mt-1">Your saved pop-up card designs</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={addCurrentCard}>
              Save current card
            </Button>
            <Button onClick={() => navigate('/create')}>
              <Plus className="w-4 h-4 mr-2" />
              New card
            </Button>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-rose-50 p-8 rounded-full mb-6">
              <FolderHeart className="w-16 h-16 text-rose-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No saved cards yet</h2>
            <p className="text-gray-500 mb-6 max-w-sm">
              Design a pop-up card in the Create section, then save it here to come back to later.
            </p>
            <Button onClick={() => navigate('/create')}>Start creating</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {cards.map(card => (
              <div
                key={card.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
                  {card.thumbnail ? (
                    <img src={card.thumbnail} alt={card.cardText} className="w-full h-full object-contain p-2" />
                  ) : (
                    <FolderHeart className="w-12 h-12 text-gray-300" />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium text-gray-900 truncate text-sm">{card.cardText}</p>
                  <p className="text-xs text-gray-400 mt-1">Saved {card.savedAt}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => navigate('/create/editor')}>
                      Open
                    </Button>
                    <Button size="sm" variant="ghost" className="p-2" onClick={() => removeCard(card.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
