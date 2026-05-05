import { renderMechanismDiagram } from './MechanismDiagrams';

interface InstructionDiagramProps {
  type: string;
  design: any;
}

export function InstructionDiagram({ type, design }: InstructionDiagramProps) {
  // Check if it's a mechanism-specific diagram
  const mechanismDiagram = renderMechanismDiagram(type);
  if (mechanismDiagram) {
    return mechanismDiagram;
  }

  // Safely resolve the design name — null means we're in the Learn (mechanism) track
  const designName: string = design?.name ?? 'Hearts';

  const diagrams: Record<string, JSX.Element> = {
    materials: (
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center gap-4 flex-wrap">
        <div className="text-center">
          <div className="w-12 h-16 bg-white border-2 border-gray-400 rounded-sm mb-1"></div>
          <span className="text-xs">Paper</span>
        </div>
        <div className="text-center">
          <svg width="48" height="48" className="mb-1">
            <line x1="4" y1="44" x2="44" y2="4" stroke="#374151" strokeWidth="2" />
            <circle cx="44" cy="4" r="3" fill="#FF6B6B" />
          </svg>
          <span className="text-xs">Pencil</span>
        </div>
        <div className="text-center">
          <svg width="48" height="48" className="mb-1">
            <path d="M 10 38 L 24 10 L 28 10 L 42 38 L 38 38 L 34 28 L 18 28 L 14 38 Z M 20 24 L 32 24 L 26 12 Z" fill="#3B82F6" />
          </svg>
          <span className="text-xs">Markers</span>
        </div>
      </div>
    ),
    draw: (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
          <rect x="10" y="10" width="180" height="180" fill="#FAFAFA" stroke="#D1D5DB" strokeWidth="2" />
          <g transform="translate(100, 100)">
            {renderDesignSvg(designName)}
          </g>
          <text x="100" y="195" textAnchor="middle" className="text-xs" fill="#6B7280">
            Draw your design
          </text>
        </svg>
      </div>
    ),
    color: (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
          <rect x="10" y="10" width="180" height="180" fill="#FAFAFA" stroke="#D1D5DB" strokeWidth="2" />
          <g transform="translate(100, 100)">
            {renderDesignSvgColored(designName)}
          </g>
          <text x="100" y="195" textAnchor="middle" className="text-xs" fill="#6B7280">
            Add color & details
          </text>
        </svg>
      </div>
    ),
    cut: (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
          <rect x="10" y="10" width="180" height="180" fill="#FAFAFA" stroke="#D1D5DB" strokeWidth="2" />
          <g transform="translate(100, 100)">
            {renderDesignSvgColored(designName)}
            <path d="M -50,-50 Q -60,-40 -50,-30" stroke="#EF4444" strokeWidth="2" fill="none" strokeDasharray="5,5" />
            <path d="M 50,-50 Q 60,-40 50,-30" stroke="#EF4444" strokeWidth="2" fill="none" strokeDasharray="5,5" />
            <path d="M -50,50 Q -40,60 -30,50" stroke="#EF4444" strokeWidth="2" fill="none" strokeDasharray="5,5" />
            <path d="M 50,50 Q 40,60 30,50" stroke="#EF4444" strokeWidth="2" fill="none" strokeDasharray="5,5" />
          </g>
          <text x="100" y="195" textAnchor="middle" className="text-xs" fill="#6B7280">
            Cut along outline
          </text>
        </svg>
      </div>
    ),
    'fold-base': (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="160" viewBox="0 0 240 160" className="mx-auto">
          <rect x="20" y="20" width="100" height="120" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <rect x="120" y="20" width="100" height="120" fill="#E5E7EB" stroke="#374151" strokeWidth="2" />
          <line x1="120" y1="20" x2="120" y2="140" stroke="#3B82F6" strokeWidth="2" strokeDasharray="8,4" />
          <text x="120" y="155" textAnchor="middle" className="text-xs" fill="#6B7280">
            Fold in half
          </text>
        </svg>
      </div>
    ),
    slits: (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="180" viewBox="0 0 240 180" className="mx-auto">
          <rect x="70" y="20" width="100" height="120" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <line x1="120" y1="20" x2="120" y2="140" stroke="#3B82F6" strokeWidth="1" strokeDasharray="8,4" />

          <line x1="90" y1="60" x2="90" y2="90" stroke="#EF4444" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="150" y1="60" x2="150" y2="90" stroke="#EF4444" strokeWidth="3" strokeDasharray="5,5" />

          <line x1="85" y1="75" x2="95" y2="75" stroke="#6B7280" strokeWidth="1" />
          <line x1="145" y1="75" x2="155" y2="75" stroke="#6B7280" strokeWidth="1" />
          <text x="120" y="72" textAnchor="middle" className="text-xs" fill="#6B7280">2"</text>

          <text x="120" y="165" textAnchor="middle" className="text-xs" fill="#6B7280">
            Cut two parallel slits
          </text>
        </svg>
      </div>
    ),
    tab: (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="200" viewBox="0 0 240 200" className="mx-auto">
          <g transform="perspective(600)">
            <path d="M 70,80 L 70,140 L 100,120 L 100,60 Z" fill="#E5E7EB" stroke="#374151" strokeWidth="2" />
            <path d="M 170,80 L 170,140 L 140,120 L 140,60 Z" fill="#D1D5DB" stroke="#374151" strokeWidth="2" />
            <rect x="100" y="60" width="40" height="60" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />

            <line x1="100" y1="60" x2="100" y2="120" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4,4,1,4" />
            <line x1="140" y1="60" x2="140" y2="120" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4,4,1,4" />
          </g>
          <text x="120" y="185" textAnchor="middle" className="text-xs" fill="#6B7280">
            Push tab forward
          </text>
        </svg>
      </div>
    ),
    glue: (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="200" viewBox="0 0 240 200" className="mx-auto">
          <rect x="90" y="80" width="60" height="40" fill="#FCD34D" fillOpacity="0.5" stroke="#F59E0B" strokeWidth="2" />
          <g transform="translate(120, 60)">
            {renderDesignSvgColored(designName, 30)}
          </g>
          <path d="M 120,120 L 120,140" stroke="#6B7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <polygon points="0 0, 10 5, 0 10" fill="#6B7280" />
            </marker>
          </defs>
          <text x="120" y="185" textAnchor="middle" className="text-xs" fill="#6B7280">
            Glue design to tab
          </text>
        </svg>
      </div>
    ),
    test: (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="180" viewBox="0 0 240 180" className="mx-auto">
          <rect x="40" y="60" width="80" height="80" fill="#F3F4F6" stroke="#374151" strokeWidth="2" />
          <rect x="120" y="60" width="80" height="80" fill="#E5E7EB" stroke="#374151" strokeWidth="2" />
          <g transform="translate(120, 80)">
            {renderDesignSvgColored(designName, 25)}
          </g>
          <path d="M 50,30 Q 80,10 120,30" stroke="#10B981" strokeWidth="2" fill="none" markerEnd="url(#arrowgreen)" />
          <defs>
            <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <polygon points="0 0, 10 5, 0 10" fill="#10B981" />
            </marker>
          </defs>
          <text x="120" y="165" textAnchor="middle" className="text-xs" fill="#6B7280">
            Open and close to test
          </text>
        </svg>
      </div>
    ),
    layers: (
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <svg width="240" height="200" viewBox="0 0 240 200" className="mx-auto">
          <g transform="perspective(600)">
            <rect x="100" y="100" width="40" height="40" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2" opacity="0.6" />
            <rect x="100" y="70" width="40" height="40" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="2" opacity="0.8" />
            <rect x="100" y="40" width="40" height="40" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2" />
            <g transform="translate(120, 40)">
              {renderDesignSvgColored(designName, 20)}
            </g>
          </g>
          <text x="120" y="185" textAnchor="middle" className="text-xs" fill="#6B7280">
            Add multiple layers for depth
          </text>
        </svg>
      </div>
    ),
  };

  return diagrams[type] || null;
}

function renderDesignSvg(name: string, size = 60) {
  const designs: Record<string, JSX.Element> = {
    'Hearts': (
      <path
        d={`M 0,-${size/4}
            C -${size/3},-${size/2} -${size/2},-${size/3} -${size/2},0
            C -${size/2},${size/4} -${size/4},${size/2} 0,${size/1.5}
            C ${size/4},${size/2} ${size/2},${size/4} ${size/2},0
            C ${size/2},-${size/3} ${size/3},-${size/2} 0,-${size/4} Z`}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />
    ),
    'Flowers': (
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            cx={Math.cos((i * 72 * Math.PI) / 180) * size/3}
            cy={Math.sin((i * 72 * Math.PI) / 180) * size/3}
            rx={size/4}
            ry={size/3}
            fill="none"
            stroke="#374151"
            strokeWidth="2"
          />
        ))}
        <circle cx="0" cy="0" r={size/5} fill="none" stroke="#374151" strokeWidth="2" />
      </g>
    ),
    'Stars': (
      <path
        d={`M 0,-${size/2}
            L ${size/8},-${size/6}
            L ${size/2},-${size/6}
            L ${size/5},${size/12}
            L ${size/3},${size/2}
            L 0,${size/4}
            L -${size/3},${size/2}
            L -${size/5},${size/12}
            L -${size/2},-${size/6}
            L -${size/8},-${size/6} Z`}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />
    ),
    'Birthday Cake': (
      <g>
        <rect x={-size/3} y={size/6} width={size*2/3} height={size/3} fill="none" stroke="#374151" strokeWidth="2" />
        <rect x={-size/4} y={-size/6} width={size/2} height={size/3} fill="none" stroke="#374151" strokeWidth="2" />
        <line x1="0" y1={-size/6} x2="0" y2={-size/2} stroke="#374151" strokeWidth="2" />
        <ellipse cx="0" cy={-size/2} rx={size/12} ry={size/8} fill="none" stroke="#374151" strokeWidth="2" />
      </g>
    ),
    'Gift Box': (
      <g>
        <rect x={-size/3} y={-size/4} width={size*2/3} height={size*2/3} fill="none" stroke="#374151" strokeWidth="2" />
        <line x1={-size/3} y1="0" x2={size/3} y2="0" stroke="#374151" strokeWidth="2" />
        <line x1="0" y1={-size/4} x2="0" y2={size*5/12} stroke="#374151" strokeWidth="2" />
        <path d={`M -${size/6},-${size/4} Q 0,-${size/2} ${size/6},-${size/4}`} fill="none" stroke="#374151" strokeWidth="2" />
        <circle cx={-size/12} cy={-size/3} r={size/12} fill="none" stroke="#374151" strokeWidth="2" />
        <circle cx={size/12} cy={-size/3} r={size/12} fill="none" stroke="#374151" strokeWidth="2" />
      </g>
    ),
    'Sun': (
      <g>
        <circle cx="0" cy="0" r={size/4} fill="none" stroke="#374151" strokeWidth="2" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line
            key={i}
            x1={Math.cos((i * 45 * Math.PI) / 180) * size/3}
            y1={Math.sin((i * 45 * Math.PI) / 180) * size/3}
            x2={Math.cos((i * 45 * Math.PI) / 180) * size/2}
            y2={Math.sin((i * 45 * Math.PI) / 180) * size/2}
            stroke="#374151"
            strokeWidth="2"
          />
        ))}
      </g>
    ),
    'Moon': (
      <g>
        <circle cx="0" cy="0" r={size/2.5} fill="none" stroke="#374151" strokeWidth="2" />
        <circle cx={size/6} cy="0" r={size/2.5} fill="#fff" stroke="none" />
      </g>
    ),
    'Clouds': (
      <g>
        <circle cx={-size/4} cy="0" r={size/5} fill="none" stroke="#374151" strokeWidth="2" />
        <circle cx="0" cy={-size/6} r={size/4} fill="none" stroke="#374151" strokeWidth="2" />
        <circle cx={size/4} cy="0" r={size/5} fill="none" stroke="#374151" strokeWidth="2" />
      </g>
    ),
    'Trees': (
      <g>
        <path d={`M 0,-${size/2} L -${size/3},0 L ${size/3},0 Z`} fill="none" stroke="#374151" strokeWidth="2" />
        <path d={`M 0,-${size/4} L -${size/4},${size/6} L ${size/4},${size/6} Z`} fill="none" stroke="#374151" strokeWidth="2" />
        <rect x={-size/12} y={size/6} width={size/6} height={size/3} fill="none" stroke="#374151" strokeWidth="2" />
      </g>
    ),
    'Sparkles': (
      <g>
        <path d={`M 0,-${size/3} L ${size/12},-${size/12} L ${size/3},0 L ${size/12},${size/12} L 0,${size/3} L -${size/12},${size/12} L -${size/3},0 L -${size/12},-${size/12} Z`} fill="none" stroke="#374151" strokeWidth="2" />
        <circle cx={size/2.5} cy={-size/3} r={size/10} fill="none" stroke="#374151" strokeWidth="2" />
        <circle cx={-size/3} cy={size/2.5} r={size/12} fill="none" stroke="#374151" strokeWidth="2" />
      </g>
    ),
    'Music Notes': (
      <g>
        <ellipse cx={-size/4} cy={size/3} rx={size/6} ry={size/8} fill="none" stroke="#374151" strokeWidth="2" />
        <line x1={-size/12} y1={size/3} x2={-size/12} y2={-size/3} stroke="#374151" strokeWidth="2" />
        <ellipse cx={size/6} cy={size/4} rx={size/6} ry={size/8} fill="none" stroke="#374151" strokeWidth="2" />
        <line x1={size/3} y1={size/4} x2={size/3} y2={-size/2} stroke="#374151" strokeWidth="2" />
      </g>
    ),
    'Hearts Stack': (
      <g>
        <path
          d={`M 0,-${size/6}
              C -${size/4},-${size/3} -${size/3},-${size/4} -${size/3},0
              C -${size/3},${size/6} -${size/6},${size/3} 0,${size/2.2}
              C ${size/6},${size/3} ${size/3},${size/6} ${size/3},0
              C ${size/3},-${size/4} ${size/4},-${size/3} 0,-${size/6} Z`}
          fill="none"
          stroke="#374151"
          strokeWidth="2"
        />
        <path
          d={`M ${size/8},-${size/2.5}
              C 0,-${size/2} -${size/6},-${size/2.2} -${size/6},-${size/4}
              C -${size/6},-${size/12} -${size/12},0 ${size/8},${size/6}
              C ${size/4},0 ${size/3},-${size/12} ${size/3},-${size/4}
              C ${size/3},-${size/2.2} ${size/5},-${size/2} ${size/8},-${size/2.5} Z`}
          fill="none"
          stroke="#374151"
          strokeWidth="2"
        />
      </g>
    ),
  };

  return designs[name] || designs['Hearts'];
}

function renderDesignSvgColored(name: string, size = 60) {
  const designs: Record<string, JSX.Element> = {
    'Hearts': (
      <path
        d={`M 0,-${size/4}
            C -${size/3},-${size/2} -${size/2},-${size/3} -${size/2},0
            C -${size/2},${size/4} -${size/4},${size/2} 0,${size/1.5}
            C ${size/4},${size/2} ${size/2},${size/4} ${size/2},0
            C ${size/2},-${size/3} ${size/3},-${size/2} 0,-${size/4} Z`}
        fill="#EF4444"
        stroke="#991B1B"
        strokeWidth="2"
      />
    ),
    'Flowers': (
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            cx={Math.cos((i * 72 * Math.PI) / 180) * size/3}
            cy={Math.sin((i * 72 * Math.PI) / 180) * size/3}
            rx={size/4}
            ry={size/3}
            fill="#EC4899"
            stroke="#BE185D"
            strokeWidth="2"
          />
        ))}
        <circle cx="0" cy="0" r={size/5} fill="#FCD34D" stroke="#F59E0B" strokeWidth="2" />
      </g>
    ),
    'Stars': (
      <path
        d={`M 0,-${size/2}
            L ${size/8},-${size/6}
            L ${size/2},-${size/6}
            L ${size/5},${size/12}
            L ${size/3},${size/2}
            L 0,${size/4}
            L -${size/3},${size/2}
            L -${size/5},${size/12}
            L -${size/2},-${size/6}
            L -${size/8},-${size/6} Z`}
        fill="#FCD34D"
        stroke="#F59E0B"
        strokeWidth="2"
      />
    ),
    'Birthday Cake': (
      <g>
        <rect x={-size/3} y={size/6} width={size*2/3} height={size/3} fill="#EC4899" stroke="#BE185D" strokeWidth="2" />
        <rect x={-size/4} y={-size/6} width={size/2} height={size/3} fill="#F472B6" stroke="#BE185D" strokeWidth="2" />
        <line x1="0" y1={-size/6} x2="0" y2={-size/2} stroke="#374151" strokeWidth="2" />
        <ellipse cx="0" cy={-size/2} rx={size/12} ry={size/8} fill="#FCD34D" stroke="#F59E0B" strokeWidth="2" />
      </g>
    ),
    'Gift Box': (
      <g>
        <rect x={-size/3} y={-size/4} width={size*2/3} height={size*2/3} fill="#60A5FA" stroke="#1E40AF" strokeWidth="2" />
        <line x1={-size/3} y1="0" x2={size/3} y2="0" stroke="#FCD34D" strokeWidth="3" />
        <line x1="0" y1={-size/4} x2="0" y2={size*5/12} stroke="#FCD34D" strokeWidth="3" />
        <path d={`M -${size/6},-${size/4} Q 0,-${size/2} ${size/6},-${size/4}`} fill="none" stroke="#EF4444" strokeWidth="2" />
        <circle cx={-size/12} cy={-size/3} r={size/12} fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
        <circle cx={size/12} cy={-size/3} r={size/12} fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
      </g>
    ),
    'Sun': (
      <g>
        <circle cx="0" cy="0" r={size/4} fill="#FCD34D" stroke="#F59E0B" strokeWidth="2" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line
            key={i}
            x1={Math.cos((i * 45 * Math.PI) / 180) * size/3}
            y1={Math.sin((i * 45 * Math.PI) / 180) * size/3}
            x2={Math.cos((i * 45 * Math.PI) / 180) * size/2}
            y2={Math.sin((i * 45 * Math.PI) / 180) * size/2}
            stroke="#FB923C"
            strokeWidth="2"
          />
        ))}
      </g>
    ),
    'Moon': (
      <g>
        <circle cx="0" cy="0" r={size/2.5} fill="#818CF8" stroke="#4F46E5" strokeWidth="2" />
        <circle cx={size/6} cy="0" r={size/2.5} fill="#fff" stroke="none" />
      </g>
    ),
    'Clouds': (
      <g>
        <circle cx={-size/4} cy="0" r={size/5} fill="#93C5FD" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="0" cy={-size/6} r={size/4} fill="#BFDBFE" stroke="#3B82F6" strokeWidth="2" />
        <circle cx={size/4} cy="0" r={size/5} fill="#93C5FD" stroke="#3B82F6" strokeWidth="2" />
      </g>
    ),
    'Trees': (
      <g>
        <path d={`M 0,-${size/2} L -${size/3},0 L ${size/3},0 Z`} fill="#22C55E" stroke="#15803D" strokeWidth="2" />
        <path d={`M 0,-${size/4} L -${size/4},${size/6} L ${size/4},${size/6} Z`} fill="#4ADE80" stroke="#15803D" strokeWidth="2" />
        <rect x={-size/12} y={size/6} width={size/6} height={size/3} fill="#78350F" stroke="#451A03" strokeWidth="2" />
      </g>
    ),
    'Sparkles': (
      <g>
        <path d={`M 0,-${size/3} L ${size/12},-${size/12} L ${size/3},0 L ${size/12},${size/12} L 0,${size/3} L -${size/12},${size/12} L -${size/3},0 L -${size/12},-${size/12} Z`} fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
        <circle cx={size/2.5} cy={-size/3} r={size/10} fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
        <circle cx={-size/3} cy={size/2.5} r={size/12} fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
      </g>
    ),
    'Music Notes': (
      <g>
        <ellipse cx={-size/4} cy={size/3} rx={size/6} ry={size/8} fill="#A78BFA" stroke="#6D28D9" strokeWidth="2" />
        <line x1={-size/12} y1={size/3} x2={-size/12} y2={-size/3} stroke="#6D28D9" strokeWidth="2" />
        <ellipse cx={size/6} cy={size/4} rx={size/6} ry={size/8} fill="#C4B5FD" stroke="#6D28D9" strokeWidth="2" />
        <line x1={size/3} y1={size/4} x2={size/3} y2={-size/2} stroke="#6D28D9" strokeWidth="2" />
      </g>
    ),
    'Hearts Stack': (
      <g>
        <path
          d={`M 0,-${size/6}
              C -${size/4},-${size/3} -${size/3},-${size/4} -${size/3},0
              C -${size/3},${size/6} -${size/6},${size/3} 0,${size/2.2}
              C ${size/6},${size/3} ${size/3},${size/6} ${size/3},0
              C ${size/3},-${size/4} ${size/4},-${size/3} 0,-${size/6} Z`}
          fill="#FB7185"
          stroke="#BE123C"
          strokeWidth="2"
        />
        <path
          d={`M ${size/8},-${size/2.5}
              C 0,-${size/2} -${size/6},-${size/2.2} -${size/6},-${size/4}
              C -${size/6},-${size/12} -${size/12},0 ${size/8},${size/6}
              C ${size/4},0 ${size/3},-${size/12} ${size/3},-${size/4}
              C ${size/3},-${size/2.2} ${size/5},-${size/2} ${size/8},-${size/2.5} Z`}
          fill="#FECDD3"
          stroke="#BE123C"
          strokeWidth="2"
        />
      </g>
    ),
  };

  return designs[name] || designs['Hearts'];
}
