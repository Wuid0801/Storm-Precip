import { useEffect, useState } from 'react';

export default function useMouseParallax() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let rafId = 0;

    const handlePointerMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setPosition({ x, y });
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return position;
}
