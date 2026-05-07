import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Download, Printer, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Card3DViewer } from './Card3DViewer';
import type { PopupLayer3D } from './Card3DViewer';
import { useCardDesign } from '../context/CardDesignContext';
import type { Layer, CardData } from '../types';

// ─── 3D model constants (must match v-fold.ts) ────────────────────────────────
const CW = 8;   // CARD_W
const CH = 5;   // CARD_H

// ─── Shared page geometry ─────────────────────────────────────────────────────
// US Letter landscape: 11" × 8.5" = 279.4 mm × 215.9 mm
const PW = 279.4;
const PH = 215.9;
const M  = 6.35;    // 0.25" safe-area margin on every edge

// Scale: fit one panel's width (CW units) into half the usable page width.
const panelW = (PW - 2 * M) / 2;   // physical mm per panel  (≈133.35 mm, ≈5.25")
const SC     = panelW / CW;          // mm per 3D unit          (≈16.67 mm/unit)
const panelH = CH * SC;              // physical panel height   (≈83.34 mm, ≈3.28")

const foldX    = PW / 2;             // x of the central spine line
const panelTop = M + 12;             // top y of both panels (12 mm reserved for header)
const panelBot = panelTop + panelH;
const bpX      = M;                  // back-panel left x
const fpX      = foldX;              // front-panel left x

// ─── Helpers ──────────────────────────────────────────────────────────────────
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const fp = (n: number) => n.toFixed(2);

const CUT  = `fill="none" stroke="#111111" stroke-width="0.5"`;
const FOLD = `fill="none" stroke="#111111" stroke-width="0.35" stroke-dasharray="3 1.5"`;
const GUIDE= `fill="none" stroke="#cccccc" stroke-width="0.3" stroke-dasharray="2 1.5"`;
const T    = (sz: number, col = '#444444', weight = 'normal') =>
  `font-family="Arial,Helvetica,sans-serif" font-size="${sz}" fill="${col}" font-weight="${weight}"`;

function svgHeader(comment: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<!-- ${comment} -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${PW}mm" height="${PH}mm"
     viewBox="0 0 ${fp(PW)} ${fp(PH)}">
<rect width="${fp(PW)}" height="${fp(PH)}" fill="white"/>
`;
}

function spineAndLabels(backLabel: string, frontLabel: string, noteY?: number): string {
  let s = `
<!-- Panel labels -->
<text x="${fp(bpX + panelW / 2)}" y="${fp(panelTop - 5)}"
      text-anchor="middle" ${T(3.5, '#222222', 'bold')}>${backLabel}</text>
<text x="${fp(fpX + panelW / 2)}" y="${fp(panelTop - 5)}"
      text-anchor="middle" ${T(3.5, '#222222', 'bold')}>${frontLabel}</text>

<!-- Spine — score and fold -->
<line x1="${fp(foldX)}" y1="${fp(panelTop - 6)}" x2="${fp(foldX)}" y2="${fp(panelBot + 6)}" ${FOLD}/>
<text x="${fp(foldX)}" y="${fp(panelTop - 7)}"
      text-anchor="middle" ${T(2.8, '#666666')}>SCORE &amp; FOLD — SPINE</text>
`;
  if (noteY !== undefined) {
    s += `<text x="${fp(PW / 2)}" y="${fp(noteY)}"
      text-anchor="middle" ${T(2.5, '#aaaaaa')}>Page 2 of 2 — print on the reverse of Page 1 (flip paper left-to-right / short-edge duplex)</text>
`;
  }
  return s;
}

function legend(): string {
  const lX = PW - M - 50, lY = PH - M - 14;
  return `
<!-- Legend -->
<rect x="${fp(lX - 2)}" y="${fp(lY - 4)}" width="54" height="20"
      fill="#f8f8f8" stroke="#dddddd" stroke-width="0.3" rx="1.5"/>
<line x1="${fp(lX)}" y1="${fp(lY)}"     x2="${fp(lX + 11)}" y2="${fp(lY)}"
      stroke="#111" stroke-width="0.5"/>
<text x="${fp(lX + 13)}" y="${fp(lY + 1)}" ${T(2.8)}>Cut line</text>
<line x1="${fp(lX)}" y1="${fp(lY + 6)}"  x2="${fp(lX + 11)}" y2="${fp(lY + 6)}"
      stroke="#111" stroke-width="0.35" stroke-dasharray="3 1.5"/>
<text x="${fp(lX + 13)}" y="${fp(lY + 7)}" ${T(2.8)}>Score / fold line</text>
<line x1="${fp(lX)}" y1="${fp(lY + 12)}" x2="${fp(lX + 11)}" y2="${fp(lY + 12)}"
      stroke="#ccc" stroke-width="0.3" stroke-dasharray="2 1.5"/>
<text x="${fp(lX + 13)}" y="${fp(lY + 13)}" ${T(2.8)}>Placement guide</text>
`;
}

// ─── PAGE 1: Inside faces + cut pieces ───────────────────────────────────────
//
//  ┌─ margin ──────────────────────────────────────────────── margin ─┐
//  │  BACK PANEL (inside)         ┃  FRONT PANEL (inside)            │
//  │  ┌──────────────────────┐    ┃  ┌──────────────────────────┐    │
//  │  │  [glue guide L1]     │    ┃  │                          │    │
//  │  └──────────────────────┘    ┃  └──────────────────────────┘    │
//  │  ─ ─ cut pieces below ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
//  │  ┌──────┐ ┌───────────────┐  ┌──────┐ ┌───────────────┐         │
//  │  │TAB L1│ │  ELEMENT L1   │  │TAB L2│ │  ELEMENT L2   │         │
//  │  │ BASE │ │               │  │      │ │               │         │
//  │  │------│ │               │  │------│ │               │         │
//  │  │ WALL │ │               │  │      │ │               │         │
//  │  └──────┘ └───────────────┘  └──────┘ └───────────────┘ legend  │
//  └───────────────────────────────────────────────────────────────────┘
//
// rasterImages[i]: pre-rasterized PNG data URI for layers[i], or null if no image.
// Passing these separately avoids embedding raw SVG data-URIs inside the SVG template,
// which many browsers fail to render when the <image href> is a nested SVG data-URI.
function generateInsidePage(layers: Layer[], rasterImages: (string | null)[]): string {
  const piecesY  = panelBot + 18;
  const pieceGap = 4;
  const layerGap = 7;

  let s = svgHeader('Pop-up card template — Page 1 of 2: Inside faces  |  ✂ solid = cut  - - - dashed = score & fold');
  s += legend();
  s += spineAndLabels('BACK PANEL — inside face', 'FRONT PANEL — inside face');

  // ── Card panel outlines (solid = cut) ──────────────────────────────────
  s += `
<!-- Card panels -->
<rect x="${fp(bpX)}" y="${fp(panelTop)}" width="${fp(panelW)}" height="${fp(panelH)}" ${CUT}/>
<rect x="${fp(fpX)}" y="${fp(panelTop)}" width="${fp(panelW)}" height="${fp(panelH)}" ${CUT}/>
`;

  // ── Glue guides on back panel (one per layer) ───────────────────────────
  // The tab BASE lies flat on the back panel adjacent to the spine.
  // tabW runs along the spine → maps to vertical direction in this flat view.
  // h_base runs perpendicular to the spine → maps to horizontal, leftward from foldX.
  layers.forEach((layer, i) => {
    const tw = Math.max(0.5, ((layer.tabWidth  ?? 50) / 100) * CW * 0.75) * SC;
    const hb = Math.max(0.3, ((layer.tabDepth  ?? 50) / 100) * CH * 0.50) * SC;
    // horizontalPosition along the spine (3D X) → vertical offset in the flat template
    const vOff = ((layer.horizontalPosition ?? 50) / 100 - 0.5) * CW * SC;
    const cy   = panelTop + panelH / 2 + vOff;
    const gx   = foldX - hb;
    const gy   = cy - tw / 2;
    s += `
<!-- L${i + 1} base glue guide -->
<rect x="${fp(gx)}" y="${fp(gy)}" width="${fp(hb)}" height="${fp(tw)}" ${GUIDE}/>
<text x="${fp(gx + hb / 2)}" y="${fp(cy + 1.3)}"
      text-anchor="middle" ${T(2.2, '#bbbbbb')}>L${i + 1} — glue base here</text>
`;
  });

  // ── Separator ───────────────────────────────────────────────────────────
  s += `
<!-- separator -->
<line x1="${fp(M)}" y1="${fp(panelBot + 14)}" x2="${fp(PW - M)}" y2="${fp(panelBot + 14)}"
      stroke="#cccccc" stroke-width="0.2"/>
<text x="${fp(M)}" y="${fp(panelBot + 11)}" ${T(2.8, '#888888')}>▼  Cut the pieces below, then fold and assemble as labelled</text>
`;

  // ── Tab + element pieces ────────────────────────────────────────────────
  let curX = M;

  layers.forEach((layer, i) => {
    const tw = Math.max(0.5, ((layer.tabWidth  ?? 50) / 100) * CW * 0.75) * SC;
    const hb = Math.max(0.3, ((layer.tabDepth  ?? 50) / 100) * CH * 0.50) * SC;
    const hw = Math.max(0.3, ((layer.tabHeight ?? 50) / 100) * CH * 0.80) * SC;
    const ew = Math.max(0.5, (layer.width  / 100) * CW * 0.75) * SC;
    const eh = Math.max(0.2, (layer.height / 100) * CH * 0.80) * SC;

    const tabTH = hb + hw;
    const tabX  = curX;
    const tabY  = piecesY;

    // TAB PIECE
    s += `
<!-- L${i + 1} TAB PIECE — "${layer.name}" -->
<text x="${fp(tabX + tw / 2)}" y="${fp(tabY - 2)}"
      text-anchor="middle" ${T(3, '#333333', 'bold')}>TAB — ${escapeXml(layer.name)}</text>
<rect x="${fp(tabX)}" y="${fp(tabY)}" width="${fp(tw)}" height="${fp(tabTH)}" ${CUT}/>
<line x1="${fp(tabX)}" y1="${fp(tabY + hb)}" x2="${fp(tabX + tw)}" y2="${fp(tabY + hb)}" ${FOLD}/>
`;
    if (hb > 7) {
      s += `<text x="${fp(tabX + tw / 2)}" y="${fp(tabY + hb / 2 - 1.5)}"
      text-anchor="middle" ${T(2.8, '#555555')}>BASE</text>
<text x="${fp(tabX + tw / 2)}" y="${fp(tabY + hb / 2 + 2.5)}"
      text-anchor="middle" ${T(2.2, '#999999')}>glue to back panel</text>
`;
    }
    if (hw > 7) {
      s += `<text x="${fp(tabX + tw / 2)}" y="${fp(tabY + hb + hw / 2 - 1.5)}"
      text-anchor="middle" ${T(2.8, '#555555')}>WALL</text>
<text x="${fp(tabX + tw / 2)}" y="${fp(tabY + hb + hw / 2 + 2.5)}"
      text-anchor="middle" ${T(2.2, '#999999')}>attach element</text>
`;
    }

    // ELEMENT PIECE
    const elemX = tabX + tw + pieceGap;
    const elemY = tabY;
    // rasterImages[i] is a PNG data URI (or null) — safe to embed directly in SVG
    const pngSrc = rasterImages[i];

    s += `
<!-- L${i + 1} ELEMENT PIECE — "${layer.name}" -->
<text x="${fp(elemX + ew / 2)}" y="${fp(elemY - 2)}"
      text-anchor="middle" ${T(3, '#333333', 'bold')}>ELEMENT — ${escapeXml(layer.name)}</text>
<rect x="${fp(elemX)}" y="${fp(elemY)}" width="${fp(ew)}" height="${fp(eh)}"
      fill="${layer.color}" fill-opacity="0.08"/>
`;
    if (pngSrc) {
      const clipId = `ec${i}`;
      s += `<defs>
  <clipPath id="${clipId}">
    <rect x="${fp(elemX)}" y="${fp(elemY)}" width="${fp(ew)}" height="${fp(eh)}"/>
  </clipPath>
</defs>
<image href="${pngSrc}"
       x="${fp(elemX)}" y="${fp(elemY)}" width="${fp(ew)}" height="${fp(eh)}"
       preserveAspectRatio="xMidYMid meet" clip-path="url(#${clipId})"/>
`;
    } else {
      s += `<text x="${fp(elemX + ew / 2)}" y="${fp(elemY + eh / 2)}"
      text-anchor="middle" dominant-baseline="middle" ${T(3, '#cccccc')}>design element</text>
`;
    }
    s += `<rect x="${fp(elemX)}" y="${fp(elemY)}" width="${fp(ew)}" height="${fp(eh)}" ${CUT}/>
`;
    curX = elemX + ew + layerGap;
  });

  s += `</svg>`;
  return s;
}

// ─── PAGE 2: Outside faces ─────────────────────────────────────────────────────
//
// For correct double-sided alignment, Page 2 is laid out as a horizontal mirror
// of Page 1 so that when the sheet is flipped left-to-right (short-edge duplex):
//
//   Page 2 LEFT  = FRONT PANEL outside  ← aligns behind Page 1 RIGHT (front inside)
//   Page 2 RIGHT = BACK PANEL outside   ← aligns behind Page 1 LEFT  (back inside)
//
// Both panels are filled with the card background colour.
// The card message (main text + sub-text) is centred on the Front panel outside.
//
function generateOutsidePage(layers: Layer[], cardData: CardData): string {
  // Suppress unused-variable warning — layers reserved for future bleed marks etc.
  void layers;

  const bg = cardData.background || '#fef9ef';
  const fg = cardData.foreground || '#222222';

  let s = svgHeader('Pop-up card template — Page 2 of 2: Outside faces  |  print on reverse of Page 1 (flip left-to-right)');

  s += spineAndLabels(
    'FRONT PANEL — outside face (cover)',
    'BACK PANEL — outside face',
    PH - M - 3,
  );

  // ── Panel fills (both panels filled with the chosen card background) ─────
  s += `
<!-- Outside panels — filled with card background colour -->
<rect x="${fp(bpX)}" y="${fp(panelTop)}" width="${fp(panelW)}" height="${fp(panelH)}"
      fill="${bg}" ${CUT}/>
<rect x="${fp(fpX)}" y="${fp(panelTop)}" width="${fp(panelW)}" height="${fp(panelH)}"
      fill="${bg}" ${CUT}/>
`;

  // ── Card message centred on the FRONT panel outside (left half on page 2) ─
  // Because page 2 is flipped left-to-right:
  //   Left half (bpX … foldX) is the front-panel outside face
  const textX  = bpX + panelW / 2;
  const textCY = panelTop + panelH / 2;

  // Compute a comfortable font size: main text fills roughly 70 % of panel width.
  // We cap it so it doesn't overflow the panel height.
  const mainText = escapeXml(cardData.text    || '');
  const subText  = escapeXml(cardData.subtext || '');

  // Main text: up to 12 mm tall (≈34 pt), scaled down if panel is small
  const mainSz = Math.min(12, panelW * 0.12);
  // Sub-text: 55 % of main size
  const subSz  = mainSz * 0.55;
  // Vertical gap between main and sub
  const gap    = mainSz * 0.6;

  if (mainText) {
    const yMain = subText ? textCY - gap / 2 : textCY;
    s += `
<!-- Card message on front panel outside face -->
<text x="${fp(textX)}" y="${fp(yMain)}"
      text-anchor="middle" dominant-baseline="middle"
      font-family="Georgia,'Times New Roman',serif"
      font-size="${fp(mainSz)}" font-weight="bold" fill="${fg}">${mainText}</text>
`;
  }
  if (subText) {
    const ySub = mainText ? textCY + gap / 2 + subSz * 0.5 : textCY;
    s += `<text x="${fp(textX)}" y="${fp(ySub)}"
      text-anchor="middle" dominant-baseline="middle"
      font-family="Arial,Helvetica,sans-serif"
      font-size="${fp(subSz)}" fill="${fg}">${subText}</text>
`;
  }

  s += `</svg>`;
  return s;
}

// ─── Image / download helpers ─────────────────────────────────────────────────

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Rasterize any data-URI (SVG or PNG) to a PNG at the given pixel size.
// Browsers often fail to render SVG data-URIs inside SVG <image> elements;
// rasterizing to PNG first gives a universally supported href.
function rasterizeImage(src: string, wPx: number, hPx: number): Promise<string | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas  = document.createElement('canvas');
      canvas.width  = Math.ceil(wPx);
      canvas.height = Math.ceil(hPx);
      try {
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        // Canvas was tainted (e.g. cross-origin SVG) — fall back gracefully to no image
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Pre-rasterize every layer's imageData at `dpi` dots-per-inch,
// sized to match the element piece dimensions in the printed template.
function prerasterizeLayers(layers: Layer[], dpi: number): Promise<(string | null)[]> {
  return Promise.all(layers.map(layer => {
    if (!layer.imageData) return Promise.resolve(null);
    const ew_mm = Math.max(0.5, (layer.width  / 100) * CW * 0.75) * SC;
    const eh_mm = Math.max(0.2, (layer.height / 100) * CH * 0.80) * SC;
    return rasterizeImage(layer.imageData, ew_mm / 25.4 * dpi, eh_mm / 25.4 * dpi);
  }));
}

// Render a plain SVG string (no <image> elements) onto a canvas and return a PNG data URI.
// Uses a base64 data URI (not a blob URL) to avoid Chrome's canvas taint rule:
// Chrome marks a canvas as origin-dirty when drawImage is called with a blob-URL SVG,
// even if the SVG contains no external resources, blocking toDataURL().
function svgToPng(svgStr: string, w: number, h: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // btoa(unescape(encodeURIComponent(…))) safely base64-encodes a UTF-8 SVG string.
    // data: URIs are always considered same-origin → no canvas taint.
    let b64: string;
    try {
      b64 = btoa(unescape(encodeURIComponent(svgStr)));
    } catch (e) {
      reject(e);
      return;
    }
    img.onload = () => {
      const canvas  = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      const ctx     = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      try {
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('SVG render failed'));
    img.src = `data:image/svg+xml;base64,${b64}`;
  });
}

// Draw a single image (PNG data URI) onto an existing canvas context at mm coordinates.
function drawImageMm(
  ctx: CanvasRenderingContext2D,
  pngSrc: string,
  xMm: number, yMm: number, wMm: number, hMm: number,
  pxPerMm: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, xMm * pxPerMm, yMm * pxPerMm, wMm * pxPerMm, hMm * pxPerMm);
      resolve();
    };
    img.onerror = reject;
    img.src = pngSrc;   // PNG data URI — same-origin, never taints canvas
  });
}

// Two-pass PNG render for Page 1 (which contains element images).
// Pass 1: render the layout SVG with NO <image> nodes (safe, no canvas taint).
// Pass 2: composite each element image directly via its PNG data URI.
async function renderInsidePageToPng(
  layers:        Layer[],
  rasterImages:  (string | null)[],
  wPx:           number,
  hPx:           number,
  dpi:           number,
): Promise<string> {
  const pxPerMm = wPx / PW;

  // ── Pass 1: layout without images ──────────────────────────────────────
  const svgNoImg = generateInsidePage(layers, layers.map(() => null));
  const canvas   = document.createElement('canvas');
  canvas.width   = wPx;
  canvas.height  = hPx;
  const ctx      = canvas.getContext('2d')!;
  ctx.fillStyle  = '#ffffff';
  ctx.fillRect(0, 0, wPx, hPx);
  await svgToPng(svgNoImg, wPx, hPx).then(png => {
    const img = new Image();
    // svgToPng already returned a clean PNG — load from data URI (same-origin, no taint)
    return new Promise<void>((res, rej) => {
      img.onload = () => { ctx.drawImage(img, 0, 0); res(); };
      img.onerror = rej;
      img.src = png;
    });
  });

  // ── Pass 2: element images composited directly ──────────────────────────
  // Re-derive element piece mm positions (must mirror layout in generateInsidePage)
  const piecesY  = panelBot + 18;
  const pieceGap = 4;
  const layerGap = 7;
  let curX = M;

  await Promise.all(layers.map(async (layer, i) => {
    const tw = Math.max(0.5, ((layer.tabWidth  ?? 50) / 100) * CW * 0.75) * SC;
    const ew = Math.max(0.5, (layer.width  / 100) * CW * 0.75) * SC;
    const eh = Math.max(0.2, (layer.height / 100) * CH * 0.80) * SC;
    const elemX = curX + tw + pieceGap;
    curX = elemX + ew + layerGap;

    const pngSrc = rasterImages[i];
    if (!pngSrc) return;
    // Scale up the rasterized image to fill the element-piece rect exactly
    await drawImageMm(ctx, pngSrc, elemX, piecesY, ew, eh, pxPerMm);

    // Re-draw the cut outline on top so it's always crisp
    ctx.strokeStyle = '#111111';
    ctx.lineWidth   = 0.5 * pxPerMm;
    ctx.strokeRect(elemX * pxPerMm, piecesY * pxPerMm, ew * pxPerMm, eh * pxPerMm);
  }));

  void dpi;  // dpi used by callers for prerasterizeLayers; suppress unused-var warning
  return canvas.toDataURL('image/png');
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CardFinalization() {
  const navigate                          = useNavigate();
  const { layers, cardData, setCardData } = useCardDesign();
  const [isOpen, setIsOpen]               = useState(false);  // start closed — cover shows first
  const svgRef                            = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<CardData>) => setCardData({ ...cardData, ...patch });

  // Map Layer[] → PopupLayer3D[] (same shape, just the subset Card3DViewer expects)
  const layers3D: PopupLayer3D[] = layers.map(l => ({
    id: l.id, depth: l.depth, color: l.color, colorEdited: l.colorEdited,
    width: l.width, height: l.height, imageData: l.imageData,
    verticalPosition: l.verticalPosition, tabWidth: l.tabWidth,
    tabHeight: l.tabHeight, tabDepth: l.tabDepth, horizontalPosition: l.horizontalPosition,
  }));

  // ── Download SVG (two files) ────────────────────────────────────────────
  const downloadSvg = async () => {
    // Rasterize at 150 dpi so PNG hrefs inside the SVG render in all viewers
    const raster = await prerasterizeLayers(layers, 150);
    downloadFile(generateInsidePage(layers, raster),      'popup-card-page1-inside.svg',  'image/svg+xml');
    setTimeout(() =>
      downloadFile(generateOutsidePage(layers, cardData), 'popup-card-page2-outside.svg', 'image/svg+xml'),
      400,
    );
  };

  // ── Download PNG (two files, 150 dpi — 1650 × 1275 px) ─────────────────
  // Page 1 uses a two-pass render to avoid canvas taint (Chrome taints the canvas
  // when drawImage is called with a blob-URL SVG that contains <image> nodes).
  // Page 2 has no <image> nodes so the normal svgToPng path is fine.
  const downloadPng = async () => {
    const DPI = 150;
    const W = Math.round(PW / 25.4 * DPI);   // ≈ 1650 px
    const H = Math.round(PH / 25.4 * DPI);   // ≈ 1275 px
    try {
      const raster = await prerasterizeLayers(layers, DPI);
      const p1 = await renderInsidePageToPng(layers, raster, W, H, DPI);
      const p2 = await svgToPng(generateOutsidePage(layers, cardData), W, H);
      downloadFile(p1, 'popup-card-page1-inside.png',  'image/png');
      setTimeout(() => downloadFile(p2, 'popup-card-page2-outside.png', 'image/png'), 400);
    } catch (err) {
      console.error('PNG export failed:', err);
      alert('PNG export failed — please try the SVG download instead.');
    }
  };

  // ── Print (two landscape pages, proper @page CSS) ───────────────────────
  const printTemplate = async () => {
    const raster = await prerasterizeLayers(layers, 200);   // higher dpi for print
    const svg1 = generateInsidePage(layers, raster);
    const svg2 = generateOutsidePage(layers, cardData);
    const win  = window.open('', '_blank');
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
    .page {
      width: 11in; height: 8.5in;
      display: flex; align-items: center; justify-content: center;
      page-break-after: always;
      overflow: hidden;
    }
    .page:last-child { page-break-after: avoid; }
    svg { width: 11in; height: 8.5in; }
  </style>
</head>
<body>
  <div class="page">${svg1}</div>
  <div class="page">${svg2}</div>
</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <main className="max-w-6xl mx-auto px-8 py-10 space-y-10">
        <Button variant="ghost" onClick={() => navigate('/create/editor')} className="-ml-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Layer Editor
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: 3D preview — reuses the same viewer as the editor */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Card Preview</h2>
            {/* aspect-[4/3] wrapper so the canvas has a stable size */}
            <div className="aspect-[4/3] w-full">
              <Card3DViewer
                layers={layers3D}
                cardColor={cardData.background}
                cardForeground={cardData.foreground}
                cardText={cardData.text}
                cardSubtext={cardData.subtext}
                cameraPreset="preview"
                isOpen={isOpen}
                showTabs={false}
                height="100%"
              />
            </div>
            <Button className="w-full" variant="outline" onClick={() => setIsOpen(o => !o)}>
              {isOpen ? 'Close Card' : 'Open Card'}
            </Button>



            <p className="text-xs text-gray-400 text-center">
              Same 3D model as the editor · no construction tabs
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
                Two-page template on US Letter landscape (11″ × 8.5″).
                Page 1 = inside faces with cut &amp; fold guides.
                Page 2 = outside faces with card background &amp; message.
                For duplex printing, flip the sheet <strong>left-to-right</strong> (short-edge).
              </p>
              <div className="grid grid-cols-1 gap-3">
                <Button className="w-full justify-start gap-2" onClick={downloadSvg}>
                  <Download className="w-4 h-4" />
                  Download SVG Template (2 files)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={downloadPng}
                >
                  <ImageIcon className="w-4 h-4" />
                  Download PNG Template (2 files · 150 dpi)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={printTemplate}
                >
                  <Printer className="w-4 h-4" />
                  Print Template (2 pages)
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
