import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-white/5 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span
            aria-hidden
            className="inline-block size-6 rounded-md bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-amber-300 shadow-[0_0_18px_-2px_rgba(168,85,247,0.6)] transition group-hover:scale-110"
          />
          <span className="text-sm font-semibold tracking-tight text-ink-100">
            UI Blocks
          </span>
          <span className="text-xs text-ink-400">/ personal library</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-ink-300 transition hover:text-ink-100"
          >
            Browse
          </Link>
          <a
            href="https://tailwindcss.com/docs"
            target="_blank"
            rel="noreferrer"
            className="text-ink-300 transition hover:text-ink-100"
          >
            Tailwind docs
          </a>
        </nav>
      </div>
    </header>
  );
}
