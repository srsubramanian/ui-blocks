export default function StatCard() {
  return (
    <div className="w-72 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
          Monthly revenue
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-3"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
              clipRule="evenodd"
            />
          </svg>
          12.4%
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
        $48,219
      </p>
      <p className="mt-1 text-xs text-ink-400">
        Up <span className="text-ink-200">$5,310</span> from last month
      </p>
      <div className="mt-4 flex h-10 items-end gap-1">
        {[18, 26, 22, 34, 28, 42, 38, 52, 46, 60, 58, 72].map((h, i) => (
          <div
            key={i}
            className="w-2 rounded-sm bg-indigo-400/60"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
