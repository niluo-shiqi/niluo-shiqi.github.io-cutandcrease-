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

// ─── 3D model constants (must match v-fold.ts) ────────────────────────────────
const CW = 8;   // CARD_W
const CH = 5;   // CARD_H

// ─── Print template generator ─────────────────────────────────────────────────
//
// Layout (US Letter landscape, 11" × 8.5"):
//
//  ┌─ margin ──────────────────────────────────────────────────── margin ─┐
//  │  BACK PANEL (inside face)      │  FRONT PANEL (inside face)         │
//  │  ┌──────────────────────────┐  ┃  ┌──────────────────────────────┐  │
//  │  │  [glue guide L1]         │  ┃  │                              │  │
//  │  │  [glue guide L2]         │  ┃  │                              │  │
//  │  └──────────────────────────┘  ┃  └──────────────────────────────┘  │
//  │                                ┃ ←spine (score+fold)                │
//  │  ─ ─ ─ cut pieces below ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
//  │  ┌────────┐ ┌───────────────┐  ┌────────┐ ┌───────────────┐         │
//  │  │ TAB L1 │ │  ELEMENT L1   │  │ TAB L2 │ │  ELEMENT L2   │         │
//  │  │ BASE   │ │  (image/rect) │  │  ...   │ │  ...          │         │
//  │  │- - - - │ │               │  │        │ │               │         │
//  │  │ WALL   │ │               │  │        │ │               │         │
//  │  └────────┘ └───────────────┘  └────────┘ └───────────────┘         │
//  └───────────────────────────────────────────────────────────────── legend┘
//
// Solid lines = cut.   Dashed lines = score / fold.
//
function generatePrintTemplate(layers: Layer[]): string {
  // ── Physical page (mm, landscape US Letter) ──────────────────────────────
  const PW = 279.4;   // 11" in mm
  const PH = 215.9;   // 8.5" in mm
  const M  = 6.35;    // 0.25" safe-area margin

  // ── Scale: map 3D units → mm (uniform, constrained by panel width) ───────
  const panelW = (PW - 2 * M) / 2;   // each panel's physical width in mm
  const SC     = panelW / CW;         // mm per 3D unit  (≈16.67 mm/unit)
  const panelH = CH * SC;             // physical panel height in mm  (≈83.4 mm)

  // ── Layout positions ──────────────────────────────────────────────────────
  const foldX    = PW / 2;            // x of the central spine / fold line
  const panelTop = M + 12;            // y of panel top (12 mm for header labels)
  const panelBot = panelTop + panelH;
  const bpX      = M;                 // back-panel left x
  const fpX      = foldX;             // front-panel left x

  const piecesY  = panelBot + 18;     // top y of the cut-pieces section
  const pieceGap = 4;                 // gap between tab piece and element piece (mm)
  const layerGap = 7;                 // extra gap between successive layers (mm)

  // ── SVG helper mini-utils ─────────────────────────────────────────────────
  const fp  = (n: number) => n.toFixed(2);
  const CUT  = `fill="none" stroke="#111111" stroke-width="0.5"`;
  const FOLD = `fill="none" stroke="#111111" stroke-width="0.35" stroke-dasharray="3 1.5"`;
  const GUIDE= `fill="none" stroke="#cccccc" stroke-width="0.3" stroke-dasharray="2 1.5"`;
  const T    = (sz: number, col = '#444444', weight = 'normal') =>
    `font-family="Arial,Helvetica,sans-serif" font-size="${sz}" fill="${col}" font-weight="${weight}"`;

  // ── Open SVG ─────────────────────────────────────────────────────────────
  let s = `<?xml version="1.0" encoding="utf-8"?>
<!-- Pop-up card cut/fold template — US Letter landscape (11" × 8.5") -->
<!-- ✂  Solid lines = cut      - - -  Dashed lines = score & fold      -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${PW}mm" height="${PH}mm"
     viewBox="0 0 ${fp(PW)} ${fp(PH)}">
<rect width="${fp(PW)}" height="${fp(PH)}" fill="white"/>

`;

  // ── Legend (bottom-right corner) ─────────────────────────────────────────
  const lX = PW - M - 50;
  const lY = PH - M - 14;
  s += `<!-- Legend -->
<rect x="${fp(lX - 2)}" y="${fp(lY - 4)}" width="54" height="20" fill="#f8f8f8" stroke="#dddddd" stroke-width="0.3" rx="1.5"/>
<line x1="${fp(lX)}" y1="${fp(lY)}"    x2="${fp(lX + 11)}" y2="${fp(lY)}"    stroke="#111" stroke-width="0.5"/>
<text x="${fp(lX + 13)}" y="${fp(lY + 1)}" ${T(2.8)}>Cut line</text>
<line x1="${fp(lX)}" y1="${fp(lY + 6)}" x2="${fp(lX + 11)}" y2="${fp(lY + 6)}" stroke="#111" stroke-width="0.35" stroke-dasharray="3 1.5"/>
<text x="${fp(lX + 13)}" y="${fp(lY + 7)}" ${T(2.8)}>Score / fold line</text>
<line x1="${fp(lX)}" y1="${fp(lY + 12)}" x2="${fp(lX + 11)}" y2="${fp(lY + 12)}" stroke="#ccc" stroke-width="0.3" stroke-dasharray="2 1.5"/>
<text x="${fp(lX + 13)}" y="${fp(lY + 13)}" ${T(2.8)}>Placement guide</text>

`;

  // ── Panel header labels ───────────────────────────────────────────────────
  s += `<!-- Panel labels -->
<text x="${fp(bpX + panelW / 2)}" y="${fp(panelTop - 5)}"
      text-anchor="middle" ${T(3.5, '#222222', 'bold')}>BACK PANEL — inside face</text>
<text x="${fp(fpX + panelW / 2)}" y="${fp(panelTop - 5)}"
      text-anchor="middle" ${T(3.5, '#222222', 'bold')}>FRONT PANEL — inside face</text>

`;

  // ── Card panel outlines (solid cut lines) ─────────────────────────────────
  s += `<!-- Card panels (cut out along solid lines) -->
<rect x="${fp(bpX)}" y="${fp(panelTop)}" width="${fp(panelW)}" height="${fp(panelH)}" ${CUT}/>
<rect x="${fp(fpX)}" y="${fp(panelTop)}" width="${fp(panelW)}" height="${fp(panelH)}" ${CUT}/>

`;

  // ── Spine fold line (dashed, extends a few mm past each panel edge) ───────
  s += `<!-- Central spine — score and fold -->
<line x1="${fp(foldX)}" y1="${fp(panelTop - 6)}" x2="${fp(foldX)}" y2="${fp(panelBot + 6)}" ${FOLD}/>
<text x="${fp(foldX)}" y="${fp(panelTop - 7)}"
      text-anchor="middle" ${T(2.8, '#666666')}>SCORE &amp; FOLD — SPINE</text>

`;

  // ── Glue guides on back panel (one rectangle per layer) ──────────────────
  // The tab BASE lies flat on the back panel, adjacent to the spine,
  // centred at the layer's horizontal position (which maps to the vertical
  // axis of the panel in the flat template, since tabW runs along the spine).
  layers.forEach((layer, i) => {
    const tw = Math.max(0.5, ((layer.tabWidth  ?? 50) / 100) * CW * 0.75) * SC;
    const hb = Math.max(0.3, ((layer.tabDepth  ?? 50) / 100) * CH * 0.50) * SC;
    // horizontalPosition along spine (3D X) → vertical offset in the flat template
    const vOffset = ((layer.horizontalPosition ?? 50) / 100 - 0.5) * CW * SC;
    const cy = panelTop + panelH / 2 + vOffset;

    // Guide rect: extends leftward from spine by hb, centred at cy, tw tall
    const gx = foldX - hb;
    const gy = cy - tw / 2;

    s += `<!-- L${i + 1} base glue guide on back panel -->
<rect x="${fp(gx)}" y="${fp(gy)}" width="${fp(hb)}" height="${fp(tw)}" ${GUIDE}/>
<text x="${fp(gx + hb / 2)}" y="${fp(cy + 1.3)}"
      text-anchor="middle" ${T(2.2, '#bbbbbb')}>L${i + 1} — glue base here</text>

`;
  });

  // ── Separator & instruction line ──────────────────────────────────────────
  s += `<!-- Separator -->
<line x1="${fp(M)}" y1="${fp(panelBot + 14)}" x2="${fp(PW - M)}" y2="${fp(panelBot + 14)}"
      stroke="#cccccc" stroke-width="0.2"/>
<text x="${fp(M)}" y="${fp(panelBot + 11)}" ${T(2.8, '#888888')}>
  ▼  Cut the pieces below, then fold and assemble as labelled
</text>

`;

  // ── Cut pieces: one TAB PIECE + one ELEMENT PIECE per layer ──────────────
  let curX = M;

  layers.forEach((layer, i) => {
    // Convert 3D params to physical mm
    const tw = Math.max(0.5, ((layer.tabWidth  ?? 50) / 100) * CW * 0.75) * SC;
    const hb = Math.max(0.3, ((layer.tabDepth  ?? 50) / 100) * CH * 0.50) * SC;
    const hw = Math.max(0.3, ((layer.tabHeight ?? 50) / 100) * CH * 0.80) * SC;
    const ew = Math.max(0.5, (layer.width  / 100) * CW * 0.75) * SC;
    const eh = Math.max(0.2, (layer.height / 100) * CH * 0.80) * SC;

    const tabTH = hb + hw;   // total tab piece height: base + wall stacked
    const tabX  = curX;
    const tabY  = piecesY;

    // ── TAB PIECE ──────────────────────────────────────────────────────────
    s += `<!-- L${i + 1} — TAB PIECE ("${layer.name}") -->
<text x="${fp(tabX + tw / 2)}" y="${fp(tabY - 2)}"
      text-anchor="middle" ${T(3, '#333333', 'bold')}>TAB — ${layer.name}</text>
`;
    // Outer cut rectangle
    s += `<rect x="${fp(tabX)}" y="${fp(tabY)}" width="${fp(tw)}" height="${fp(tabTH)}" ${CUT}/>
`;
    // Fold line between BASE and WALL (this is where the two tab halves meet)
    s += `<line x1="${fp(tabX)}" y1="${fp(tabY + hb)}" x2="${fp(tabX + tw)}" y2="${fp(tabY + hb)}" ${FOLD}/>
`;

    // BASE zone labels
    if (hb > 7) {
      s += `<text x="${fp(tabX + tw / 2)}" y="${fp(tabY + hb / 2 - 1.5)}"
      text-anchor="middle" ${T(2.8, '#555555')}>BASE</text>
<text x="${fp(tabX + tw / 2)}" y="${fp(tabY + hb / 2 + 2.5)}"
      text-anchor="middle" ${T(2.2, '#999999')}>glue to back panel</text>
`;
    }

    // WALL zone labels
    if (hw > 7) {
      s += `<text x="${fp(tabX + tw / 2)}" y="${fp(tabY + hb + hw / 2 - 1.5)}"
      text-anchor="middle" ${T(2.8, '#555555')}>WALL</text>
<text x="${fp(tabX + tw / 2)}" y="${fp(tabY + hb + hw / 2 + 2.5)}"
      text-anchor="middle" ${T(2.2, '#999999')}>attach element</text>
`;
    }

    // ── ELEMENT PIECE ──────────────────────────────────────────────────────
    const elemX = tabX + tw + pieceGap;
    const elemY = tabY;

    s += `
<!-- L${i + 1} — ELEMENT PIECE ("${layer.name}") -->
<text x="${fp(elemX + ew / 2)}" y="${fp(elemY - 2)}"
      text-anchor="middle" ${T(3, '#333333', 'bold')}>ELEMENT — ${layer.name}</text>
`;
    // Tinted background (matches layer colour so user can identify it)
    s += `<rect x="${fp(elemX)}" y="${fp(elemY)}" width="${fp(ew)}" height="${fp(eh)}"
      fill="${layer.color}" fill-opacity="0.08"/>
`;

    // Image (if available) — embedded as a data URI inside clipPath
    if (layer.imageData) {
      const clipId = `ec${i}`;
      s += `<defs>
  <clipPath id="${clipId}">
    <rect x="${fp(elemX)}" y="${fp(elemY)}" width="${fp(ew)}" height="${fp(eh)}"/>
  </clipPath>
</defs>
<image href="${layer.imageData}"
       x="${fp(elemX)}" y="${fp(elemY)}" width="${fp(ew)}" height="${fp(eh)}"
       preserveAspectRatio="xMidYMid meet"
       clip-path="url(#${clipId})"/>
`;
    } else {
      // Placeholder text when no image
      s += `<text x="${fp(elemX + ew / 2)}" y="${fp(elemY + eh / 2)}"
      text-anchor="middle" dominant-baseline="middle" ${T(3, '#cccccc')}>design element</text>
`;
    }

    // Cut outline (drawn on top of image so it's always visible)
    s += `<rect x="${fp(elemX)}" y="${fp(elemY)}" width="${fp(ew)}" height="${fp(eh)}" ${CUT}/>

`;

    curX = elemX + ew + layerGap;
  });

  s += `</svg>`;
  return s;
}

// ─── 2D animated preview ──────────────────────────────────────────────────────

function CardPreview2D({
  layers,
  cardData,
  isOpen,
}: {
  layers: Layer[];
  cardData: CardData;
  isOpen: boolean;
}) {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[4/3]" style={{ perspective: 900 }}>
      <motion.div
        className="absolute inset-0 rounded-lg shadow-xl flex items-end justify-center pb-4"
        style={{
          backgroundColor: cardData.background,
          transformOrigin: '50% 100%',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        }}
        animate={{ rotateX: isOpen ? -45 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <span className="text-xs text-gray-400 select-none">Back panel</span>
      </motion.div>

      <motion.div
        className="absolute inset-0 rounded-lg shadow-xl flex flex-col items-center justify-center gap-2 overflow-hidden"
        style={{
          backgroundColor: cardData.background,
          transformOrigin: '50% 0%',
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateX: isOpen ? 45 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <p className="text-2xl font-serif font-bold" style={{ color: cardData.foreground }}>
          {cardData.text}
        </p>
        <p className="text-sm opacity-70" style={{ color: cardData.foreground }}>
          {cardData.subtext}
        </p>
        {isOpen && (
          <div className="flex gap-1 mt-2">
            {layers.map((l, i) => (
              <motion.div
                key={l.id}
                className="rounded-sm shadow"
                style={{
                  backgroundColor: l.color,
                  width: `${(l.width / 100) * 60}px`,
                  height: `${(l.height / 100) * 40}px`,
                  opacity: l.opacity / 100,
                }}
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
  const navigate                        = useNavigate();
  const { layers, cardData, setCardData } = useCardDesign();
  const [isOpen, setIsOpen]             = useState(false);
  const svgRef                          = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<CardData>) => setCardData({ ...cardData, ...patch });

  // ── Download SVG ─────────────────────────────────────────────────────────
  const downloadSvg = () => {
    const svg  = generatePrintTemplate(layers);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'popup-card-template.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Print ────────────────────────────────────────────────────────────────
  const printTemplate = () => {
    const svg = generatePrintTemplate(layers);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Pop-Up Card Template</title>
  <style>
    @page { size: 11in 8.5in landscape; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: white; }
    body { display: flex; justify-content: center; align-items: center;
           min-height: 100vh; }
    svg { width: 100vw; height: 100vh; max-width: 11in; max-height: 8.5in; }
    @media print {
      html, body { width: 11in; height: 8.5in; }
      svg { width: 11in; height: 8.5in; }
    }
  </style>
</head>
<body>${svg}</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  // ── Download PNG (150 dpi at Letter landscape) ───────────────────────────
  const downloadPng = () => {
    const svgStr = generatePrintTemplate(layers);
    const img    = new Image();
    const blob   = new Blob([svgStr], { type: 'image/svg+xml' });
    const url    = URL.createObjectURL(blob);
    // 11" × 8.5" at 150 dpi
    const W = 1650, H = 1275;
    img.onload = () => {
      const canvas  = document.createElement('canvas');
      canvas.width  = W;
      canvas.height = H;
      const ctx     = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
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
          {/* Left: animated preview */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Card Preview</h2>
            <CardPreview2D layers={layers} cardData={cardData} isOpen={isOpen} />
            <Button className="w-full" variant="outline" onClick={() => setIsOpen(o => !o)}>
              {isOpen ? 'Close Card' : 'Open Card'}
            </Button>
            <p className="text-xs text-gray-400 text-center">
              Click to see the pop-up card open and close
            </p>
          </div>

          {/* Right: customise + download */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Card Message</h2>
              <div className="space-y-1">
                <Label>Main Text</Label>
                <Input
                  value={cardData.text}
                  onChange={e => update({ text: e.target.value })}
                  placeholder="Happy Birthday!"
                />
              </div>
              <div className="space-y-1">
                <Label>Sub-text</Label>
                <Input
                  value={cardData.subtext}
                  onChange={e => update({ subtext: e.target.value })}
                  placeholder="Wishing you a wonderful day"
                />
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Card Colours</h2>
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    { label: 'Background', key: 'background' as const },
                    { label: 'Text Colour', key: 'foreground' as const },
                  ] as const
                ).map(({ label, key }) => (
                  <div key={key} className="space-y-1">
                    <Label>{label}</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={cardData[key]}
                        onChange={e => update({ [key]: e.target.value })}
                        className="w-10 h-9 rounded cursor-pointer border border-gray-200 p-0.5"
                      />
                      <Input
                        value={cardData[key]}
                        onChange={e => update({ [key]: e.target.value })}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Pop-Up Layers ({layers.length})
              </h2>
              <div className="space-y-2">
                {layers.map(l => (
                  <div key={l.id} className="flex items-center gap-3 text-sm text-gray-700">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: l.color }}
                    />
                    <span className="flex-1">{l.name}</span>
                    <span className="text-gray-400 text-xs">
                      tab {l.tabWidth ?? 50}% / {l.tabHeight ?? 50}% / {l.tabDepth ?? 50}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 space-y-3" ref={svgRef}>
              <h2 className="text-xl font-semibold text-gray-900">Download &amp; Print</h2>
              <p className="text-sm text-gray-500">
                The template is laid out on US Letter paper (11″ × 8.5″ landscape).
                All pieces are drawn to scale from your 3D design.
                Solid lines = cut, dashed lines = score &amp; fold.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <Button className="w-full justify-start gap-2" onClick={downloadSvg}>
                  <Download className="w-4 h-4" />
                  Download SVG Template
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={downloadPng}
                >
                  <ImageIcon className="w-4 h-4" />
                  Download PNG Template  (150 dpi)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={printTemplate}
                >
                  <Printer className="w-4 h-4" />
                  Print Template
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex justify-center pt-4 pb-10">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Start a New Card
          </Button>
        </div>
      </main>
    </div>
  );
}
