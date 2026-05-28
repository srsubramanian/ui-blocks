# UI Blocks

A personal Tailwind component library. Browse blocks, preview them live, and copy the source into any project.

Inspired by [Tailwind Plus UI Blocks](https://tailwindcss.com/plus/ui-blocks). Built with Next.js 14 (App Router), React, Tailwind CSS, and Shiki for syntax highlighting.

## Run it

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Add a new component

Each block is a self-contained React file. To add one:

1. **Pick (or create) a category folder** under `components/blocks/`.
   ```
   components/blocks/<category>/<slug>.tsx
   ```
   Example: `components/blocks/forms/email-input.tsx`.

2. **Write the component.** It must `export default` a React component that renders without props.
   ```tsx
   export default function EmailInput() {
     return <input type="email" className="..." />;
   }
   ```

3. **Register it in `lib/registry.ts`.**
   - Add the import at the top.
   - Add (or extend) a `Category` entry and push a `BlockMeta` for the new block.
   ```ts
   import EmailInput from "@/components/blocks/forms/email-input";

   // …
   {
     slug: "forms",
     title: "Forms",
     description: "Inputs, fields, and form layouts.",
     blocks: [
       {
         slug: "email-input",
         title: "Email input",
         description: "Standalone email field with validation styling.",
         sourcePath: "components/blocks/forms/email-input.tsx",
         Component: EmailInput,
       },
     ],
   }
   ```

4. **That's it.** The home page, category page, and detail page pick it up automatically. The source you see in the code viewer is read from disk at request time, so it always matches what the preview renders.

## Project layout

```
app/
  page.tsx                       home — category grid
  [category]/page.tsx            list of blocks in a category
  [category]/[block]/page.tsx    block detail (preview + source)
  layout.tsx, globals.css        shell + Tailwind styles
components/
  blocks/                        the library itself — one folder per category
  site/                          the site chrome (header, footer, previews, code viewer)
lib/
  registry.ts                    central manifest of categories + blocks
  source.ts                      reads block source files from disk
```

## Designing new blocks with Claude

When asking Claude for a new block, the prompt that works well:

> Add a new block to my UI Blocks library: `<category>/<slug>`. It should be a Tailwind-only React component with a default export, no props, no client-side state unless needed. Then register it in `lib/registry.ts` with a one-line title and description.

Claude will create the file, update the registry, and you can preview it immediately at `/<category>/<slug>`.
