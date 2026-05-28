import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  /** Tailwind classes for the inner preview surface. */
  surfaceClassName?: string;
  /** Right-aligned slot in the header (e.g., link to detail page). */
  actions?: ReactNode;
};

export function ComponentPreview({
  title,
  description,
  children,
  surfaceClassName = "",
  actions,
}: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02]">
      <header className="flex items-start justify-between gap-4 border-b border-white/5 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-ink-100">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs text-ink-400">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>
      <div
        className={`flex min-h-[220px] items-center justify-center bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.10),transparent_60%)] px-6 py-10 ${surfaceClassName}`}
      >
        {children}
      </div>
    </section>
  );
}
