import { Link, useLocation } from 'react-router';
import { BookOpen, Wand2, FolderHeart } from 'lucide-react';

function NavLink({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + '/');
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-gray-900 text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo wordmark */}
        <Link to="/" className="text-2xl font-serif tracking-wide hover:opacity-80 transition-opacity">
          <span className="text-gray-900">Crease &amp; </span>
          <span>
            <span className="text-purple-500">C</span>
            <span className="text-orange-400">a</span>
            <span className="text-yellow-400">n</span>
            <span className="text-green-400">v</span>
            <span className="text-blue-400">a</span>
            <span className="text-red-400">s</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <NavLink to="/learn"    icon={BookOpen}    label="Learn"    />
          <NavLink to="/create"   icon={Wand2}       label="Create"   />
          <NavLink to="/my-cards" icon={FolderHeart} label="My Cards" />
        </nav>
      </div>
    </header>
  );
}
