"use client";

import { Mermaid, type IconPack } from "@/components/site/Mermaid";

// A generic AWS web-stack architecture, rendered with the official AWS
// architecture icon set. Pattern: CloudFront → ALB → ECS → RDS, with Lambda
// for async work and S3 for assets. Edit the CHART to change the architecture;
// see lib/icon-packs/aws.json for the full curated icon list.

const CHART = `architecture-beta
    group cloud(aws:group-aws-cloud)[AWS]
    group edge(aws:arch-amazon-cloudfront)[Edge] in cloud
    group app(aws:cat-compute)[Application] in cloud
    group data(aws:cat-database)[Data] in cloud

    service cdn(aws:arch-amazon-cloudfront)[CloudFront] in edge
    service alb(aws:res-alb)[ALB] in app
    service ecs(aws:arch-amazon-ecs)[ECS] in app
    service lambda(aws:arch-aws-lambda)[Lambda] in app
    service rds(aws:arch-amazon-rds)[RDS] in data
    service cache(aws:arch-amazon-elasticache)[ElastiCache] in data
    service s3(aws:arch-amazon-s3)[S3] in data

    cdn:R --> L:alb
    alb:R --> L:ecs
    ecs:R --> L:rds
    ecs:B --> T:cache
    ecs:B --> T:lambda
    lambda:R --> L:s3`;

const AWS_PACK: IconPack[] = [
  {
    name: "aws",
    loader: () => import("@/lib/icon-packs/aws.json"),
  },
];

export default function AwsArchitectureCard() {
  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
      <div className="flex items-start justify-between gap-4 border-b border-white/5 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-ink-100">
            AWS web stack
          </h3>
          <p className="mt-0.5 text-xs text-ink-400">
            CloudFront → ALB → ECS → RDS, with Lambda for async work.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/5 px-2 py-1 text-[11px] font-medium text-amber-200">
          <span className="size-1.5 rounded-full bg-amber-300" />
          Official AWS icons
        </span>
      </div>

      <div className="bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.06),transparent_60%)] px-6 py-8">
        <Mermaid chart={CHART} maxWidth="640px" iconPacks={AWS_PACK} />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/5 bg-white/[0.02] px-5 py-3 text-[11px] text-ink-400">
        <LegendItem dot="bg-sky-400/80" label="Edge" />
        <LegendItem dot="bg-indigo-400/80" label="Application" />
        <LegendItem dot="bg-emerald-400/80" label="Data" />
        <span className="ml-auto font-mono text-ink-500">
          icon pack: aws (99 services)
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
