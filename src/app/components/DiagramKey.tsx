import { Card } from './ui/card';
import { Scissors, MoveVertical } from 'lucide-react';

export function DiagramKey() {
  const keyItems = [
    {
      label: 'Cut Line',
      element: (
        <svg width="60" height="20" className="inline-block">
          <line x1="0" y1="10" x2="60" y2="10" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
      )
    },
    {
      label: 'Fold Inward (Valley)',
      element: (
        <svg width="60" height="20" className="inline-block">
          <line x1="0" y1="10" x2="60" y2="10" stroke="#3B82F6" strokeWidth="2" strokeDasharray="8,4" />
        </svg>
      )
    },
    {
      label: 'Fold Outward (Mountain)',
      element: (
        <svg width="60" height="20" className="inline-block">
          <line x1="0" y1="10" x2="60" y2="10" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4,4,1,4" />
        </svg>
      )
    },
    {
      label: 'Glue Area',
      element: (
        <svg width="60" height="20" className="inline-block">
          <rect x="0" y="5" width="60" height="10" fill="#FCD34D" fillOpacity="0.5" stroke="#F59E0B" strokeWidth="1" />
        </svg>
      )
    },
  ];

  return (
    <Card className="p-6 mb-8">
      <h3 className="font-semibold text-gray-900 mb-4">Diagram Key</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {keyItems.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <div className="flex items-center justify-center h-8 bg-white border border-gray-200 rounded">
              {item.element}
            </div>
            <span className="text-xs text-gray-600 text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
