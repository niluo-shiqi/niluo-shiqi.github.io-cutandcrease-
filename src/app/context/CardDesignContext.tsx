import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Layer, AnalysisResult, CardData, Mechanism, ElementVariant, PersistedState } from '../types';
import { analyzeImage } from '../services/analyzeImage';

const STORAGE_KEY = 'crease_canvas_state';

const DEFAULT_CARD: CardData = {
  background: '#fef9ef',
  foreground: '#1a1a1a',
  text: 'Happy Birthday!',
  subtext: 'Wishing you a wonderful day',
};

const DEFAULT_LAYER: Layer = {
  id: 1,
  name: 'Base Layer',
  depth: 50,
  height: 65,
  width: 70,
  opacity: 100,
  verticalPosition: 50,
  tabWidth: 50,
  tabHeight: 50,
  tabDepth: 50,
  color: '#6366f1',
  selected: false,
};

function loadSaved(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : {};
  } catch {
    return {};
  }
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface CardDesignContextValue {
  uploadedImage: string | null;
  analysisData: AnalysisResult | null;
  isAnalyzing: boolean;
  layers: Layer[];
  mechanism: Mechanism;
  designElement: ElementVariant | null;
  cardData: CardData;

  setUploadedImage: (img: string | null) => void;
  setAnalysisData: (d: AnalysisResult | null) => void;
  setIsAnalyzing: (v: boolean) => void;
  setLayers: (layers: Layer[]) => void;
  setMechanism: (m: Mechanism) => void;
  setDesignElement: (e: ElementVariant | null) => void;
  setCardData: (d: CardData) => void;

  handleImageUpload: (url: string) => Promise<void>;
  handleReset: () => void;
}

const CardDesignContext = createContext<CardDesignContextValue | null>(null);

export function useCardDesign(): CardDesignContextValue {
  const ctx = useContext(CardDesignContext);
  if (!ctx) throw new Error('useCardDesign must be used inside CardDesignProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CardDesignProvider({ children }: { children: React.ReactNode }) {
  const saved = loadSaved();

  const [uploadedImage, setUploadedImage]   = useState<string | null>(saved.uploadedImage ?? null);
  const [analysisData, setAnalysisData]     = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing]       = useState(false);
  const [layers, setLayers]                 = useState<Layer[]>(saved.layers ?? [DEFAULT_LAYER]);
  const [mechanism, setMechanism]           = useState<Mechanism>((saved.mechanism as Mechanism) ?? 'v-fold');
  const [designElement, setDesignElement]   = useState<ElementVariant | null>(null);
  const [cardData, setCardData]             = useState<CardData>(saved.cardData ?? DEFAULT_CARD);

  // Debounced localStorage save
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persist = useCallback((patch: Partial<PersistedState>) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const cur = loadSaved();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...cur, ...patch }));
      } catch { /* quota exceeded */ }
    }, 800);
  }, []);

  useEffect(() => {
    persist({ uploadedImage, layers, cardData, mechanism });
  }, [uploadedImage, layers, cardData, mechanism, persist]);

  const FALLBACK: AnalysisResult = {
    colors: ['#f87171', '#60a5fa', '#4ade80'],
    complexity: 'Medium',
    style: 'Illustrated design',
    suggestedUses: ['Birthday Card', 'Thank You Card', 'Greeting Card'],
  };

  const handleImageUpload = useCallback(async (url: string) => {
    setUploadedImage(url);
    setIsAnalyzing(true);
    try {
      setAnalysisData(await analyzeImage(url));
    } catch {
      setAnalysisData(FALLBACK);
    } finally {
      setIsAnalyzing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = useCallback(() => {
    setUploadedImage(null);
    setAnalysisData(null);
    setIsAnalyzing(false);
    setLayers([{ ...DEFAULT_LAYER }]);
    setMechanism('v-fold');
    setDesignElement(null);
    setCardData(DEFAULT_CARD);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <CardDesignContext.Provider value={{
      uploadedImage, analysisData, isAnalyzing, layers, mechanism, designElement, cardData,
      setUploadedImage, setAnalysisData, setIsAnalyzing, setLayers, setMechanism, setDesignElement, setCardData,
      handleImageUpload, handleReset,
    }}>
      {children}
    </CardDesignContext.Provider>
  );
}
