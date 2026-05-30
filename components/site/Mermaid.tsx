"use client";

// A small client wrapper around mermaid. Renders any Mermaid chart text as
// SVG, tuned to fit the dark site shell. Designed for use inside library
// blocks — drop it into any block file and pass a `chart` string.
//
// Why we dynamic-import mermaid: it's a heavy library (parsers, layout
// engines) that touches the DOM at module load. Importing it lazily inside
// useEffect keeps SSR safe and keeps it out of the server bundle.

import { useEffect, useId, useRef, useState } from "react";

/** An iconify-format icon pack. The lazy loader returns this shape. */
type IconifyPack = {
  prefix: string;
  icons: Record<string, { body: string; width?: number; height?: number }>;
  width?: number;
  height?: number;
};

/** An icon pack to register before render. The `loader` returns either the
 *  pack itself, or a default-export of one (so `() => import("@/lib/icon-packs/aws.json")`
 *  works directly). The pack is fetched and registered once per name; calling
 *  Mermaid with the same pack array on a second render is cheap. */
export type IconPack = {
  name: string;
  loader: () => Promise<IconifyPack | { default: IconifyPack }>;
};

const registeredPacks = new Set<string>();

type Props = {
  /** The Mermaid chart source. Any diagram type mermaid supports. */
  chart: string;
  /** Optional override for the rendered svg's max width (any CSS length). */
  maxWidth?: string;
  /** Optional className applied to the outer wrapper. */
  className?: string;
  /** Iconify packs to register with mermaid before rendering. Loaders are
   *  awaited in parallel and registered exactly once per name (idempotent). */
  iconPacks?: IconPack[];
};

export function Mermaid({
  chart,
  maxWidth = "100%",
  className = "",
  iconPacks,
}: Props) {
  const reactId = useId();
  // mermaid's render() requires an id that's a valid CSS selector — strip
  // colons that React's useId injects.
  const renderId = `mmd-${reactId.replace(/[^a-zA-Z0-9-]/g, "")}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose", // needed for some click/link interactions
          themeVariables: {
            // Tune mermaid's dark palette to match the library's indigo accent.
            background: "transparent",
            primaryColor: "#1e293b",
            primaryTextColor: "#e2e8f0",
            primaryBorderColor: "#475569",
            lineColor: "#94a3b8",
            secondaryColor: "#312e81",
            tertiaryColor: "#0f172a",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          },
          flowchart: { useMaxWidth: true, htmlLabels: true, curve: "basis" },
          sequence: { useMaxWidth: true },
          gantt: { useMaxWidth: true },
        });

        // Register icon packs, if any. Each pack is fetched and registered
        // exactly once per process; subsequent renders skip the work.
        if (iconPacks && iconPacks.length) {
          const toRegister = iconPacks.filter((p) => !registeredPacks.has(p.name));
          if (toRegister.length) {
            const packs = await Promise.all(
              toRegister.map(async (p) => {
                const loaded = await p.loader();
                const iconsModule =
                  "default" in loaded ? loaded.default : loaded;
                return { name: p.name, icons: iconsModule };
              })
            );
            mermaid.registerIconPacks(packs);
            for (const p of toRegister) registeredPacks.add(p.name);
          }
        }

        const { svg } = await mermaid.render(renderId, chart);
        if (cancelled) return;
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [chart, renderId, iconPacks]);

  if (error) {
    return (
      <div
        className={`rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200 ${className}`}
      >
        <p className="mb-1 font-semibold">Mermaid render error</p>
        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[11px] opacity-80">
          {error}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-host flex w-full justify-center [&_svg]:h-auto ${className}`}
      style={{ maxWidth }}
    />
  );
}
