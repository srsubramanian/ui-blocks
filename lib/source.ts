import fs from "node:fs/promises";
import path from "node:path";

/**
 * Reads the raw source of a block from disk so the code viewer always
 * stays in sync with what the preview is rendering.
 */
export async function readSource(relPath: string): Promise<string> {
  const abs = path.join(process.cwd(), relPath);
  try {
    return await fs.readFile(abs, "utf8");
  } catch {
    return `// Could not read source file: ${relPath}`;
  }
}
