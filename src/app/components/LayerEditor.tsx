import { useNavigate, useSearchParams } from 'react-router';
import { useEffect, useRef, useCallback, useState } from 'react';
import { Layers, Trash2, Plus, Square, Box, Lock, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Card3DViewer } from './Card3DViewer';
import type { PopupLayer3D } from './Card3DViewer';
import { useCardDesign } from '../context/CardDesignContext';
import type { Layer, Mechanism } from '../types';

// ─── Mechanism tiles ──────────────────────────────────────────────────────────

interface MechTile { id: Mechanism; label: string; emoji: string; available: boolean }

const MECHANISM_TILES: MechTile[] = [
  { id: 'v-fold',       label: 'V-Fold',       emoji: '🔺', available: true  },
  { id: 'basic-tab',    label: 'Basic Tab',    emoji: '📄', available: false },
  { id: 'parallel-fold',label: 'Parallel Fold',emoji: '📚', available: false },
  { id: 'box',          label: 'Box Pop-Up',   emoji: '📦', available: false },
  { id: 'rotating',     label: 'Rotating',     emoji: '🌀', available: false },
  { id: 'accordion',    label: 'Accordion',    emoji: '🪗', available: false },
];

// ─── Canvas helpers ───────────────────────────────────────────────────────────

function clientToCanvas(
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
): { x: number; y: number } {
  const rect   = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}

function clipToPng(sourceCanvas: HTMLCanvasElement, path: { x: number; y: number }[]): string {
  if (path.length < 3) return '';
  const xs = path.map(p => p.x);
  const ys = path.map(p => p.y);
  const x0 = Math.floor(Math.min(...xs));
  const y0 = Math.floor(Math.min(...ys));
  const w  = Math.ceil(Math.max(...xs)) - x0;
  const h  = Math.ceil(Math.max(...ys)) - y0;
  if (w <= 0 || h <= 0) return '';
  const out = document.createElement('canvas');
  out.width  = w;
  out.height = h;
  const ctx  = out.getContext('2d')!;
  ctx.beginPath();
  ctx.moveTo(path[0].x - x0, path[0].y - y0);
  path.forEach(p => ctx.lineTo(p.x - x0, p.y - y0));
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(sourceCanvas, -x0, -y0);
  return out.toDataURL('image/png');
}

const CANVAS_W = 1200;
const CANVAS_H = 420;

// ─── Component ────────────────────────────────────────────────────────────────

export function LayerEditor() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    uploadedImage,
    designElement,
    layers,
    setLayers,
    mechanism,
    setMechanism,
  } = useCardDesign();

  // If navigated from Learn with ?mechanism=…, pre-select that mechanism
  useEffect(() => {
    const m = searchParams.get('mechanism') as Mechanism | null;
    if (m && MECHANISM_TILES.some(t => t.id === m)) setMechanism(m);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard: when arriving via the upload path, ensure the layer reflects the
  // currently uploaded image rather than a stale design-element image.
  // Fires once on mount; only resets when there is a clear mismatch between
  // uploadedImage and layers[0].imageData (and no design element is active).
  useEffect(() => {
    if (
      uploadedImage &&
      !designElement &&
      layers.length === 1 &&
      layers[0].imageData !== uploadedImage
    ) {
      const DEFAULT_LAYER_RESET = {
        id: 1, name: 'Base Layer', depth: 50, height: 65, width: 70,
        opacity: 100, verticalPosition: 50, tabWidth: 50, tabHeight: 50,
        tabDepth: 50, horizontalPosition: 50, color: '#6366f1', selected: false,
      };
      setLayers([{ ...DEFAULT_LAYER_RESET, imageData: uploadedImage }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-only — intentionally does not re-run on state changes

  const [activeTool, setActiveTool]   = useState<'lasso' | null>(null);
  const [isDrawing, setIsDrawing]     = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const src = designElement?.src ?? uploadedImage ?? null;
    bgImageRef.current = null;
    if (!src) { drawCanvas(); return; }
    const img  = new Image();
    img.onload = () => { bgImageRef.current = img; drawCanvas(); };
    img.src    = src;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designElement, uploadedImage]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const img = bgImageRef.current;
    if (img) {
      const scale = Math.min(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight);
      const dw = img.naturalWidth  * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (CANVAS_W - dw) / 2, (CANVAS_H - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload an image or pick a design element', CANVAS_W / 2, CANVAS_H / 2);
    }

    layers.forEach(layer => {
      if (layer.selected && layer.path && layer.path.length > 2) {
        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth   = 3;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(layer.path[0].x, layer.path[0].y);
        layer.path.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
    });

    if (currentPath.length > 0 && activeTool === 'lasso') {
      ctx.save();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth   = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.restore();
    }
  }, [layers, currentPath, activeTool]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  // ── Canvas mouse handlers ─────────────────────────────────────────────────

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'lasso' || !canvasRef.current) return;
    setIsDrawing(true);
    setCurrentPath([clientToCanvas(e, canvasRef.current)]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool !== 'lasso' || !canvasRef.current) return;
    setCurrentPath(prev => [...prev, clientToCanvas(e, canvasRef.current!)]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || activeTool !== 'lasso') return;
    setIsDrawing(false);
    if (currentPath.length > 3 && canvasRef.current) {
      const imageData = clipToPng(canvasRef.current, currentPath);
      const maxId = Math.max(...layers.map(l => l.id), 0);
      const newLayer: Layer = {
        id: maxId + 1,
        name: `Layer ${maxId + 1}`,
        depth:  Math.min(85, layers.length * 18 + 15),
        height: 60,
        width:  55,
        opacity: 100,
        verticalPosition: 50,
        tabWidth: 50,
        tabHeight: 50,
        tabDepth: 50,
        horizontalPosition: 50,
        color: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`,
        selected: true,
        path: [...currentPath],
        imageData: imageData || undefined,
      };
      setLayers([...layers.map(l => ({ ...l, selected: false })), newLayer]);
    }
    setCurrentPath([]);
    setActiveTool(null);
  };

  // ── Layer CRUD ────────────────────────────────────────────────────────────

  const updateLayer = (id: number, updates: Partial<Layer>) =>
    setLayers(layers.map(l => {
      if (l.id !== id) return l;
      // Mark the colour as user-edited so the 3D viewer applies the hue tint.
      const patch = 'color' in updates ? { ...updates, colorEdited: true } : updates;
      return { ...l, ...patch };
    }));

  const deleteLayer = (id: number) => {
    if (layers.length === 1) return;
    setLayers(layers.filter(l => l.id !== id));
  };

  const selectLayer = (id: number) =>
    setLayers(layers.map(l => ({ ...l, selected: l.id === id })));

  const addLayer = () => {
    const maxId = Math.max(...layers.map(l => l.id), 0);
    setLayers([...layers, {
      id: maxId + 1,
      name: `Layer ${maxId + 1}`,
      depth:  Math.min(85, layers.length * 18 + 15),
      height: 55,
      width:  50,
      opacity: 100,
      verticalPosition: 50,
      tabWidth: 50,
      tabHeight: 50,
      tabDepth: 50,
      horizontalPosition: 50,
      color: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`,
      selected: false,
    }]);
  };

  // ── 3D data ───────────────────────────────────────────────────────────────

  const layers3D: PopupLayer3D[] = layers.map(l => ({
    id: l.id, depth: l.depth, color: l.color, colorEdited: l.colorEdited,
    width: l.width, height: l.height, imageData: l.imageData,
    verticalPosition: l.verticalPosition, tabWidth: l.tabWidth,
    tabHeight: l.tabHeight, tabDepth: l.tabDepth, horizontalPosition: l.horizontalPosition,
  }));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <main className="max-w-7xl mx-auto px-8 py-10 space-y-8">

        {/* ── Mechanism picker ── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Pop-Up Mechanism</h2>
          <div className="flex gap-2 flex-wrap">
            {MECHANISM_TILES.map(tile => (
              <div key={tile.id} className="relative">
                <button
                  disabled={!tile.available}
                  onClick={() => setMechanism(tile.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    tile.available
                      ? mechanism === tile.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span>{tile.emoji}</span>
                  {tile.label}
                  {!tile.available && (
                    <Lock className="w-3 h-3 ml-1" />
                  )}
                </button>
                {!tile.available && (
                  <span className="absolute -top-2 -right-2 text-[9px] bg-gray-400 text-white px-1.5 py-0.5 rounded-full font-medium">
                    Soon
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Design Canvas ── */}
        <section>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Design Canvas</h2>
              <Button
                variant={activeTool === 'lasso' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTool(activeTool === 'lasso' ? null : 'lasso')}
              >
                <Square className="w-4 h-4 mr-2" />
                Lasso Tool
              </Button>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                className="w-full"
                style={{ cursor: activeTool === 'lasso' ? 'crosshair' : 'default' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {activeTool === 'lasso'
                ? 'Draw around an element to capture it as a new layer'
                : 'Click "Lasso Tool" to select parts of your design'}
            </p>
          </Card>
        </section>

        {/* ── 3D Preview + Layers side by side ── */}
        <section className="flex gap-6 items-start">

          {/* Left: square 3D preview */}
          <div className="flex-shrink-0 w-[45%]">
            <div className="flex items-center gap-3 mb-3">
              <Box className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">3D Preview</h2>
              <span className="text-sm text-gray-500">Updates live as you adjust sliders</span>
            </div>
            <div className="aspect-square relative">
              <Card3DViewer layers={layers3D} mechanism={mechanism} height="100%" />
              <button
                onClick={() => navigate('/create/preview')}
                className="absolute top-3 right-3 z-10 bg-black/40 hover:bg-black/60 text-white rounded-lg p-2 transition-colors"
                title="Full screen preview"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2.5 text-center">
              Drag to orbit · Scroll to zoom · Right-drag to pan
            </p>
          </div>

          {/* Right: layers */}
          <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Layers
              <span className="text-sm font-normal text-gray-500 ml-1">
                — adjust tab height &amp; depth to shape the 3D preview
              </span>
            </h2>
            <Button variant="outline" size="sm" onClick={addLayer}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Layer
            </Button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {layers.map((layer, idx) => (
              <div
                key={layer.id}
                onClick={() => selectLayer(layer.id)}
                className={`flex-shrink-0 w-64 rounded-xl border-2 p-3 cursor-pointer transition-all bg-white ${
                  layer.selected
                    ? 'border-blue-500 shadow-md shadow-blue-100'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-gray-300"
                      style={{ backgroundColor: layer.color }}
                    />
                    <Input
                      value={layer.name}
                      onChange={e => updateLayer(layer.id, { name: e.target.value })}
                      className="text-sm font-semibold border-0 p-0 h-auto focus-visible:ring-0 min-w-0"
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                  <Button
                    size="sm" variant="ghost"
                    className="flex-shrink-0 h-7 w-7 p-0"
                    disabled={layers.length === 1}
                    onClick={e => { e.stopPropagation(); deleteLayer(layer.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>

                {/* Thumbnail */}
                {layer.imageData && (
                  <div className="mb-3 rounded overflow-hidden border border-gray-200 bg-gray-50 h-12 flex items-center justify-center">
                    <img
                      src={layer.imageData}
                      alt={`${layer.name} thumbnail`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}

                {/* Color picker */}
                <div className="flex gap-2 mb-2" onClick={e => e.stopPropagation()}>
                  <input
                    type="color"
                    value={layer.color}
                    onChange={e => updateLayer(layer.id, { color: e.target.value })}
                    className="w-10 h-8 rounded cursor-pointer border border-gray-200 p-0.5 flex-shrink-0"
                  />
                  <Input
                    value={layer.color}
                    onChange={e => updateLayer(layer.id, { color: e.target.value })}
                    className="flex-1 text-xs font-mono h-8"
                  />
                </div>

                {/* Sliders */}
                <div className="space-y-2" onClick={e => e.stopPropagation()}>
                  <div>
                    <Label className="text-xs text-gray-500 flex justify-between">
                      <span>Element Height (size)</span>
                      <span className="font-medium text-gray-700">{layer.height}%</span>
                    </Label>
                    <Slider value={[layer.height]} onValueChange={([v]) => updateLayer(layer.id, { height: v })} min={5} max={100} step={5} className="mt-1" />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500 flex justify-between">
                      <span>Element Width (size)</span>
                      <span className="font-medium text-gray-700">{layer.width}%</span>
                    </Label>
                    <Slider value={[layer.width]} onValueChange={([v]) => updateLayer(layer.id, { width: v })} min={5} max={100} step={5} className="mt-1" />
                  </div>

                  <div className="border-t my-2" />
                  <div className="text-xs font-semibold text-gray-700">Tab</div>

                  <div>
                    <Label className="text-xs text-gray-500 flex justify-between">
                      <span>Tab Width</span>
                      <span className="font-medium text-gray-700">{layer.tabWidth}%</span>
                    </Label>
                    <Slider value={[layer.tabWidth]} onValueChange={([v]) => updateLayer(layer.id, { tabWidth: v })} min={0} max={100} step={5} className="mt-1" />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500 flex justify-between">
                      <span>Tab Height</span>
                      <span className="font-medium text-gray-700">{layer.tabHeight}%</span>
                    </Label>
                    <Slider value={[layer.tabHeight]} onValueChange={([v]) => updateLayer(layer.id, { tabHeight: v })} min={0} max={100} step={5} className="mt-1" />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500 flex justify-between">
                      <span>Tab Depth</span>
                      <span className="font-medium text-gray-700">{layer.tabDepth}%</span>
                    </Label>
                    <Slider value={[layer.tabDepth]} onValueChange={([v]) => updateLayer(layer.id, { tabDepth: v })} min={0} max={100} step={5} className="mt-1" />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500 flex justify-between">
                      <span>Horizontal Position</span>
                      <span className="font-medium text-gray-700">{layer.horizontalPosition}%</span>
                    </Label>
                    <Slider value={[layer.horizontalPosition]} onValueChange={([v]) => updateLayer(layer.id, { horizontalPosition: v })} min={0} max={100} step={5} className="mt-1" />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                      <span>left</span><span>right</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <span className="text-xs text-gray-400">Layer {idx + 1}</span>
                </div>
              </div>
            ))}

            <button
              onClick={addLayer}
              className="flex-shrink-0 w-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors bg-white"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs font-medium">Add Layer</span>
            </button>
          </div>
          </div>{/* end layers column */}

        </section>{/* end side-by-side section */}

        {/* ── Actions ── */}
        <div className="flex justify-end pb-8">
          <Button size="lg" className="px-16 text-base" onClick={() => navigate('/create/export')}>
            Next
          </Button>
        </div>
      </main>
    </div>
  );
}
