import fs from "fs/promises";
import path from "path";

interface Section {
  id: string;
  title: string;
  url: string;
  preview: string;
  source: "llms" | "llms-full";
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseMarkdownLine(
  line: string,
  source: "llms" | "llms-full"
): Section | null {
  const match = line.match(/-\s*\[(.+?)\]\((https?:\/\/[^\)]+)\):?\s*(.*)/);
  if (!match) return null;

  const [, title, url, desc] = match;
  const id = slugify(url);

  return {
    id,
    title: title.trim(),
    url: url.trim(),
    preview: (desc || "").trim(),
    source,
  };
}

async function parseFile(
  source: "llms" | "llms-full",
  filePath: string
): Promise<Section[]> {
  const txt = await fs.readFile(filePath, "utf8");
  const lines = txt.split("\n");

  const sections: Section[] = [];

  for (const line of lines) {
    if (!line.startsWith("-")) continue;
    const sec = parseMarkdownLine(line, source);
    if (sec) sections.push(sec);
  }

  return sections;
}

async function main() {
  const rawDir = path.join(process.cwd(), "src/data/raw");

  const llmsPath = path.join(rawDir, "v4-llms.txt");
  const fullPath = path.join(rawDir, "v4-llms-full.txt");

  const llms = await parseFile("llms", llmsPath);
  const full = await parseFile("llms-full", fullPath);

  const combined = [...llms, ...full];

  const unique = Object.values(
    combined.reduce((acc, item) => {
      if (!acc[item.id]) acc[item.id] = item;
      return acc;
    }, {} as Record<string, Section>)
  );

  const outPath = path.join(process.cwd(), "src/data/index.json");

  await fs.writeFile(outPath, JSON.stringify(unique, null, 2), "utf8");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
