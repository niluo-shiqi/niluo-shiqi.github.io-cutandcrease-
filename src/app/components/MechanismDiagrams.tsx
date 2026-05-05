// Additional diagrams for different mechanisms

export function renderMechanismDiagram(type: string) {
  const diagrams: Record<string, JSX.Element> = {
    'v-fold-tab': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="160" viewBox="0 0 240 160" className="mx-auto">
          <rect x="70" y="40" width="100" height="80" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <line x1="120" y1="40" x2="120" y2="120" stroke="#3B82F6" strokeWidth="2" strokeDasharray="8,4" />
          <path d="M 70,80 L 120,60 L 170,80" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4,4,1,4" fill="none" />
          <text x="120" y="145" textAnchor="middle" className="text-xs" fill="#6B7280">
            Fold paper in V-shape
          </text>
        </svg>
      </div>
    ),
    'v-fold-attach': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="180" viewBox="0 0 240 180" className="mx-auto">
          <rect x="60" y="40" width="60" height="100" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <rect x="120" y="40" width="60" height="100" fill="#E5E7EB" stroke="#374151" strokeWidth="2" />
          <line x1="120" y1="40" x2="120" y2="140" stroke="#3B82F6" strokeWidth="2" strokeDasharray="8,4" />

          <path d="M 90,90 L 120,70 L 150,90" fill="none" stroke="#374151" strokeWidth="2" />
          <rect x="85" y="68" width="10" height="25" fill="#FCD34D" fillOpacity="0.5" stroke="#F59E0B" strokeWidth="1" />
          <rect x="145" y="68" width="10" height="25" fill="#FCD34D" fillOpacity="0.5" stroke="#F59E0B" strokeWidth="1" />

          <text x="120" y="165" textAnchor="middle" className="text-xs" fill="#6B7280">
            Glue V-fold edges to card
          </text>
        </svg>
      </div>
    ),
    'v-fold-design': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="180" viewBox="0 0 240 180" className="mx-auto">
          <rect x="60" y="60" width="60" height="80" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <rect x="120" y="60" width="60" height="80" fill="#E5E7EB" stroke="#374151" strokeWidth="2" />

          <path d="M 90,100 L 120,80 L 150,100" fill="#93C5FD" stroke="#374151" strokeWidth="2" />
          <circle cx="120" cy="70" r="15" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />

          <text x="120" y="165" textAnchor="middle" className="text-xs" fill="#6B7280">
            Attach design to V-fold
          </text>
        </svg>
      </div>
    ),
    'parallel-slits': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="180" viewBox="0 0 240 180" className="mx-auto">
          <rect x="70" y="20" width="100" height="140" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <line x1="120" y1="20" x2="120" y2="160" stroke="#3B82F6" strokeWidth="1" strokeDasharray="8,4" />

          <line x1="95" y1="50" x2="95" y2="70" stroke="#EF4444" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="145" y1="50" x2="145" y2="70" stroke="#EF4444" strokeWidth="3" strokeDasharray="5,5" />

          <line x1="100" y1="85" x2="100" y2="105" stroke="#EF4444" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="140" y1="85" x2="140" y2="105" stroke="#EF4444" strokeWidth="3" strokeDasharray="5,5" />

          <line x1="105" y1="120" x2="105" y2="140" stroke="#EF4444" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="135" y1="120" x2="135" y2="140" stroke="#EF4444" strokeWidth="3" strokeDasharray="5,5" />

          <text x="120" y="175" textAnchor="middle" className="text-xs" fill="#6B7280">
            Cut multiple parallel slits
          </text>
        </svg>
      </div>
    ),
    'parallel-tabs': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="200" viewBox="0 0 240 200" className="mx-auto">
          <rect x="100" y="120" width="40" height="20" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2" />
          <rect x="105" y="90" width="30" height="20" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="2" />
          <rect x="110" y="60" width="20" height="20" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2" />

          <text x="120" y="185" textAnchor="middle" className="text-xs" fill="#6B7280">
            Fold tabs at different depths
          </text>
        </svg>
      </div>
    ),
    'parallel-layers': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="200" viewBox="0 0 240 200" className="mx-auto">
          <ellipse cx="120" cy="130" rx="25" ry="20" fill="#EC4899" stroke="#BE185D" strokeWidth="2" />
          <ellipse cx="120" cy="100" rx="20" ry="15" fill="#F472B6" stroke="#BE185D" strokeWidth="2" />
          <ellipse cx="120" cy="75" rx="15" ry="12" fill="#FBCFE8" stroke="#BE185D" strokeWidth="2" />

          <text x="120" y="185" textAnchor="middle" className="text-xs" fill="#6B7280">
            Layer elements for 3D depth
          </text>
        </svg>
      </div>
    ),
    'box-template': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="240" viewBox="0 0 240 240" className="mx-auto">
          <rect x="80" y="20" width="80" height="60" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <rect x="20" y="80" width="60" height="80" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <rect x="80" y="80" width="80" height="80" fill="#E5E7EB" stroke="#374151" strokeWidth="2" />
          <rect x="160" y="80" width="60" height="80" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <rect x="80" y="160" width="80" height="60" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />

          <text x="120" y="235" textAnchor="middle" className="text-xs" fill="#6B7280">
            Cut cross-shaped template
          </text>
        </svg>
      </div>
    ),
    'box-fold': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="200" viewBox="0 0 240 200" className="mx-auto">
          <path d="M 80,100 L 80,60 L 160,60 L 160,100 L 140,120 L 100,120 Z" fill="#E5E7EB" stroke="#374151" strokeWidth="2" />
          <path d="M 80,100 L 100,120 L 100,160 L 80,140 Z" fill="#D1D5DB" stroke="#374151" strokeWidth="2" />
          <path d="M 160,100 L 140,120 L 140,160 L 160,140 Z" fill="#C4C4C4" stroke="#374151" strokeWidth="2" />
          <path d="M 100,120 L 100,160 L 140,160 L 140,120 Z" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />

          <text x="120" y="190" textAnchor="middle" className="text-xs" fill="#6B7280">
            Fold into box shape
          </text>
        </svg>
      </div>
    ),
    'box-attach': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="200" viewBox="0 0 240 200" className="mx-auto">
          <rect x="60" y="80" width="60" height="80" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <rect x="120" y="80" width="60" height="80" fill="#E5E7EB" stroke="#374151" strokeWidth="2" />

          <path d="M 100,120 L 100,100 L 140,100 L 140,120 L 130,130 L 110,130 Z" fill="#D1D5DB" stroke="#374151" strokeWidth="2" />
          <rect x="95" y="128" width="15" height="32" fill="#FCD34D" fillOpacity="0.5" stroke="#F59E0B" strokeWidth="1" />
          <rect x="130" y="128" width="15" height="32" fill="#FCD34D" fillOpacity="0.5" stroke="#F59E0B" strokeWidth="1" />

          <text x="120" y="190" textAnchor="middle" className="text-xs" fill="#6B7280">
            Glue box to card fold
          </text>
        </svg>
      </div>
    ),
    'rotate-arm': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="180" viewBox="0 0 240 180" className="mx-auto">
          <rect x="60" y="40" width="60" height="100" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <rect x="120" y="40" width="60" height="100" fill="#E5E7EB" stroke="#374151" strokeWidth="2" />
          <line x1="120" y1="40" x2="120" y2="140" stroke="#3B82F6" strokeWidth="2" strokeDasharray="8,4" />

          <rect x="115" y="80" width="10" height="40" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2" />

          <text x="120" y="165" textAnchor="middle" className="text-xs" fill="#6B7280">
            Attach strip to card fold
          </text>
        </svg>
      </div>
    ),
    'rotate-connect': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="180" viewBox="0 0 240 180" className="mx-auto">
          <rect x="60" y="60" width="60" height="80" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <rect x="120" y="60" width="60" height="80" fill="#E5E7EB" stroke="#374151" strokeWidth="2" />

          <path d="M 100,100 L 110,80 L 130,80 L 140,100" stroke="#3B82F6" strokeWidth="2" fill="none" />
          <circle cx="120" cy="80" r="8" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2" />

          <text x="120" y="165" textAnchor="middle" className="text-xs" fill="#6B7280">
            Connect arms with circle
          </text>
        </svg>
      </div>
    ),
    'rotate-design': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="180" viewBox="0 0 240 180" className="mx-auto">
          <rect x="60" y="60" width="60" height="80" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <rect x="120" y="60" width="60" height="80" fill="#E5E7EB" stroke="#374151" strokeWidth="2" />

          <path d="M 100,100 L 110,70 L 130,70 L 140,100" stroke="#3B82F6" strokeWidth="2" fill="none" />
          <circle cx="120" cy="60" r="15" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2" />

          <text x="120" y="165" textAnchor="middle" className="text-xs" fill="#6B7280">
            Design rotates when opened
          </text>
        </svg>
      </div>
    ),
    'accordion-fold': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="160" viewBox="0 0 240 160" className="mx-auto">
          <path d="M 40,80 L 70,60 L 100,80 L 130,60 L 160,80 L 190,60 L 220,80"
                stroke="#374151" strokeWidth="2" fill="none" />
          <path d="M 40,80 L 70,60" stroke="#3B82F6" strokeWidth="2" strokeDasharray="8,4" />
          <path d="M 70,60 L 100,80" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4,4,1,4" />
          <path d="M 100,80 L 130,60" stroke="#3B82F6" strokeWidth="2" strokeDasharray="8,4" />
          <path d="M 130,60 L 160,80" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4,4,1,4" />

          <text x="120" y="145" textAnchor="middle" className="text-xs" fill="#6B7280">
            Fold strip in zigzag pattern
          </text>
        </svg>
      </div>
    ),
    'accordion-attach': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="180" viewBox="0 0 240 180" className="mx-auto">
          <rect x="60" y="60" width="60" height="80" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <rect x="120" y="60" width="60" height="80" fill="#E5E7EB" stroke="#374151" strokeWidth="2" />

          <path d="M 80,100 L 95,90 L 110,100 L 125,90 L 140,100 L 155,90 L 170,100"
                stroke="#3B82F6" strokeWidth="2" fill="none" />
          <rect x="75" y="95" width="10" height="10" fill="#FCD34D" fillOpacity="0.5" stroke="#F59E0B" strokeWidth="1" />
          <rect x="165" y="95" width="10" height="10" fill="#FCD34D" fillOpacity="0.5" stroke="#F59E0B" strokeWidth="1" />

          <text x="120" y="165" textAnchor="middle" className="text-xs" fill="#6B7280">
            Glue ends to card sides
          </text>
        </svg>
      </div>
    ),
    'accordion-design': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="180" viewBox="0 0 240 180" className="mx-auto">
          <rect x="60" y="60" width="60" height="80" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <rect x="120" y="60" width="60" height="80" fill="#E5E7EB" stroke="#374151" strokeWidth="2" />

          <path d="M 80,100 L 95,85 L 110,100 L 125,85 L 140,100 L 155,85 L 170,100"
                stroke="#3B82F6" strokeWidth="2" fill="none" />
          <circle cx="95" cy="85" r="6" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
          <circle cx="125" cy="85" r="6" fill="#EC4899" stroke="#BE185D" strokeWidth="1" />
          <circle cx="155" cy="85" r="6" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />

          <text x="120" y="165" textAnchor="middle" className="text-xs" fill="#6B7280">
            Add designs to accordion
          </text>
        </svg>
      </div>
    ),
  };

  return diagrams[type] || null;
}
