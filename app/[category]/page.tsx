import { notFound } from "next/navigation";
import Link from "next/link";
import { ComponentPreview } from "@/components/site/ComponentPreview";
import { getCategory, registry } from "@/lib/registry";

export function generateStaticParams() {
  return registry.map((c) => ({ category: c.slug }));
}

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = getCategory(params.category);
  if (!category) notFound();

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-ink-400 transition hover:text-ink-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-3.5"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          All categories
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {category.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-400">
          {category.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {category.blocks.map((block) => (
          <ComponentPreview
            key={block.slug}
            title={block.title}
            description={block.description}
            actions={
              <Link
                href={`/${category.slug}/${block.slug}`}
                className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-ink-200 transition hover:bg-white/10 hover:text-white"
              >
                View code
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-3.5"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            }
          >
            <block.Component />
          </ComponentPreview>
        ))}
      </div>
    </div>
  );
}
