---
name: revealjs
description: Authoritative reference for building reveal.js slide-deck widgets in the ui-blocks library. Use this skill whenever the user mentions reveal.js, revealjs, slide deck, presentation widget, deck embed, slideshow component, or asks to add slides to a block — even if they don't name reveal.js explicitly. Covers the canonical Next.js + @revealjs/react setup for this project, embedded-deck configuration, slide content patterns (fragments, code, markdown, backgrounds), theming inside the dark library shell, and the gotchas that bite when integrating reveal into App Router. Read this BEFORE writing any reveal.js code in this repo so the block lands on the well-trodden path the first time.
---

# reveal.js in the UI Blocks library

This skill captures the patterns we've settled on for building reveal.js-based blocks inside the `ui-blocks/` Next.js project. The goal isn't to re-explain reveal.js end-to-end — the official docs at https://revealjs.com do that. The goal is to encode the decisions that aren't obvious from the docs: which integration path to take, how to make an embedded deck behave well next to other blocks, and where the sharp edges are.

## Mental model

A reveal.js deck is `.reveal > .slides > section` where each `<section>` is a slide. Nest sections to get vertical slides (a "stack"). Reveal handles everything else — scaling, navigation, transitions, fragments, lifecycle — through one initialized instance per `.reveal` root. In an embedded context you get one Reveal instance per block, and reveal scales the deck to the size of its root element rather than the window.

For React/Next.js, treat `@revealjs/react` as the only sensible integration. It wraps reveal.js properly (mount/unmount lifecycle, plugin registration, config diffing, event listener cleanup), handles strict-mode double-mount, and exposes Deck/Slide/Fragment/Markdown/Code components plus a `useReveal()` hook. The "manual" approach — `useEffect` + `new Reveal(ref.current).initialize()` + cleanup — works but you'll spend an afternoon getting cleanup right and rediscovering bugs the wrapper already solved. Skip it unless you have a specific reason.

## Setup (one-time)

Install the wrapper plus reveal.js:

```bash
npm install @revealjs/react reveal.js
```

The wrapper ships only the React bindings; reveal.js itself provides the CSS and built-in plugins. You import the styles per-block (so they only load when the block renders) or once globally — see the theming section for the tradeoff.

## The canonical embedded-deck block

This is the template every reveal.js block in this library should start from. The critical pieces — `embedded: true`, `keyboardCondition: 'focused'`, fixed `width`/`height`, and `"use client"` at the top — exist for specific reasons explained below.

```tsx
"use client";

import { Deck, Slide, Fragment } from "@revealjs/react";
import "reveal.js/reveal.css";
import "reveal.js/theme/black.css";

export default function MyDeck() {
  return (
    <div className="w-full max-w-3xl">
      <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-black">
        <Deck
          config={{
            embedded: true,            // size to .reveal root, not the window
            keyboardCondition: "focused", // don't steal arrow keys until clicked
            controls: true,
            progress: true,
            hash: false,               // don't write slide index to URL
            transition: "slide",
            width: 960,
            height: 540,
          }}
        >
          <Slide>
            <h2>Hello deck</h2>
            <p>A reveal.js block in the library.</p>
          </Slide>

          <Slide>
            <h2>Step by step</h2>
            <Fragment as="p">First point</Fragment>
            <Fragment as="p">Second point</Fragment>
            <Fragment as="p">Third point</Fragment>
          </Slide>

          <Slide background="#0f172a">
            <h2>Custom background</h2>
            <p>Slides can override the theme per-slide.</p>
          </Slide>
        </Deck>
      </div>
    </div>
  );
}
```

Why each piece matters:

`"use client"` — `@revealjs/react` touches the DOM and registers event listeners on mount. Without the directive, Next.js App Router renders it on the server and the deck silently fails to initialize.

`embedded: true` — without this, reveal sizes to `window.innerHeight` and your deck will dwarf the rest of the page or end up at 1px tall. Embedded mode tells reveal to scale to the `.reveal` root, which you control via the aspect-ratio wrapper.

`keyboardCondition: "focused"` — reveal binds keydown to `document` by default. Arrow keys, space, and Esc get hijacked from anything else on the page (including scrolling, other blocks, the site itself). `"focused"` makes the deck capture keys only after the user clicks it.

`hash: false` — the default writes the slide index into the URL. That's fine for a standalone deck but on a library page where the URL already means something, it stomps on it. Turn it off for embedded use.

Fixed `width`/`height` — reveal's internal layout works in a virtual canvas at this size. The actual rendered size comes from the aspect-ratio wrapper. Pick 960×540 (16:9) or 960×700 (default reveal aspect) and stick with it for a category of blocks so they scale consistently.

The outer `aspect-[16/9]` wrapper gives reveal a stable root size and keeps the deck inside a rounded card that matches the library's visual language.

## Slide content patterns

### Plain text + headings

Inside `<Slide>` you write JSX. Reveal's theme CSS handles `h1`/`h2`/`h3`/`p` styling. Keep slide content lean — overflowing slides clip in embedded mode.

### Fragments (progressive reveal)

`Fragment` wraps any element and reveals it on the next navigation step. The `as` prop controls the rendered tag; `asChild` merges fragment behavior onto an existing element instead of wrapping it.

```tsx
<Slide>
  <h2>Build up an argument</h2>
  <Fragment as="p">First, set the stage.</Fragment>
  <Fragment as="p" animation="fade-up">Then drop the twist.</Fragment>
  <Fragment animation="highlight-red" index={3}>
    <p>And punch the line.</p>
  </Fragment>
</Slide>
```

`animation` options: `fade-up`, `fade-down`, `fade-left`, `fade-right`, `fade-in-then-out`, `current-visible`, `grow`, `shrink`, `strike`, `highlight-red/green/blue`, `highlight-current-red/green/blue`, `semi-fade-out`. Default is plain fade-in.

`index` controls reveal order independent of DOM order. Multiple elements can share an index to reveal together.

### Code with syntax highlighting

The `Code` component uses reveal's Highlight plugin. Register it on the `Deck`:

```tsx
import { Deck, Slide, Code } from "@revealjs/react";
import RevealHighlight from "reveal.js/plugin/highlight";
import "reveal.js/plugin/highlight/monokai.css";

<Deck plugins={[RevealHighlight]}>
  <Slide>
    <Code language="typescript" lineNumbers="1|3-4">
      {`const greet = (name: string) => {
  // log a greeting
  console.log(\`Hello, \${name}!\`);
  return name;
};`}
    </Code>
  </Slide>
</Deck>
```

`lineNumbers="1|3-4"` walks through line 1 first, then lines 3–4 — each step is its own fragment, so the audience sees the code light up section by section. The `Code` component auto-trims leading indentation so JSX-indented code renders correctly.

### Markdown slides

`Markdown` renders reveal-compatible markdown without registering the markdown plugin (the React wrapper handles it). Split slides with `---` on its own line, vertical slides with `--`.

```tsx
import { Deck, Markdown } from "@revealjs/react";

<Deck>
  <Markdown>
    {`
      ## First slide
      Some content.

      ---

      ## Second slide
      - one <!-- .element: class="fragment" -->
      - two <!-- .element: class="fragment" -->
    `}
  </Markdown>
</Deck>
```

Use Markdown blocks when the slide content is mostly prose. Use `Slide` + JSX when slides have a lot of structure or React-driven interactivity.

### Backgrounds

`Slide` supports background props that map to reveal's `data-background-*` attributes:

```tsx
<Slide background="#0f172a">…</Slide>
<Slide backgroundGradient="linear-gradient(135deg, #6366f1, #ec4899)">…</Slide>
<Slide backgroundImage="/images/cover.jpg" backgroundSize="cover">…</Slide>
<Slide backgroundVideo="/clips/loop.mp4" backgroundVideoLoop backgroundVideoMuted>…</Slide>
```

Background transitions are independent of slide content transitions and configured via the `backgroundTransition` config option (or `data-background-transition` per slide).

### Transitions

Set `transition` in the Deck config: `none`, `fade`, `slide` (default), `convex`, `concave`, `zoom`. Override per slide via the `transition` prop on `Slide`. Separate in/out transitions are supported (`"slide-in fade-out"`). Speed: `transitionSpeed: "default" | "fast" | "slow"`.

## Theming and visual fit

Reveal ships twelve built-in themes: `black` (default), `white`, `league`, `beige`, `night`, `serif`, `simple`, `solarized`, `moon`, `dracula`, `sky`, `blood`. Import the matching CSS:

```ts
import "reveal.js/theme/black.css";
```

The site shell in this library is dark, so `black`, `night`, `moon`, `blood`, and `dracula` blend best. `white` or `simple` work if you wrap the deck in a light surface inside the dark page.

**CSS leakage warning.** Reveal's theme CSS includes some near-global rules (it styles `body`, `html`, fonts). When you import a theme CSS file in a block, those rules apply page-wide for as long as that file is in the bundle. In practice this means:

- Import theme CSS **inside the block file**, not in `app/globals.css`, so it only loads when the deck route is active.
- If you see fonts or backgrounds shifting on other pages, the theme is leaking — switch to a CSS-Modules wrapper or write a stripped theme that scopes to `.reveal`.

For a custom look, start from `simple` (which is mostly token overrides) and override CSS variables — every theme exposes its tokens as `:root` custom properties. The list is in `node_modules/reveal.js/css/theme/template/exposer.scss`.

## Lifecycle and interactivity

`Deck` accepts event props directly: `onReady`, `onSlideChange`, `onSlideTransitionEnd`, `onFragmentShown`, `onFragmentHidden`, `onOverviewShown`, `onPaused`, plus a few more. The wrapper installs them via `deck.on()` and removes them on unmount or callback swap — you don't manage subscriptions yourself.

```tsx
<Deck
  onReady={(deck) => console.log("ready", deck.getTotalSlides())}
  onSlideChange={(e) => console.log("slide", e.indexh, e.indexv)}
>…</Deck>
```

To call reveal's API from your own components inside the deck, use `useReveal()`:

```tsx
import { useReveal } from "@revealjs/react";

function JumpButton() {
  const deck = useReveal();
  return <button onClick={() => deck?.slide(2)}>Jump to slide 3</button>;
}
```

To access the instance outside the tree, pass a `deckRef` to `Deck`. Useful when a parent block needs to drive the deck (a thumbnail sidebar, an autoplay button, etc.).

## Library integration

When adding a reveal.js block:

1. Put the file under `components/blocks/decks/<slug>.tsx` (create the `decks` folder if it doesn't exist).
2. Start `"use client"` — non-negotiable for App Router.
3. Use the embedded-deck template above; tweak content, not config, unless you have a specific reason.
4. Register in `lib/registry.ts`:
   - Add the import.
   - Add a `Decks` category if needed, otherwise extend the existing one.
   - The `sourcePath` makes the code viewer work — keep it accurate.
5. The library's `ComponentPreview` surface centers the block inside a min-height container. The deck's outer `max-w-3xl` keeps it from blowing out wide previews.

## Gotchas

**Server components.** Anything that uses `@revealjs/react` directly or indirectly must have `"use client"` at the top. If you forget, you get a confusing "useState only works in client components" trace pointing at the wrapper's internals.

**Import paths.** In reveal.js 6.x the `exports` map publishes paths *without* `dist/` — use `reveal.js/reveal.css`, `reveal.js/theme/black.css`, `reveal.js/plugin/highlight`, `reveal.js/plugin/highlight/monokai.css`. Older versions sometimes shipped raw `dist/` paths. If an import fails, open `node_modules/reveal.js/package.json` and follow the exports map.

**SSR builds and `next build`.** Reveal touches `document` at initialization. Even with `"use client"` you'll get a clean build (initialization runs in `useEffect`, not during render), but if you need extra paranoia, dynamic-import the block: `const Deck = dynamic(() => import("./MyDeck"), { ssr: false })`. Usually unnecessary.

**Keyboard focus stealing.** Without `keyboardCondition: "focused"` the deck eats arrow keys from anywhere on the page — including form inputs and the browser scroll. Always set it for embedded use.

**Multiple decks on one page.** The wrapper handles this — each `<Deck>` creates its own Reveal instance. Both should be in `embedded: true` mode. Without that, they fight over the window viewport and both render broken.

**Hash navigation.** `hash: true` writes `#/0/2` to the URL on slide change. For a library page that's harmful; leave it `false` for embedded blocks.

**Plugin scope.** `plugins` on `Deck` is **initialization-only** — changing the array between renders is ignored. Pick your plugins upfront. To enable/disable functionality mid-flight, use config options instead.

**Fragment animations need the CSS.** Custom fragment classes (anything beyond the built-in `fade-*` / `highlight-*` set) need matching CSS rules with both `.fragment.your-name` and `.fragment.your-name.visible`. Scope them under the block's wrapper class so they don't leak.

## When to reach for advanced features

- **Auto-animate** (`autoAnimate` on consecutive slides) — slides matching elements between them tween position/size. Great for "morph this card into that card" reveals. Defaults are sane.
- **Speaker view** (`RevealNotes` plugin) — opens a separate window with notes + next slide. Not useful for embedded library demos; skip.
- **Auto-slide** (`autoSlide: 5000`) — automatically advance every N ms. Good for marketing-style demo decks. Pair with `autoSlideStoppable: true` so user interaction pauses it.
- **PDF export** — handled by reveal's print stylesheet, not relevant for in-library blocks.

## References

- Live docs: https://revealjs.com
- React wrapper docs: https://revealjs.com/react/
- Config option reference: https://revealjs.com/config/
- Full JS API: https://revealjs.com/api/
- Theme tokens: `node_modules/reveal.js/css/theme/template/exposer.scss`

When the docs and this skill disagree, the docs are newer — but stop and flag the conflict so the skill can be updated.
