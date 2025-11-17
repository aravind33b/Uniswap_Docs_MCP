import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";
import "dotenv/config";

interface Section {
  id: string;
  title: string;
  url: string;
  preview: string;
}

async function main() {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const indexPath = path.join(process.cwd(), "src/data/index.json");
  const index = JSON.parse(await fs.readFile(indexPath, "utf8")) as Section[];

  const texts = index.map((s) => `${s.title} ${s.preview}`.trim());

  const embeddingResponse = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  const vectors = embeddingResponse.data.map((d) => d.embedding);

  const outPath = path.join(process.cwd(), "src/data/vectors.json");

  const output = {
    ids: index.map((s) => s.id),
    vectors,
  };

  await fs.writeFile(outPath, JSON.stringify(output, null, 2), "utf8");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
