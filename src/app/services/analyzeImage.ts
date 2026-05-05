import type { AnalysisResult } from '../types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Down-scale the image onto a small canvas and return its pixel data. */
function samplePixels(img: HTMLImageElement, maxSide = 120): ImageData {
  const scale = Math.min(maxSide / img.naturalWidth, maxSide / img.naturalHeight, 1);
  const w = Math.max(1, Math.round(img.naturalWidth  * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width  = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

/** Quantise an RGB value to the nearest 32-step bucket (8 levels per channel). */
function quantise(v: number) { return Math.round(v / 32) * 32; }

/** Extract the N most-frequent colours, skipping near-white and near-black. */
function extractPalette(data: Uint8ClampedArray, n = 5): string[] {
  const freq: Record<string, { r: number; g: number; b: number; count: number }> = {};

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue; // transparent pixel

    const brightness = (r + g + b) / 3;
    if (brightness > 240 || brightness < 15) continue; // skip white / black

    const key = `${quantise(r)},${quantise(g)},${quantise(b)}`;
    if (freq[key]) {
      freq[key].count++;
    } else {
      freq[key] = { r, g, b, count: 1 };
    }
  }

  return Object.values(freq)
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
    .map(({ r, g, b }) => {
      const hex = (v: number) => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0');
      return `#${hex(r)}${hex(g)}${hex(b)}`;
    });
}

/** Pixel-value variance → complexity label. */
function detectComplexity(data: Uint8ClampedArray): AnalysisResult['complexity'] {
  let sum = 0, sumSq = 0, count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sum   += lum;
    sumSq += lum * lum;
    count++;
  }
  const mean     = sum / count;
  const variance = sumSq / count - mean * mean;
  if (variance < 900)  return 'Low';
  if (variance < 2800) return 'Medium';
  return 'High';
}

/** Distinct quantised colours → style label. */
function detectStyle(data: Uint8ClampedArray): string {
  const seen = new Set<string>();
  for (let i = 0; i < data.length; i += 4) {
    seen.add(`${quantise(data[i])},${quantise(data[i + 1])},${quantise(data[i + 2])}`);
  }
  if (seen.size < 6)  return 'Simple line drawing';
  if (seen.size < 20) return 'Illustrated design';
  return 'Detailed illustration';
}

/** Suggest card types based on complexity and palette warmth. */
function suggestUses(complexity: AnalysisResult['complexity'], colors: string[]): string[] {
  const warm = colors.some(c => {
    const r = parseInt(c.slice(1, 3), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return r > b + 40;
  });

  const base = ['Birthday Card', 'Thank You Card', 'Greeting Card'];
  if (warm) base.unshift('Valentine\'s Card');
  if (complexity === 'High') base.push('Anniversary Card');
  return base.slice(0, 4);
}

// ─── public API ───────────────────────────────────────────────────────────────

export async function analyzeImage(imageUrl: string): Promise<AnalysisResult> {
  const img    = await loadImage(imageUrl);
  const { data } = samplePixels(img, 120);

  const colors     = extractPalette(data, 5);
  const complexity = detectComplexity(data);
  const style      = detectStyle(data);
  const suggestedUses = suggestUses(complexity, colors);

  return { colors, complexity, style, suggestedUses };
}
