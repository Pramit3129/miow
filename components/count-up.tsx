"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Renders the final number on the server, then counts up to it once on the client.
 * Writes to the DOM directly so it never re-renders React per frame; respects reduced motion.
 */
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  duration = 900,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) =>
    prefix + n.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const final = format(value);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fmt = (n: number) =>
      prefix + n.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = fmt(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    el.textContent = fmt(0);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      el.textContent = fmt(value);
    };
  }, [value, decimals, prefix, duration]);

  return (
    <span ref={ref} key={final} className="count-up">
      {final}
    </span>
  );
}
