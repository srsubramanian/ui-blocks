import { notFound } from "next/navigation";
import Link from "next/link";
import { ComponentPreview } from "@/components/site/ComponentPreview";
import { CodeBlock } from "@/components/site/CodeBlock";
import { getBlock, registry } from "@/lib/registry";
import { readSource } from "@/lib/source";

export function generateStaticParams() {
  return registry.flatMap((c) =>
    c.blocks.map((b) => ({ category: c.slug, block: b.slug }))
  );
}

export default async function BlockPage({
  params,
}: {
  params: { category: string; block: string };
}) {
  const found = getBlock(params.category, params.block);
  if (!found) notFound();
  const { category, block } = found;

  const source = await readSource(block.sourcePath);

  return (
    <div className="space-y-8">
      <nav className="flex items-center gap-1 text-xs text-ink-400">
        <Link href="/" className="transition hover:text-ink-100">
          Categories
        </Link>
        <span>/</span>
        <Link
          href={`/${category.slug}`}
          className="transition hover:text-ink-100"
        >
          {category.title}
        </Link>
        <span>/</span>
        <span className="text-ink-200">{block.title}</span>
      </nav>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {block.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-400">
          {block.description}
        </p>
      </header>

      <ComponentPreview title="Preview">
        <block.Component />
      </ComponentPreview>

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink-100">Source</h2>
          <p className="text-xs text-ink-500 font-mono">{block.sourcePath}</p>
        </div>
        <CodeBlock code={source} filename={block.sourcePath} />
      </div>
    </div>
  );
}
