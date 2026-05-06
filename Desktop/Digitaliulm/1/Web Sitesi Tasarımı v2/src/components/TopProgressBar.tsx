import { useEffect, useState } from 'react';
import { subscribeLoading } from '../utils/loading';

export function TopProgressBar() {
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const unsub = subscribeLoading(setActive);
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (!active) {
      setWidth(100);
      const t = setTimeout(() => setWidth(0), 200);
      return () => clearTimeout(t);
    }
    // Animate to 80% while loading
    setWidth(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      // Ease towards 80%
      const target = Math.min(80, elapsed / 20);
      setWidth((w) => Math.max(w, target));
      if (active) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div
        className="h-1 bg-[#0EA5E9] transition-[width] duration-150 ease-out shadow-[0_0_12px_rgba(14,165,233,0.7)]"
        style={{ width: `${width}%`, opacity: width > 0 ? 1 : 0 }}
      />
    </div>
  );
}
