import { useEffect, useRef, useState } from 'react';

export default function CountUp({ value, prefix = '', duration = 900 }) {
  const [n, setN] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const begin = from.current;
    const start = performance.now();
    let raf;

    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(begin + (target - begin) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <>
      {prefix}
      {n.toLocaleString()}
    </>
  );
}