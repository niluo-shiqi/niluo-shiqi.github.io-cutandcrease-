import { useNavigate } from 'react-router';
import { ELEMENT_THEMES } from '../../assets/elements/manifest';

export function DesignElementGallery() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Browse Design Elements</h1>
          <p className="text-gray-500">Click a theme to see style variants — no confirmation needed</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {ELEMENT_THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => navigate(`/create/elements/${theme.id}`)}
              className="group bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-200 hover:scale-[1.03] text-center"
            >
              <div className={`${theme.bgColor} rounded-lg p-5 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <theme.icon className={`w-14 h-14 ${theme.color}`} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-gray-900">{theme.label}</h3>
              <p className="text-xs text-gray-400 mt-1">{theme.variants.length} variants</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
