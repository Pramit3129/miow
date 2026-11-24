"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeProvider(props: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props} />;
}

const noopSubscribe = () => () => {};

/** Light/dark toggle that cross-fades the whole page instead of snapping brightness. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // false during SSR/hydration, true on the client — avoids an icon mismatch without a setState-in-effect.
  const mounted = React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const dark = mounted && resolvedTheme === "dark";

  const toggle = () => {
    const next = dark ? "light" : "dark";
    const apply = () => {
      const root = document.documentElement;
      root.classList.toggle("dark", next === "dark");
      root.classList.toggle("light", next === "light");
      root.style.colorScheme = next;
      setTheme(next);
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !reduce) doc.startViewTransition(apply);
    else apply();
  };

  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={dark ? "Switch to light appearance" : "Switch to dark appearance"}
      onClick={toggle}
    >
      <span key={dark ? "sun" : "moon"} className="icon-swap">
        {dark ? <Sun size={17} /> : <Moon size={17} />}
      </span>
    </button>
  );
}
