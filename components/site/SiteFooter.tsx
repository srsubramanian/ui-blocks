export function SiteFooter() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-8 text-xs text-ink-500 sm:flex-row sm:items-center">
        <p>Designed with Claude — built with Next.js + Tailwind.</p>
        <p>Add components in <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-ink-200">components/blocks/</code></p>
      </div>
    </footer>
  );
}
