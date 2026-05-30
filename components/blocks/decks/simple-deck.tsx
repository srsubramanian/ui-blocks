"use client";

import { Deck, Slide, Fragment, Code } from "@revealjs/react";
import RevealHighlight from "reveal.js/plugin/highlight";
import "reveal.js/reveal.css";
import "reveal.js/theme/black.css";
import "reveal.js/plugin/highlight/monokai.css";

// A 5-slide tour of the UI Blocks library. Demonstrates the canonical
// embedded-deck pattern from skills/revealjs/SKILL.md: fixed virtual
// canvas (960×540), embedded mode so the deck sizes to its root,
// keyboardCondition "focused" so it doesn't steal arrow keys from
// the rest of the page until the viewer clicks it.

const REGISTRY_SNIPPET = `// lib/registry.ts
{
  slug: "decks",
  title: "Decks",
  description: "reveal.js slide decks for in-app presentations.",
  blocks: [
    {
      slug: "simple-deck",
      title: "Simple deck",
      sourcePath: "components/blocks/decks/simple-deck.tsx",
      Component: SimpleDeck,
    },
  ],
}`;

export default function SimpleDeck() {
  return (
    <div className="w-full max-w-3xl">
      <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_0_0_1px_rgba(99,102,241,0.15),0_20px_60px_-20px_rgba(99,102,241,0.25)]">
        <Deck
          plugins={[RevealHighlight]}
          config={{
            embedded: true,
            keyboardCondition: "focused",
            controls: true,
            progress: true,
            hash: false,
            transition: "slide",
            backgroundTransition: "fade",
            width: 960,
            height: 540,
            margin: 0.08,
          }}
        >
          {/* Slide 1 — title */}
          <Slide backgroundGradient="linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)">
            <h2 style={{ marginBottom: "0.4em" }}>UI Blocks</h2>
            <p style={{ opacity: 0.85 }}>
              Components designed with Claude, ready to drop in.
            </p>
            <p
              style={{
                marginTop: "1.2em",
                fontSize: "0.55em",
                opacity: 0.7,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Click the deck — then arrow keys to navigate
            </p>
          </Slide>

          {/* Slide 2 — fragments */}
          <Slide>
            <h2>What's inside</h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                fontSize: "0.7em",
                lineHeight: 1.9,
              }}
            >
              <Fragment as="li" animation="fade-right">
                Buttons, cards, tables — the everyday primitives
              </Fragment>
              <Fragment as="li" animation="fade-right">
                Widgets for richer surfaces (Playwright results, decks)
              </Fragment>
              <Fragment as="li" animation="fade-right">
                Live preview + copyable source for every block
              </Fragment>
              <Fragment as="li" animation="fade-right">
                One file, one component — easy to extend
              </Fragment>
            </ul>
          </Slide>

          {/* Slide 3 — code */}
          <Slide>
            <h2 style={{ fontSize: "1.4em", marginBottom: "0.4em" }}>
              Add a block
            </h2>
            <p style={{ fontSize: "0.55em", opacity: 0.75, marginTop: 0 }}>
              Drop a file in <code>components/blocks/</code> then register it:
            </p>
            <Code language="typescript" lineNumbers="1-2|3-5|6-13">
              {REGISTRY_SNIPPET}
            </Code>
          </Slide>

          {/* Slide 4 — accent background, single thought */}
          <Slide background="#0b1020">
            <h2 style={{ fontSize: "1.3em" }}>
              <Fragment animation="fade-up" asChild>
                <span>Iterate fast.</span>
              </Fragment>{" "}
              <Fragment animation="fade-up" asChild>
                <span style={{ color: "#a78bfa" }}>Ship daily.</span>
              </Fragment>
            </h2>
            <p
              style={{
                fontSize: "0.55em",
                opacity: 0.7,
                maxWidth: "26em",
                margin: "1.2em auto 0",
              }}
            >
              Every block is self-contained, so the cost of adding,
              tweaking, or throwing one away is near zero.
            </p>
          </Slide>

          {/* Slide 5 — closing */}
          <Slide backgroundGradient="linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)">
            <h2>Build the next one →</h2>
            <p style={{ opacity: 0.9, fontSize: "0.7em" }}>
              <code
                style={{
                  background: "rgba(0,0,0,0.25)",
                  padding: "0.2em 0.5em",
                  borderRadius: "0.4em",
                }}
              >
                components/blocks/&lt;category&gt;/&lt;slug&gt;.tsx
              </code>
            </p>
          </Slide>
        </Deck>
      </div>
    </div>
  );
}
