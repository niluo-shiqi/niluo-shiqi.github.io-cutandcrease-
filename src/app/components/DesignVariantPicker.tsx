import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { ELEMENT_THEMES } from '../../assets/elements/manifest';
import { useCardDesign } from '../context/CardDesignContext';
import type { Layer } from '../types';

export function DesignVariantPicker() {
  const { themeId }     = useParams<{ themeId: string }>();
  const navigate        = useNavigate();
  const { setLayers, setDesignElement } = useCardDesign();

  const theme = ELEMENT_THEMES.find(t => t.id === themeId);
  if (!theme) return <div className="p-8 text-gray-500">Theme not found.</div>;

  const handleVariantClick = (variantIndex: number) => {
    const variant = theme.variants[variantIndex];
    setDesignElement(variant);

    // Pre-populate a single layer using this variant's image as imageData
    const layer: Layer = {
      id: 1,
      name: `${theme.label} — ${variant.label}`,
      depth: 50,
      height: 65,
      width: 70,
      opacity: 100,
      verticalPosition: 50,
      color: '#6366f1',
      selected: true,
      imageData: variant.src,
    };
    setLayers([layer]);

    navigate('/create/editor');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <main className="max-w-5xl mx-auto px-8 py-12">
        <Button variant="ghost" onClick={() => navigate('/create/elements')} className="mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to themes
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className={`${theme.bgColor} p-4 rounded-xl`}>
            <theme.icon className={`w-10 h-10 ${theme.color}`} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-serif text-gray-900">{theme.label}</h1>
            <p className="text-gray-500 mt-0.5">Click a variant to open it in the editor</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {theme.variants.map((variant, idx) => (
            <button
              key={variant.id}
              onClick={() => handleVariantClick(idx)}
              className="group bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all duration-200 hover:scale-[1.04] overflow-hidden"
            >
              <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 group-hover:bg-purple-50 transition-colors">
                <img
                  src={variant.src}
                  alt={variant.label}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-3 text-center">
                <span className="text-sm font-medium text-gray-900">{variant.label}</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
