// Standardized Motion v12 & Framer Motion Spring Presets
// Strict Emil Kowalski / Motion Engineering standard (zero layout thrashing, GPU-composited only)

export const springSnappy = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 30,
  mass: 0.8,
};

export const springGentle = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 28,
  mass: 1,
};

export const springMorph = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 32,
  bounce: 0.12,
};

export const easeDecelerate = [0.16, 1, 0.3, 1] as const;

export const staggerFast = 0.04;
export const staggerMedium = 0.06;
