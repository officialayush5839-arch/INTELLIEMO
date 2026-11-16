import React, { useEffect, useRef } from 'react';

interface DynamicBackgroundProps {
  interactive?: boolean;
  density?: number;
  className?: string;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  interactive = true,
  density = 28,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Grid nodes configuration
    const spacing = density;
    let time = 0;

    const render = () => {
      time += 0.015;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle ambient depth gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, 'rgba(18, 18, 24, 0.45)');
      bgGrad.addColorStop(0.6, 'rgba(9, 9, 11, 0.85)');
      bgGrad.addColorStop(1, '#09090B');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Interactive Spotlight around mouse
      if (mouseRef.current.x > 0) {
        const spotGrad = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          320
        );
        spotGrad.addColorStop(0, 'rgba(56, 189, 248, 0.07)');
        spotGrad.addColorStop(0.4, 'rgba(99, 102, 241, 0.03)');
        spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spotGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 3. Coordinate Dot Grid with Wave Displacement
      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          // Distance from mouse
          const dx = x - mouseRef.current.x;
          const dy = y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Subtle wave oscillation
          const wave = Math.sin(x * 0.008 + y * 0.008 + time) * 0.5 + 0.5;

          // Base dot brightness
          let radius = 1.0;
          let alpha = 0.08 + wave * 0.05;

          // Mouse proximity reaction
          if (dist < 220) {
            const factor = 1 - dist / 220;
            radius = 1.0 + factor * 1.6;
            alpha = 0.15 + factor * 0.45;
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = dist < 220 ? `rgba(147, 197, 253, ${alpha})` : `rgba(113, 113, 122, ${alpha})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [density, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.9 }}
    />
  );
};

export default DynamicBackground;
