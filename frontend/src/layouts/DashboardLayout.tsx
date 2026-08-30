import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Clock,
  BarChart3,
  Brain,
  BookOpen,
  Menu,
  X,
  Brain as LogoIcon,
} from 'lucide-react';
import { APP_NAME } from '../constants';
import { cn } from '../utils';

const NAV_ITEMS = [
  { label: 'Overview', path: '/dashboard/overview', icon: LayoutDashboard },
  { label: 'Analyze Text', path: '/dashboard/analyze', icon: FileText },
  { label: 'Batch Analysis', path: '/dashboard/batch', icon: Upload },
  { label: 'History', path: '/dashboard/history', icon: Clock },
  { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Model', path: '/dashboard/model', icon: Brain },
  { label: 'Documentation', path: '/dashboard/docs', icon: BookOpen },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg flex">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          'w-64 bg-white border-r border-border flex flex-col fixed inset-y-0 left-0 z-40 transition-transform duration-200',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 border-b border-border/70 px-5 flex items-center gap-3 bg-gradient-to-r from-blue-50/50 to-transparent">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-700 via-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 ring-1 ring-white/50">
            <LogoIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-text text-sm tracking-tight">{APP_NAME}</span>
              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-md">AI</span>
            </div>
            <span className="block text-[11px] text-text-secondary">Emotion Intelligence</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/dashboard/overview' && location.pathname === '/dashboard');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group',
                  isActive
                    ? 'bg-blue-50/90 text-blue-700 font-semibold shadow-xs shadow-blue-500/5'
                    : 'text-text-secondary hover:bg-slate-50 hover:text-text'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                )}
                <item.icon className={cn('w-4.5 h-4.5 transition-transform group-hover:scale-110', isActive ? 'text-blue-600' : 'text-slate-400')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Active Model Widget */}
        <div className="border-t border-border/80 p-4 bg-slate-50/60 m-3 rounded-xl border">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text">
              <Brain className="w-3.5 h-3.5 text-blue-600" />
              <span>Active Model</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              92.7%
            </span>
          </div>
          <div className="text-[11px] font-medium text-slate-700 truncate" title="Ayush Vishwakarma's model">
            Ayush Vishwakarma's model
          </div>
          <div className="text-[10px] text-text-secondary mt-0.5">
            DistilBERT • 6 Classes
          </div>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-border/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-text-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">INTELLIEMO</span>
              <span className="text-slate-300">/</span>
              <h2 className="text-sm font-semibold text-text">
                {NAV_ITEMS.find((n) => location.pathname === n.path)?.label || 'Overview'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live status badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-full text-xs text-emerald-800 font-medium shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="radar-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="hidden sm:inline">Engine Online</span>
            </div>

            {/* Quick action button */}
            <Link
              to="/dashboard/analyze"
              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Analyze Text</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 flex-1">{<Outlet />}</main>
      </div>
    </div>
  );
}
