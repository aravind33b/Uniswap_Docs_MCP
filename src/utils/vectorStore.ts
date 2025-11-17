import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";
import "dotenv/config";

export interface VectorStoreSearchResult {
  id: string;
  score: number;
}

export class VectorStore {
  private ids!: string[];
  private vectors!: number[][];
  private indexPath: string;
  private index!: any[];
  private client: OpenAI;

  constructor() {
    this.indexPath = path.join(process.cwd(), "src/data/index.json");
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  get size() {
    return this.ids.length;
  }

  async load() {
    const indexRaw = await fs.readFile(this.indexPath, "utf8");
    this.index = JSON.parse(indexRaw);

    const vectorsPath = path.join(process.cwd(), "src/data/vectors.json");
    const vectorsRaw = await fs.readFile(vectorsPath, "utf8");
    const { ids, vectors } = JSON.parse(vectorsRaw);

    this.ids = ids;
    this.vectors = vectors;
  }

  async search(query: string, topK = 5): Promise<any[]> {
    const embeddingResponse = await this.client.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const queryVec = embeddingResponse.data[0].embedding;

    // cosine similarity
    const scores = this.vectors.map((vec, i) => {
      const dot = vec.reduce((s, v, j) => s + v * queryVec[j], 0);
      const magA = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
      const magB = Math.sqrt(queryVec.reduce((s, v) => s + v * v, 0));
      const cosine = dot / (magA * magB);
      return { id: this.ids[i], score: cosine };
    });

    const sorted = scores.sort((a, b) => b.score - a.score).slice(0, topK);

    // attach metadata
    return sorted.map((s) => ({
      ...s,
      metadata: this.index.find((p) => p.id === s.id),
    }));
  }
}
