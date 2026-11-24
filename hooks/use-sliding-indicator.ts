import { useLayoutEffect, useRef } from "react";

/**
 * A selection highlight that glides between items instead of jumping.
 * Render `<span ref={indicatorRef} className="slide-indicator" />` inside the container;
 * it is moved onto whichever descendant matches `activeSelector`.
 * The first placement is instant, later ones animate from the current on-screen position.
 */
export function useSlidingIndicator<T extends HTMLElement = HTMLDivElement>(activeSelector: string, activeKey: unknown) {
  const containerRef = useRef<T>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    const place = () => {
      const active = container.querySelector<HTMLElement>(activeSelector);
      if (!active) {
        indicator.style.opacity = "0";
        return;
      }
      const c = container.getBoundingClientRect();
      const a = active.getBoundingClientRect();
      const x = a.left - c.left - container.clientLeft + container.scrollLeft;
      const y = a.top - c.top - container.clientTop + container.scrollTop;
      if (!placed.current) indicator.style.transition = "none";
      indicator.style.opacity = "1";
      indicator.style.width = `${a.width}px`;
      indicator.style.height = `${a.height}px`;
      indicator.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!placed.current) {
        void indicator.offsetWidth; // commit the instant placement before re-enabling motion
        indicator.style.transition = "";
        placed.current = true;
        container.dataset.indicator = "on";
      }
    };

    place();
    const ro = new ResizeObserver(place);
    ro.observe(container);
    return () => ro.disconnect();
  }, [activeSelector, activeKey]);

  return [containerRef, indicatorRef] as const;
}
