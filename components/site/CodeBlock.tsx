import { codeToHtml } from "shiki";
import { CopyButton } from "./CopyButton";

type Props = {
  code: string;
  lang?: string;
  filename?: string;
};

export async function CodeBlock({ code, lang = "tsx", filename }: Props) {
  const html = await codeToHtml(code, {
    lang,
    theme: "github-dark-default",
  });

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-900/60">
      <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-ink-400">
          <span className="inline-block size-2 rounded-full bg-rose-400/70" />
          <span className="inline-block size-2 rounded-full bg-amber-300/70" />
          <span className="inline-block size-2 rounded-full bg-emerald-400/70" />
          {filename ? (
            <span className="ml-2 font-mono text-[11px] text-ink-300">
              {filename}
            </span>
          ) : null}
        </div>
        <CopyButton text={code} />
      </div>
      <div
        className="overflow-x-auto px-4 py-3 font-mono"
        // shiki output is trusted (built at request time from our own files)
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
