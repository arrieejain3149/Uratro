import { useEffect, useRef } from 'react';

export default function CursorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Only active on desktop (>= 1280px) matching nabilissa.com
    if (window.innerWidth < 1280) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const trailLength = 14;
    let mouseX = 0;
    let mouseY = 0;
    let hasMoved = false;

    const trail = Array.from({ length: trailLength }, () => ({ x: 0, y: 0 }));

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!hasMoved) {
        for (let i = 0; i < trail.length; i++) {
          trail[i] = { x: mouseX, y: mouseY };
        }
        hasMoved = true;
      }
    };

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (hasMoved) {
        trail.unshift({ x: mouseX, y: mouseY });
        trail.length = trailLength;
        ctx.lineCap = 'round';

        // Draw smooth quadratic bezier cursor ribbon matching nabilissa.com
        for (let u = 1; u < trail.length - 1; u++) {
          const curr = trail[u];
          const prev = trail[u - 1];
          const next = trail[u + 1];

          ctx.lineWidth = 4 - (u / trailLength) * 4;
          ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - u / trailLength) * 0.4})`;

          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.quadraticCurveTo(
            curr.x + 0.25 * (prev.x - next.x),
            curr.y + 0.25 * (prev.y - next.y),
            curr.x,
            curr.y
          );
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-canvas" />;
}
