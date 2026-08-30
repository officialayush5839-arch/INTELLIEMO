import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Emotion Colors ──
export const EMOTION_COLORS: Record<string, string> = {
  joy: '#FCD34D',
  sadness: '#93C5FD',
  anger: '#FCA5A5',
  fear: '#C4B5FD',
  love: '#F9A8D4',
  surprise: '#FDBA74',
  neutral: '#D1D5DB',
  admiration: '#86EFAC',
  amusement: '#FDE047',
  annoyance: '#FDBA74',
  approval: '#A5F3FC',
  caring: '#FCA5A5',
  confusion: '#D8B4FE',
  curiosity: '#67E8F9',
  desire: '#F0ABFC',
  disappointment: '#94A3B8',
  disapproval: '#FB923C',
  disgust: '#86EFAC',
  embarrassment: '#FCA5A5',
  excitement: '#FDE047',
  gratitude: '#86EFAC',
  grief: '#93C5FD',
  nervousness: '#C4B5FD',
  optimism: '#67E8F9',
  pride: '#FDE047',
  realization: '#A5F3FC',
  relief: '#86EFAC',
  remorse: '#94A3B8',
};

export const EMOTION_BG_COLORS: Record<string, string> = {
  joy: 'bg-yellow-100 text-yellow-800',
  sadness: 'bg-blue-100 text-blue-800',
  anger: 'bg-red-100 text-red-800',
  fear: 'bg-purple-100 text-purple-800',
  love: 'bg-pink-100 text-pink-800',
  surprise: 'bg-orange-100 text-orange-800',
  neutral: 'bg-gray-100 text-gray-600',
  admiration: 'bg-green-100 text-green-800',
  amusement: 'bg-yellow-100 text-yellow-800',
  annoyance: 'bg-orange-100 text-orange-800',
  approval: 'bg-cyan-100 text-cyan-800',
  caring: 'bg-red-100 text-red-800',
  confusion: 'bg-violet-100 text-violet-800',
  curiosity: 'bg-teal-100 text-teal-800',
  desire: 'bg-fuchsia-100 text-fuchsia-800',
  disappointment: 'bg-slate-100 text-slate-800',
  disapproval: 'bg-orange-100 text-orange-800',
  disgust: 'bg-green-100 text-green-800',
  embarrassment: 'bg-red-100 text-red-800',
  excitement: 'bg-yellow-100 text-yellow-800',
  gratitude: 'bg-green-100 text-green-800',
  grief: 'bg-blue-100 text-blue-800',
  nervousness: 'bg-purple-100 text-purple-800',
  optimism: 'bg-teal-100 text-teal-800',
  pride: 'bg-yellow-100 text-yellow-800',
  realization: 'bg-cyan-100 text-cyan-800',
  relief: 'bg-green-100 text-green-800',
  remorse: 'bg-slate-100 text-slate-800',
};

export function getEmotionColor(emotion: string): string {
  return EMOTION_COLORS[emotion] || '#D1D5DB';
}

export function getEmotionBgClass(emotion: string): string {
  return EMOTION_BG_COLORS[emotion] || 'bg-gray-100 text-gray-600';
}

// ── Formatting ──
export function formatConfidence(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
