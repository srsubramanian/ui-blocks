# Working in this repo

A personal Tailwind component library built with Next.js 14 (App Router), React, and TypeScript. See `README.md` for the user-facing overview.

## Where things live

- `app/` — App Router pages: home (`/`), category (`/[category]`), block detail (`/[category]/[block]`).
- `components/blocks/<category>/<slug>.tsx` — the library itself. Each block is a self-contained React component with `export default`.
- `components/site/` — site chrome (header, footer, preview, code viewer).
- `lib/registry.ts` — central manifest. Every block must be imported and registered here, or it won't appear.
- `lib/source.ts` — reads block source files from disk at request time so the code viewer always matches the rendered preview.
- `skills/` — project-local Claude skills. **Read these before doing related work** — they encode the patterns we've already settled on. See list below.

## Project-local skills

When working on something the skill covers, read its `SKILL.md` first. These skills aren't auto-loaded; they're checked in here so they travel with the repo.

- **`skills/revealjs/SKILL.md`** — Building reveal.js slide-deck widgets. Covers the `@revealjs/react` setup, embedded-deck configuration, slide content patterns, theming, and gotchas specific to this Next.js project. Read whenever the user mentions reveal.js, slide decks, presentations, or deck embeds.

## Adding a new block

1. Create `components/blocks/<category>/<slug>.tsx`. Default-export a React component that renders with no props.
2. Register it in `lib/registry.ts`: import at the top, add a `BlockMeta` entry under the right `Category` (or create a new one). The `sourcePath` powers the code viewer — keep it accurate.
3. `npm run dev` and open `/<category>/<slug>` to verify.

## Conventions

- Tailwind-only where possible. Inline `<style>` blocks are acceptable when porting a design that depends on specific CSS features (OKLCH, color-mix, complex selectors) — scope them under a unique wrapper class so they don't leak.
- Match the dark theme (`bg-ink-950`, white text, soft borders) unless the block has a strong reason not to.
- For interactive blocks, add `"use client"` at the top of the file.

## Verification

Before claiming a change works, run `npx tsc --noEmit` from the repo root. Full `next build` is the stronger check but takes longer.
