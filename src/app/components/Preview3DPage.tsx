import { useNavigate } from 'react-router';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card3DViewer } from './Card3DViewer';
import { useCardDesign } from '../context/CardDesignContext';
import type { PopupLayer3D } from './Card3DViewer';

export function Preview3DPage() {
  const navigate = useNavigate();
  const { layers, mechanism } = useCardDesign();

  const layers3D: PopupLayer3D[] = layers.map(l => ({
    id: l.id, depth: l.depth, color: l.color, width: l.width, height: l.height,
    imageData: l.imageData, verticalPosition: l.verticalPosition,
    tabWidth: l.tabWidth, tabHeight: l.tabHeight, tabDepth: l.tabDepth,
    horizontalPosition: l.horizontalPosition,
  }));

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-gray-900 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <Button variant="ghost" onClick={() => navigate('/create/editor')} className="text-gray-300 hover:text-white hover:bg-gray-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Editor
        </Button>
        <span className="text-gray-300 text-sm font-medium">
          3D Preview · V-Fold · 90° opening
        </span>
        <Button onClick={() => navigate('/create/export')} size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Full-height 3D viewer */}
      <div className="flex-1" style={{ minHeight: 0 }}>
        <Card3DViewer layers={layers3D} mechanism={mechanism} height="100%" />
      </div>
    </div>
  );
}
