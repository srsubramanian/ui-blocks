"use client";

import { Mermaid } from "@/components/site/Mermaid";

// A system architecture diagram inside a card. Uses mermaid's
// architecture-beta diagram type — declarative service/group definitions
// with auto-layout. Edit the CHART string to retell the architecture; the
// card chrome stays the same.

const CHART = `architecture-beta
    group edge(cloud)[Edge]
    group app(cloud)[Application]
    group data(cloud)[Data]

    service cdn(internet)[CDN] in edge
    service web(server)[Next js] in app
    service api(server)[API] in app
    service worker(server)[Worker] in app
    service db(database)[Postgres] in data
    service cache(disk)[Redis] in data
    service blob(disk)[Object store] in data

    cdn:R --> L:web
    web:R --> L:api
    api:R --> L:db
    api:B --> T:cache
    api:B --> T:worker
    worker:R --> L:db
    worker:B --> T:blob`;

export default function ArchitectureCard() {
  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 border-b border-white/5 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-ink-100">
            System architecture
          </h3>
          <p className="mt-0.5 text-xs text-ink-400">
            Web → API → data layer, with a worker for async jobs.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-ink-300">
          <span className="size-1.5 rounded-full bg-indigo-400" />
          Live diagram
        </span>
      </div>

      {/* Diagram body */}
      <div className="bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_60%)] px-6 py-8">
        <Mermaid chart={CHART} maxWidth="640px" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/5 bg-white/[0.02] px-5 py-3 text-[11px] text-ink-400">
        <LegendItem dot="bg-sky-400/80" label="Edge" />
        <LegendItem dot="bg-indigo-400/80" label="Application" />
        <LegendItem dot="bg-emerald-400/80" label="Data" />
        <span className="ml-auto font-mono text-ink-500">
          source: architecture-beta
        </span>
      </div>
    </div>
  );
}

function LegendItem({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2 rounded-sm ${dot}`} />
      {label}
    </span>
  );
}
