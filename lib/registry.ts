import type { ComponentType } from "react";

// Sample components — add new ones by importing here.
import PrimaryButton from "@/components/blocks/buttons/primary-button";
import IconButton from "@/components/blocks/buttons/icon-button";
import StatCard from "@/components/blocks/cards/stat-card";
import PlaywrightResult from "@/components/blocks/widgets/playwright-result";
import SimpleInCard from "@/components/blocks/tables/simple-in-card";
import SimpleDeck from "@/components/blocks/decks/simple-deck";
import ArchitectureCard from "@/components/blocks/diagrams/architecture-card";

export type BlockMeta = {
  slug: string;
  title: string;
  description: string;
  /** Path (relative to repo root) used to fetch raw source for the code viewer. */
  sourcePath: string;
  Component: ComponentType;
  /** Tailwind classes for the preview wrapper. Override per-block when a special background helps. */
  previewClassName?: string;
};

export type Category = {
  slug: string;
  title: string;
  description: string;
  blocks: BlockMeta[];
};

export const registry: Category[] = [
  {
    slug: "buttons",
    title: "Buttons",
    description:
      "Clickable building blocks — from a primary CTA to icon-only actions.",
    blocks: [
      {
        slug: "primary-button",
        title: "Primary button",
        description: "Gradient primary CTA with a subtle hover lift.",
        sourcePath: "components/blocks/buttons/primary-button.tsx",
        Component: PrimaryButton,
      },
      {
        slug: "icon-button",
        title: "Icon button",
        description: "Square icon-only button with a focus ring.",
        sourcePath: "components/blocks/buttons/icon-button.tsx",
        Component: IconButton,
      },
    ],
  },
  {
    slug: "cards",
    title: "Cards",
    description: "Surfaces that group related information into a visual unit.",
    blocks: [
      {
        slug: "stat-card",
        title: "Stat card",
        description: "Compact KPI tile with delta indicator.",
        sourcePath: "components/blocks/cards/stat-card.tsx",
        Component: StatCard,
      },
    ],
  },
  {
    slug: "tables",
    title: "Tables",
    description:
      "Data tables — sortable rows, status pills, in-row actions, all wrapped in your favorite container.",
    blocks: [
      {
        slug: "simple-in-card",
        title: "Simple in card",
        description:
          "A simple data table inside a rounded card with a title, action button, and footer.",
        sourcePath: "components/blocks/tables/simple-in-card.tsx",
        Component: SimpleInCard,
      },
    ],
  },
  {
    slug: "diagrams",
    title: "Diagrams",
    description:
      "Mermaid-powered diagrams in a card — architecture, flows, sequences. Edit a string, get a rendered SVG.",
    blocks: [
      {
        slug: "architecture-card",
        title: "Architecture card",
        description:
          "System architecture diagram using mermaid's architecture-beta type. Edge → app → data, with services grouped into tiers.",
        sourcePath: "components/blocks/diagrams/architecture-card.tsx",
        Component: ArchitectureCard,
      },
    ],
  },
  {
    slug: "decks",
    title: "Decks",
    description:
      "reveal.js-powered slide decks embedded inside a card. For tours, onboarding, in-app presentations.",
    blocks: [
      {
        slug: "simple-deck",
        title: "Simple deck",
        description:
          "Five-slide embedded deck demonstrating fragments, code highlighting, and gradient backgrounds. Built with @revealjs/react.",
        sourcePath: "components/blocks/decks/simple-deck.tsx",
        Component: SimpleDeck,
      },
    ],
  },
  {
    slug: "widgets",
    title: "Widgets",
    description:
      "Larger, self-contained product widgets for agent canvases and embeds.",
    blocks: [
      {
        slug: "playwright-result",
        title: "Playwright result",
        description:
          "Test result widget where screenshots tell the story. Three layouts (filmstrip, timeline, grid), failure callout, scrubber, and mock browser screenshots — ported from a Claude Design handoff.",
        sourcePath: "components/blocks/widgets/playwright-result.tsx",
        Component: PlaywrightResult,
      },
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return registry.find((c) => c.slug === slug);
}

export function getBlock(
  categorySlug: string,
  blockSlug: string
): { category: Category; block: BlockMeta } | undefined {
  const category = getCategory(categorySlug);
  if (!category) return undefined;
  const block = category.blocks.find((b) => b.slug === blockSlug);
  if (!block) return undefined;
  return { category, block };
}
