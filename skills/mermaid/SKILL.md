---
name: mermaid
description: Authoritative reference for building Mermaid-powered diagram blocks in the ui-blocks library. Use this skill whenever the user mentions Mermaid, mermaid.js, architecture diagram, flowchart, sequence diagram, ER diagram, state diagram, or asks to add a diagram to a block — even if they don't name Mermaid explicitly. Covers the project's `<Mermaid />` helper, the AWS icon pack we built, how to register additional iconify packs (Azure, GCP, logos), dark-theme tuning, sizing inside library previews, and the gotchas that bite when integrating Mermaid into Next.js App Router. Read this BEFORE writing any Mermaid code in this repo so the block lands on the well-trodden path the first time.
---

# Mermaid in the UI Blocks library

This skill captures the patterns we've settled on for building Mermaid-based blocks inside the `ui-blocks/` Next.js project. The official docs live at https://mermaid.js.org — this file encodes the project-specific decisions: which diagram types render well in card-sized previews, how the `<Mermaid />` wrapper handles SSR and theming, how to register custom icon packs (AWS already built; Azure/GCP are easy follow-ups), and the integration gotchas.

## Mental model

Mermaid is a "text → SVG" library. You hand it a chart string in its DSL (`flowchart TD`, `sequenceDiagram`, `architecture-beta`, etc.) and it returns an SVG. We wrap that interaction in a small `<Mermaid />` client component that handles lazy-loading mermaid, theming, error display, and (optionally) registering iconify icon packs before render.

Each Mermaid render is a fresh `mermaid.render(id, chart)` call. The library is initialized once per page lifecycle (`mermaid.initialize`) with our dark-theme overrides. Icon packs are registered exactly once per name via a module-level `Set`, so passing the same `iconPacks` array on subsequent renders is cheap.

## The `<Mermaid />` helper

Location: `components/site/Mermaid.tsx`.

```tsx
import { Mermaid } from "@/components/site/Mermaid";

<Mermaid
  chart={`flowchart TD
    A[Start] --> B{Decide}
    B -->|Yes| C[Do it]
    B -->|No| D[Skip]`}
  maxWidth="640px"
/>
```

Props:
- `chart` — the Mermaid source string. Any diagram type.
- `maxWidth` — CSS length for the rendered SVG's max width. Defaults to `100%`.
- `className` — passed to the outer wrapper.
- `iconPacks` — array of `{ name, loader }` for lazy iconify pack registration (see below).

Errors from invalid Mermaid syntax render as a red callout instead of crashing the page. That makes iteration on chart text quick.

## Registering icon packs

Mermaid's `architecture-beta` diagram type ships with five built-in icons (`cloud`, `database`, `disk`, `internet`, `server`). For anything else — AWS services, Azure, GCP, vendor logos — register an iconify pack via the `iconPacks` prop:

```tsx
<Mermaid
  chart={CHART}
  iconPacks={[
    { name: "aws", loader: () => import("@/lib/icon-packs/aws.json") },
  ]}
/>
```

The loader returns either an iconify pack directly or a default-export of one (so JSON imports work as-is). The wrapper awaits the loader, calls `mermaid.registerIconPacks([{name, icons}])`, and remembers which packs have been registered so the work happens exactly once.

Use icons in the chart with `pack-name:icon-code`:

```
architecture-beta
    service ec2(aws:arch-amazon-ec2)[EC2]
    service lambda(aws:arch-aws-lambda)[Lambda]
    ec2:R --> L:lambda
```

## The AWS pack we built

Location: `lib/icon-packs/aws.json` (99 icons, ~136KB, lazy-loaded).

Source: the `aws-icons` npm package, a mirror of the official AWS Architecture Icons set (MIT-licensed). We don't depend on `aws-icons` at runtime — the build script regenerates `aws.json` from it as a dev step.

Build script: `scripts/build-aws-icons.mjs`, run via `npm run build:aws-icons`. It reads `scripts/aws-icons.curated.json` (the allowlist mapping friendly names to SVG paths), extracts each SVG's body, namespaces internal IDs so multiple icons can coexist on one page, and writes a single iconify JSON.

Naming convention follows what Mermaid Chart uses:
- `aws:arch-amazon-ec2`, `aws:arch-aws-lambda` — main service icons
- `aws:res-alb`, `aws:res-nat-gateway` — resource sub-icons (ALB/NLB live here, not under arch-)
- `aws:cat-compute`, `aws:cat-storage` — category icons (use as group icons)
- `aws:group-vpc`, `aws:group-region`, `aws:group-aws-cloud` — visual group containers

Full curated list is in `scripts/aws-icons.curated.json`. To add an icon: open the curated JSON, add an entry mapping the friendly name to the source path inside `node_modules/aws-icons/icons/`, run `npm run build:aws-icons`, and commit the regenerated `aws.json`.

To regenerate the pack from a fresh AWS icons release: bump `aws-icons` in `package.json`, `npm install`, run the build script. AWS releases icons quarterly.

## Diagram types worth using

For library blocks, three diagram types punch above their weight:

**`architecture-beta`** — system architecture diagrams with services, groups, and labeled edges. Auto-layout via fcose (force-directed). Best for showing how cloud services connect. Uses iconify icons. See `components/blocks/diagrams/aws-architecture-card.tsx` for the AWS-flavored sample.

**`flowchart TD`** (top-down) or `flowchart LR` (left-right) — the workhorse. Nodes connect with arrows. More layout control than architecture-beta. Better than architecture for decision trees, state machines you don't want to model formally, or any "process" story.

**`sequenceDiagram`** — actors on the X axis, time flowing down. Best for API flow / RPC / messaging stories. Renders cleanly in card-sized previews up to ~10 actors before it starts cramping.

Less useful in this library:
- `classDiagram` — works but feels out of place outside an OOP context
- `stateDiagram-v2` — sometimes useful, but flowchart-LR usually communicates the same thing more clearly in a card
- `gantt` — too wide for card previews
- `gitGraph` — niche

## Theming

The wrapper initializes Mermaid with `theme: "dark"` plus overrides matching the library's indigo accent. The relevant `themeVariables`:

```
primaryColor: "#1e293b",      // node fill
primaryTextColor: "#e2e8f0",  // node text
primaryBorderColor: "#475569",
lineColor: "#94a3b8",
secondaryColor: "#312e81",
tertiaryColor: "#0f172a",
```

These apply to `flowchart`, `sequenceDiagram`, `classDiagram`, and most other types. **They do NOT control the appearance of `architecture-beta`**, which has its own internal rendering pipeline. Architecture diagrams will look more "Mermaid default" regardless of theme tuning — that's a known limitation, not a wrapper bug.

To customize colors per-block, override `themeVariables` inline by extending the `<Mermaid />` props in a wrapper component for that block. Don't mutate the shared helper's defaults.

## Library integration

When adding a Mermaid block:

1. Put the file under `components/blocks/diagrams/<slug>.tsx`.
2. Start `"use client"` — the wrapper hits `useEffect`, non-negotiable in App Router.
3. Use the `<Mermaid />` helper, not raw mermaid. Pass `iconPacks` only if you need them.
4. Wrap in the card chrome from `architecture-card.tsx` (header + gradient surface + legend) so siblings in the Diagrams category feel consistent.
5. Register in `lib/registry.ts` under the `diagrams` category.

The library's `ComponentPreview` surface centers blocks in a min-height container. The diagram card's outer `max-w-3xl` keeps it from blowing out wide previews. Mermaid's `useMaxWidth: true` config keeps the SVG responsive within that.

## Adding more icon packs

To add Azure, GCP, or any other iconify pack:

1. Find the pack on iconify (browse at https://icon-sets.iconify.design or grep `@iconify-json/*` on npm).
2. Either install the package and import its `icons` export, OR (preferred for AWS-style curation) write a build script that emits a curated JSON.
3. In your block, register via `iconPacks={[{ name: "azure", loader: () => import("@/lib/icon-packs/azure.json") }]}`.
4. Reference icons as `azure:vm`, `azure:storage`, etc.

For `@iconify-json/logos` (vendor brand logos), the simplest path is direct registration without curation since you can install the whole pack:

```tsx
iconPacks={[
  { name: "logos", loader: () => import("@iconify-json/logos").then((m) => m.icons) },
]}
```

That gets you all 1,861 vendor logos for ~1MB of JS. Heavy for library blocks; better to curate like we did for AWS.

## Gotchas

**Server components.** Anything that uses `<Mermaid />` directly or indirectly must have `"use client"` at the top. The wrapper itself is a client component; consumers must be too.

**Architecture-beta theme defiance.** As noted above, architecture-beta doesn't honor the wrapper's `themeVariables`. Icons render in their native colors, edges use Mermaid's default architecture color (blueish). Either accept the look or switch to a flowchart with manual styling.

**Icon pack size.** A 99-service AWS pack is 136KB. A 1,861-icon logos pack is ~1MB. Always lazy-load via the `iconPacks` prop's `loader` so the cost is paid only by blocks that actually use the pack. Webpack code-splits each dynamic import into its own chunk.

**ID collisions in SVG defs.** The AWS build script namespaces every `id` attribute inside an SVG body with the icon name so two icons on the same page can't share an ID. If you build a custom icon pack manually, do the same — many vendor icons use simple IDs like `a`, `b`, `gradient1` that will collide.

**Mermaid 11.x renames.** Mermaid renamed some classes between 10.x and 11.x. The wrapper pins to 11+ and uses `registerIconPacks` (added in 11.1). Older versions don't support icon packs at all.

**Hydration warnings.** Mermaid renders into `innerHTML` after mount. React doesn't try to hydrate it, so no mismatch warnings — but if you ever wrap Mermaid output in a parent that DOES hydrate, expect noise. Easy fix: parent should also be client-only.

**SSR-safety of JSON imports.** `import("@/lib/icon-packs/aws.json")` resolves at runtime in the browser when called inside a client component. Don't put it at module scope in a server component — webpack will try to bundle the JSON into the server output.

## References

- Live Mermaid docs: https://mermaid.js.org
- Architecture-beta syntax: https://mermaid.js.org/syntax/architecture.html
- Icon pack registration: https://mermaid.js.org/config/icons.html
- AWS Architecture Icons (source): https://aws.amazon.com/architecture/icons/
- Iconify icon browser: https://icon-sets.iconify.design

When docs and skill disagree, docs are newer — but flag the conflict so the skill can be updated.
