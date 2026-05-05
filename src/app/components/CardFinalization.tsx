import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Download, Printer, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useCardDesign } from '../context/CardDesignContext';
import type { Layer, CardData } from '../types';

// ─── SVG template ─────────────────────────────────────────────────────────────

function generateSvgTemplate(layers: Layer[], cardData: CardData): string {
  const W = 210, H = 148, foldX = W / 2;

  const layerRects = layers.map((layer, i) => {
    const lw  = (layer.width  / 100) * (W / 2 - 20);
    const lh  = (layer.height / 100) * (H - 40);
    const lx  = foldX - lw / 2;
    const ly  = H / 2 - lh / 2;
    const tabH = 8;
    return `
  <!-- Layer ${i + 1}: ${layer.name} -->
  <rect x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" width="${lw.toFixed(1)}" height="${lh.toFixed(1)}"
        fill="none" stroke="${layer.color}" stroke-width="0.5" stroke-dasharray="4 2"/>
  <rect x="${lx.toFixed(1)}" y="${(ly - tabH).toFixed(1)}" width="${lw.toFixed(1)}" height="${tabH}"
        fill="none" stroke="#888" stroke-width="0.4" stroke-dasharray="2 2"/>
  <text x="${(lx + lw / 2).toFixed(1)}" y="${(ly + lh / 2).toFixed(1)}"
        text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="5" fill="#999">${layer.name}</text>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">
  <rect width="${W}" height="${H}" fill="white" stroke="#ddd" stroke-width="0.5"/>
  <line x1="${foldX}" y1="0" x2="${foldX}" y2="${H}" stroke="#333" stroke-width="1" stroke-dasharray="6 3"/>
  <text x="${foldX}" y="6" text-anchor="middle" font-family="sans-serif" font-size="4" fill="#555">FOLD</text>
  <text x="5" y="8" font-family="sans-serif" font-size="4" fill="#e55">— cut</text>
  <text x="5" y="14" font-family="sans-serif" font-size="4" fill="#55e">- - fold</text>
  <text x="${foldX / 2}" y="${H - 4}" text-anchor="middle" font-family="sans-serif" font-size="5" fill="#aaa">BACK PANEL</text>
  <text x="${foldX + foldX / 2}" y="${H - 4}" text-anchor="middle" font-family="sans-serif" font-size="5" fill="#aaa">FRONT PANEL</text>
${layerRects}
  <text x="${foldX + foldX / 2}" y="${H / 2 - 10}" text-anchor="middle"
        font-family="serif" font-size="8" fill="${cardData.foreground}">${cardData.text}</text>
  <text x="${foldX + foldX / 2}" y="${H / 2 + 4}" text-anchor="middle"
        font-family="sans-serif" font-size="5" fill="${cardData.foreground}">${cardData.subtext}</text>
</svg>`;
}

// ─── 2D preview ───────────────────────────────────────────────────────────────

function CardPreview2D({ layers, cardData, isOpen }: { layers: Layer[]; cardData: CardData; isOpen: boolean }) {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[4/3]" style={{ perspective: 900 }}>
      <motion.div
        className="absolute inset-0 rounded-lg shadow-xl flex items-end justify-center pb-4"
        style={{ backgroundColor: cardData.background, transformOrigin: '50% 100%', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
        animate={{ rotateX: isOpen ? -45 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <span className="text-xs text-gray-400 select-none">Back panel</span>
      </motion.div>
      <motion.div
        className="absolute inset-0 rounded-lg shadow-xl flex flex-col items-center justify-center gap-2 overflow-hidden"
        style={{ backgroundColor: cardData.background, transformOrigin: '50% 0%', transformStyle: 'preserve-3d' }}
        animate={{ rotateX: isOpen ? 45 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <p className="text-2xl font-serif font-bold" style={{ color: cardData.foreground }}>{cardData.text}</p>
        <p className="text-sm opacity-70" style={{ color: cardData.foreground }}>{cardData.subtext}</p>
        {isOpen && (
          <div className="flex gap-1 mt-2">
            {layers.map((l, i) => (
              <motion.div
                key={l.id}
                className="rounded-sm shadow"
                style={{ backgroundColor: l.color, width: `${(l.width / 100) * 60}px`, height: `${(l.height / 100) * 40}px`, opacity: l.opacity / 100 }}
                initial={{ scaleY: 0, originY: 1 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CardFinalization() {
  const navigate = useNavigate();
  const { layers, cardData, setCardData } = useCardDesign();
  const [isOpen, setIsOpen] = useState(false);
  const svgRef = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<CardData>) => setCardData({ ...cardData, ...patch });

  const downloadSvg = () => {
    const svg  = generateSvgTemplate(layers, cardData);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'popup-card-template.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const printTemplate = () => {
    const svg = generateSvgTemplate(layers, cardData);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Pop-Up Card Template</title>
<style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh}svg{max-width:100%;height:auto}</style>
</head><body>${svg}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const downloadPng = () => {
    const svgStr = generateSvgTemplate(layers, cardData);
    const img    = new Image();
    const blob   = new Blob([svgStr], { type: 'image/svg+xml' });
    const url    = URL.createObjectURL(blob);
    img.onload   = () => {
      const canvas  = document.createElement('canvas');
      canvas.width  = 1240;
      canvas.height = 874;
      const ctx     = canvas.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const a    = document.createElement('a');
      a.href     = canvas.toDataURL('image/png');
      a.download = 'popup-card-template.png';
      a.click();
    };
    img.src = url;
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <main className="max-w-6xl mx-auto px-8 py-10 space-y-10">
        <Button variant="ghost" onClick={() => navigate('/create/editor')} className="-ml-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Layer Editor
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: preview */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Card Preview</h2>
            <CardPreview2D layers={layers} cardData={cardData} isOpen={isOpen} />
            <Button className="w-full" variant="outline" onClick={() => setIsOpen(o => !o)}>
              {isOpen ? 'Close Card' : 'Open Card'}
            </Button>
            <p className="text-xs text-gray-400 text-center">Click to see the pop-up card open and close</p>
          </div>

          {/* Right: customise + download */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Card Message</h2>
              <div className="space-y-1">
                <Label>Main Text</Label>
                <Input value={cardData.text}    onChange={e => update({ text: e.target.value })}    placeholder="Happy Birthday!" />
              </div>
              <div className="space-y-1">
                <Label>Sub-text</Label>
                <Input value={cardData.subtext} onChange={e => update({ subtext: e.target.value })} placeholder="Wishing you a wonderful day" />
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Card Colours</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Background', key: 'background' as const },
                  { label: 'Text Colour', key: 'foreground' as const },
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-1">
                    <Label>{label}</Label>
                    <div className="flex gap-2">
                      <input type="color" value={cardData[key]} onChange={e => update({ [key]: e.target.value })}
                             className="w-10 h-9 rounded cursor-pointer border border-gray-200 p-0.5" />
                      <Input value={cardData[key]} onChange={e => update({ [key]: e.target.value })} className="font-mono text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Pop-Up Layers ({layers.length})</h2>
              <div className="space-y-2">
                {layers.map(l => (
                  <div key={l.id} className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: l.color }} />
                    <span className="flex-1">{l.name}</span>
                    <span className="text-gray-400 text-xs">depth {l.depth}%</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 space-y-3" ref={svgRef}>
              <h2 className="text-xl font-semibold text-gray-900">Download &amp; Print</h2>
              <p className="text-sm text-gray-500">Download the cut-and-fold template to make your card.</p>
              <div className="grid grid-cols-1 gap-3">
                <Button className="w-full justify-start gap-2" onClick={downloadSvg}>
                  <Download className="w-4 h-4" />
                  Download SVG Template
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={downloadPng}>
                  <ImageIcon className="w-4 h-4" />
                  Download PNG Template
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={printTemplate}>
                  <Printer className="w-4 h-4" />
                  Print Template
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex justify-center pt-4 pb-10">
          <Button variant="ghost" onClick={() => navigate('/')}>Start a New Card</Button>
        </div>
      </main>
    </div>
  );
}
