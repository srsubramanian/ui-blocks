// build-aws-icons.mjs
//
// Converts the SVG icon set bundled in the `aws-icons` npm package into a
// single iconify-format JSON pack that mermaid can register.
//
// Inputs:
//   - scripts/aws-icons.curated.json  (which icons + what to call them)
//   - node_modules/aws-icons/icons/   (the source SVGs)
//
// Output:
//   - lib/icon-packs/aws.json
//
// Run with: npm run build:aws-icons
//
// Why we do this rather than ship aws-icons directly: aws-icons is 800+ files
// at ~1.2MB unpacked, and we only want ~80 of them in the format mermaid
// expects (iconify icon set: { prefix, icons: { name: { body, width, height } } }).

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const curatedPath = path.join(__dirname, "aws-icons.curated.json");
const sourceRoot = path.join(repoRoot, "node_modules", "aws-icons", "icons");
const outputPath = path.join(repoRoot, "lib", "icon-packs", "aws.json");

const PREFIX = "aws";
const TARGET_SIZE = 64; // AWS architecture-service icons use viewBox 0 0 64 64.

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Pull the inner contents of an <svg> element — everything between the
 *  opening and closing tags. Iconify's `body` field expects this, NOT the
 *  outer <svg>. */
function extractSvgBody(svg) {
  const open = svg.match(/<svg\b[^>]*>/i);
  const close = svg.lastIndexOf("</svg>");
  if (!open || close < 0) return null;
  const start = open.index + open[0].length;
  return svg.slice(start, close).trim();
}

/** Pull width/height from the SVG viewBox so the rendered icon stays square
 *  even if a future source has a non-64 viewBox. Defaults to TARGET_SIZE. */
function extractDimensions(svg) {
  const viewBox = svg.match(/viewBox\s*=\s*"([^"]+)"/i);
  if (!viewBox) return { width: TARGET_SIZE, height: TARGET_SIZE };
  const parts = viewBox[1].trim().split(/\s+/).map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return { width: TARGET_SIZE, height: TARGET_SIZE };
  }
  return { width: parts[2], height: parts[3] };
}

/** AWS SVGs often include a <title> like "Icon-Architecture/48/Arch_X". It's
 *  meaningless after extraction and clutters the body, so strip it. */
function stripTitle(body) {
  return body.replace(/<title>[\s\S]*?<\/title>/gi, "").trim();
}

/** Some AWS icons use literal id="..." attributes (gradients, masks, clip
 *  paths). When rendered on the same page, two icons sharing an id will
 *  collide — the second one references the first's defs. Prefix every id
 *  with the icon name to keep them unique. */
function namespaceIds(body, iconName) {
  const ns = `aws-${iconName}`;
  // Rewrite id="foo" → id="aws-iconname-foo"
  let out = body.replace(/\bid="([^"]+)"/g, (_, id) => `id="${ns}-${id}"`);
  // Rewrite url(#foo) → url(#aws-iconname-foo)
  out = out.replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${ns}-${id})`);
  // Rewrite href="#foo" / xlink:href="#foo" → "#aws-iconname-foo"
  out = out.replace(/\b(xlink:)?href="#([^"]+)"/g, (_, xlink, id) => {
    const prefix = xlink || "";
    return `${prefix}href="#${ns}-${id}"`;
  });
  return out;
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const curatedText = await readFile(curatedPath, "utf8");
  const curated = JSON.parse(curatedText);

  const icons = {};
  const misses = [];
  let successCount = 0;

  for (const [iconName, relPath] of Object.entries(curated.icons)) {
    if (iconName.startsWith("_")) continue;
    const svgPath = path.join(sourceRoot, `${relPath}.svg`);
    let raw;
    try {
      raw = await readFile(svgPath, "utf8");
    } catch (err) {
      misses.push({ iconName, relPath, reason: err.code || String(err) });
      continue;
    }

    const body = extractSvgBody(raw);
    if (!body) {
      misses.push({ iconName, relPath, reason: "no <svg> body" });
      continue;
    }

    const { width, height } = extractDimensions(raw);
    const cleaned = namespaceIds(stripTitle(body), iconName);

    icons[iconName] = { body: cleaned, width, height };
    successCount++;
  }

  const pack = {
    prefix: PREFIX,
    icons,
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    info: {
      name: "AWS Architecture Icons (curated)",
      total: successCount,
      author: { name: "Amazon Web Services" },
      license: {
        title: "MIT (via aws-icons npm package)",
        url: "https://github.com/mkabumattar/aws-icons/blob/main/LICENSE",
      },
      samples: ["arch-amazon-ec2", "arch-aws-lambda", "arch-amazon-s3"],
      category: "Logos",
    },
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(pack) + "\n");

  console.log(`✓ wrote ${successCount} icons → ${path.relative(repoRoot, outputPath)}`);
  if (misses.length) {
    console.log(`✗ ${misses.length} missing:`);
    for (const m of misses) {
      console.log(`  ${m.iconName.padEnd(36)} ${m.relPath} (${m.reason})`);
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
