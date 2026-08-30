export const APP_NAME = 'INTELLIEMO';
export const APP_TAGLINE = 'Understand the emotion behind every word.';
export const APP_VERSION = '1.0.0';

export const SAMPLE_TEXTS = [
  {
    text: "I finally got the job I've been working toward for months!",
    expected: 'Joy',
  },
  {
    text: "I can't believe you lied to me after everything I did for you.",
    expected: 'Anger',
  },
  {
    text: "I don't know what is going to happen tomorrow and it scares me.",
    expected: 'Fear',
  },
  {
    text: 'Thank you so much for helping me when I needed it.',
    expected: 'Gratitude',
  },
];

export const NAV_ITEMS = [
  { label: 'Overview', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Analyze Text', path: '/analyze', icon: 'FileText' },
  { label: 'Batch Analysis', path: '/batch', icon: 'Upload' },
  { label: 'History', path: '/history', icon: 'Clock' },
  { label: 'Analytics', path: '/analytics', icon: 'BarChart3' },
  { label: 'Model', path: '/model', icon: 'Brain' },
  { label: 'Documentation', path: '/docs', icon: 'BookOpen' },
];

export const MAX_TEXT_LENGTH = 2000;
