import Link from "next/link";
import { registry } from "@/lib/registry";

export default function HomePage() {
  const totalBlocks = registry.reduce((n, c) => n + c.blocks.length, 0);

  return (
    <div className="space-y-14">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-300">
          UI blocks · personal library
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Components I designed with Claude, ready to drop into any project.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-ink-300">
          Browse the library, preview each block, and copy the source. Add new
          components by dropping a file into{" "}
          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-sm text-ink-100">
            components/blocks/
          </code>{" "}
          and registering it in{" "}
          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-sm text-ink-100">
            lib/registry.ts
          </code>
          .
        </p>
        <div className="mt-6 flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-ink-300">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            {totalBlocks} components · {registry.length} categories
          </span>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
          Categories
        </h2>
        <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {registry.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/${category.slug}`}
                className="group block h-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-ink-100 group-hover:text-white">
                    {category.title}
                  </h3>
                  <span className="text-xs text-ink-400">
                    {category.blocks.length}{" "}
                    {category.blocks.length === 1 ? "component" : "components"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-400">
                  {category.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs text-indigo-300">
                  Browse
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
