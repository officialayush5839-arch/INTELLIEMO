import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
  Home,
  ExternalLink,
  Activity,
  Terminal,
} from 'lucide-react';
import { APP_NAME } from '../constants';
import { cn } from '../utils';
import { getHealth } from '../api/client';
import { springSnappy } from '../constants/motion';
import { DynamicBackground } from '../components/DynamicBackground';

const NAV_ITEMS = [
  { label: 'Overview', path: '/dashboard/overview', icon: LayoutDashboard, shortcut: '1' },
  { label: 'Analyze Text', path: '/dashboard/analyze', icon: FileText, shortcut: '2' },
  { label: 'Batch Analysis', path: '/dashboard/batch', icon: Upload, shortcut: '3' },
  { label: 'Audit History', path: '/dashboard/history', icon: Clock, shortcut: '4' },
  { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3, shortcut: '5' },
  { label: 'Model Specs', path: '/dashboard/model', icon: Brain, shortcut: '6' },
  { label: 'API Reference', path: '/dashboard/docs', icon: BookOpen, shortcut: '7' },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { data: health } = useQuery({
    queryKey: ['system-health'],
    queryFn: getHealth,
    refetchInterval: 12000,
    retry: 1,
  });

  const isOnline = health?.status === 'healthy' && (health?.model_loaded || health?.model_ready);
  const isWarmingUp = health?.status === 'healthy' && !isOnline;

  // Keyboard navigation shortcuts: Ctrl+1 through Ctrl+7 (or Cmd+1 through Cmd+7)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        const item = NAV_ITEMS.find((n) => n.shortcut === e.key);
        if (item) {
          e.preventDefault();
          navigate(item.path);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F4F4F5] flex selection:bg-zinc-700 selection:text-white relative">
      {/* ── Dynamic Ambient Background ── */}
      <DynamicBackground density={36} className="opacity-50" />

      {/* ── Fixed Monolith Sidebar ── */}
      <aside
        className={cn(
          'w-60 bg-[#09090B] border-r border-[#27272A] flex flex-col fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-out',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-14 border-b border-[#27272A] px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-[#18181B] border border-[#3F3F46] flex items-center justify-center text-zinc-100 group-hover:border-zinc-400 transition-colors">
              <Brain className="w-4 h-4 text-zinc-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-sm tracking-[-0.035em] text-zinc-100 group-hover:text-white transition-colors">
                  {APP_NAME}
                </span>
                <span className="text-[10px] font-mono font-semibold px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono tracking-tight">Ayush's Engine v1.0</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === '/dashboard/overview' && location.pathname === '/dashboard');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors relative group select-none',
                  isActive
                    ? 'text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121215]'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-indicator"
                    className="absolute inset-0 bg-[#18181B] border border-zinc-700/80 rounded-md shadow-xs"
                    transition={springSnappy}
                  />
                )}
                <div className="flex items-center gap-2.5 relative z-10">
                  <item.icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                <span
                  className={cn(
                    'relative z-10 text-[10px] font-mono px-1 py-0.5 rounded transition-opacity',
                    isActive ? 'text-zinc-400 bg-zinc-800/80' : 'text-zinc-600 opacity-60 group-hover:opacity-100'
                  )}
                >
                  ⌘{item.shortcut}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Engine Diagnostics Widget */}
        <div className="p-3 m-2 rounded-lg bg-[#121215] border border-[#27272A] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300">
              <Activity className="w-3.5 h-3.5 text-zinc-400" />
              <span>Model Telemetry</span>
            </div>
            <span
              className={cn(
                'flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border',
                isOnline
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                  : isWarmingUp
                  ? 'bg-amber-950/60 text-amber-400 border-amber-800/80'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800/80'
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  isOnline
                    ? 'bg-emerald-400 radar-ping'
                    : isWarmingUp
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-400'
                )}
              />
              {isOnline ? 'ONLINE' : isWarmingUp ? 'WARMING UP' : 'OFFLINE'}
            </span>
          </div>
          <div className="text-xs font-semibold text-zinc-200 truncate" title="Ayush Vishwakarma's model">
            Ayush Vishwakarma's model
          </div>
          <div className="text-[11px] font-mono text-zinc-500 mt-1 flex items-center justify-between">
            <span>DistilBERT • 92.7% F1</span>
            <Link to="/dashboard/model" className="text-zinc-400 hover:text-zinc-200 flex items-center gap-0.5">
              Specs <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>

        {/* Bottom Rail Status */}
        <div className="px-3 py-2.5 flex items-center justify-between border-t border-[#27272A] text-[11px] text-zinc-500 font-mono">
          <Link to="/" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Portal</span>
          </Link>
          <span className="text-[10px] text-zinc-600">Port 236/7036</span>
        </div>
      </aside>

      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Canvas Area ── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-14 bg-[#09090B]/90 backdrop-blur-md border-b border-[#27272A] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-md hover:bg-[#18181B] text-zinc-400 hover:text-zinc-200 transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-zinc-500 tracking-wider">INTELLIEMO</span>
              <span className="text-zinc-700">/</span>
              <h2 className="text-xs font-semibold text-zinc-200 tracking-tight">
                {NAV_ITEMS.find((n) => location.pathname === n.path)?.label || 'Overview'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Server Heartbeat Indicator */}
            <div
              className={cn(
                'flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono border',
                isOnline
                  ? 'bg-[#121215] text-zinc-300 border-[#27272A]'
                  : 'bg-amber-950/30 text-amber-300 border-amber-900/40'
              )}
            >
              <span className="relative flex h-2 w-2">
                {isOnline && (
                  <span className="radar-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                )}
                <span
                  className={cn(
                    'relative inline-flex rounded-full h-2 w-2',
                    isOnline ? 'bg-emerald-400' : 'bg-amber-400'
                  )}
                />
              </span>
              <span className="hidden sm:inline text-[11px]">
                {isOnline ? 'LIVE • 12ms' : 'Connecting Engine...'}
              </span>
            </div>

            {/* Quick Action Button */}
            <Link
              to="/dashboard/analyze"
              className="tactile-btn inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-xs border border-zinc-200"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Inference Console</span>
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto relative z-10">{<Outlet />}</main>
      </div>
    </div>
  );
}
