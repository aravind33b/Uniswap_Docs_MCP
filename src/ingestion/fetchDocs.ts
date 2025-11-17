import { fetch } from "undici";
import fs from "fs/promises";
import path from "path";

const FILES = [
  {
    url: "https://docs.uniswap.org/v4-llms.txt",
    file: "v4-llms.txt",
  },
  {
    url: "https://docs.uniswap.org/v4-llms-full.txt",
    file: "v4-llms-full.txt",
  },
];

async function main() {
  const rawDir = path.join(process.cwd(), "src/data/raw");
  await fs.mkdir(rawDir, { recursive: true });

  for (const { url, file } of FILES) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }

    const text = await res.text();
    const outPath = path.join(rawDir, file);

    await fs.writeFile(outPath, text, "utf8");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
