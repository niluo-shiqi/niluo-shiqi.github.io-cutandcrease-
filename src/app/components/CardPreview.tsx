import { motion } from 'motion/react';
import { Button } from './ui/button';

interface CardPreviewProps {
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
  isOpen: boolean;
  onToggle: () => void;
}

export function CardPreview({ cardData, isOpen, onToggle }: CardPreviewProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-md aspect-[3/2] perspective-[1000px]">
        <div className="relative w-full h-full">
          {/* Card Base */}
          <motion.div
            className="absolute inset-0 rounded-lg shadow-2xl"
            style={{
              backgroundColor: cardData.background,
              transformStyle: 'preserve-3d',
            }}
            animate={{
              rotateX: isOpen ? -15 : 0,
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            {/* Front Cover */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center">
                <h3 className="text-3xl font-bold mb-2" style={{ color: cardData.foreground }}>
                  {cardData.text}
                </h3>
                <p className="text-lg opacity-80" style={{ color: cardData.foreground }}>
                  {cardData.subtext}
                </p>
              </div>
            </div>

            {/* Pop-up Layers */}
            {isOpen && (
              <div className="absolute inset-0 flex items-center justify-center">
                {cardData.popupLayers.map((layer, index) => (
                  <motion.div
                    key={layer.id}
                    className="absolute rounded-lg shadow-lg"
                    style={{
                      backgroundColor: layer.color,
                      width: `${layer.width}%`,
                      height: `${layer.height}%`,
                    }}
                    initial={{
                      z: 0,
                      rotateX: 0,
                      opacity: 0,
                    }}
                    animate={{
                      z: layer.depth,
                      rotateX: -90 + (index * 10),
                      opacity: 1,
                    }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Button
        onClick={onToggle}
        size="lg"
        className="w-full max-w-xs"
      >
        {isOpen ? 'Close Card' : 'Open Card'}
      </Button>

      <div className="text-sm text-gray-600 text-center">
        Click the button to {isOpen ? 'close' : 'open'} the pop-up card
      </div>
    </div>
  );
}
