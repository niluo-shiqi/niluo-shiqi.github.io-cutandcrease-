import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Trash2, Plus } from 'lucide-react';

interface CardEditorProps {
  cardData: {
    background: string;
    foreground: string;
    text: string;
    subtext: string;
    image: string;
    popupLayers: Array<{
      id: number;
      depth: number;
      color: string;
      width: number;
      height: number;
    }>;
  };
  setCardData: (data: any) => void;
}

export function CardEditor({ cardData, setCardData }: CardEditorProps) {
  const updateCardData = (field: string, value: any) => {
    setCardData({ ...cardData, [field]: value });
  };

  const updateLayer = (id: number, field: string, value: any) => {
    setCardData({
      ...cardData,
      popupLayers: cardData.popupLayers.map(layer =>
        layer.id === id ? { ...layer, [field]: value } : layer
      ),
    });
  };

  const addLayer = () => {
    const maxId = Math.max(...cardData.popupLayers.map(l => l.id), 0);
    const maxDepth = Math.max(...cardData.popupLayers.map(l => l.depth), 0);
    setCardData({
      ...cardData,
      popupLayers: [
        ...cardData.popupLayers,
        {
          id: maxId + 1,
          depth: maxDepth + 20,
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
          width: 50,
          height: 35,
        },
      ],
    });
  };

  const removeLayer = (id: number) => {
    setCardData({
      ...cardData,
      popupLayers: cardData.popupLayers.filter(layer => layer.id !== id),
    });
  };

  return (
    <Tabs defaultValue="text" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="text">Text</TabsTrigger>
        <TabsTrigger value="colors">Colors</TabsTrigger>
        <TabsTrigger value="layers">Layers</TabsTrigger>
      </TabsList>

      <TabsContent value="text" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="main-text">Main Text</Label>
          <Input
            id="main-text"
            value={cardData.text}
            onChange={(e) => updateCardData('text', e.target.value)}
            placeholder="Enter main text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtext">Subtext</Label>
          <Textarea
            id="subtext"
            value={cardData.subtext}
            onChange={(e) => updateCardData('subtext', e.target.value)}
            placeholder="Enter subtext"
            rows={3}
          />
        </div>
      </TabsContent>

      <TabsContent value="colors" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="bg-color">Background Color</Label>
          <div className="flex gap-2">
            <Input
              id="bg-color"
              type="color"
              value={cardData.background}
              onChange={(e) => updateCardData('background', e.target.value)}
              className="w-20 h-10"
            />
            <Input
              value={cardData.background}
              onChange={(e) => updateCardData('background', e.target.value)}
              placeholder="#ffffff"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fg-color">Text Color</Label>
          <div className="flex gap-2">
            <Input
              id="fg-color"
              type="color"
              value={cardData.foreground}
              onChange={(e) => updateCardData('foreground', e.target.value)}
              className="w-20 h-10"
            />
            <Input
              value={cardData.foreground}
              onChange={(e) => updateCardData('foreground', e.target.value)}
              placeholder="#4a90e2"
              className="flex-1"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="layers" className="space-y-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Pop-up Layers</h3>
          <Button onClick={addLayer} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Add Layer
          </Button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {cardData.popupLayers.map((layer, index) => (
            <div key={layer.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Layer {index + 1}</span>
                <Button
                  onClick={() => removeLayer(layer.id)}
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={layer.color}
                    onChange={(e) => updateLayer(layer.id, 'color', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={layer.color}
                    onChange={(e) => updateLayer(layer.id, 'color', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Depth: {layer.depth}px</Label>
                <Slider
                  value={[layer.depth]}
                  onValueChange={([value]) => updateLayer(layer.id, 'depth', value)}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Width: {layer.width}%</Label>
                  <Slider
                    value={[layer.width]}
                    onValueChange={([value]) => updateLayer(layer.id, 'width', value)}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Height: {layer.height}%</Label>
                  <Slider
                    value={[layer.height]}
                    onValueChange={([value]) => updateLayer(layer.id, 'height', value)}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
