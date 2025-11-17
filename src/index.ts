import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetch } from "undici";
import { refreshDocsIfNeeded } from "./mcpStartup.js";
import { VectorStore } from "./utils/vectorStore.js";
import "dotenv/config";

// Create server instance
const server = new McpServer({
  name: "Uniswap MCP",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.registerTool(
  'get_page',
  {
        title: 'Get Page Content',
        description: 'Fetches the text content of a Uniswap Docs page',
        inputSchema: {
            url: z.string().url().describe("URL of a Uniswap Docs page"),
        },
        outputSchema:{
          url: z.string(),
          preview: z.string(),
        },
    },
  async ({ url }) => {
    if (!url.startsWith("https://docs.uniswap.org")) {
      throw new Error("Only URLs from docs.uniswap.org are allowed.");
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch page: HTTP ${res.status}`);
    }

    const html = await res.text();

    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const preview = text.slice(0, 1000);

    return {
      content: [
        {
          type: "text",
          text: preview,
        },
      ],
      structuredContent: {
        url,
        preview,
      },
    };
  }
);

server.registerTool(
  "search_docs",
  {
    title: "Semantic Search Uniswap Docs",
    description: "Searches Uniswap documentation using vector embeddings.",
    inputSchema: {
      query: z.string().describe("Search query, e.g. 'hooks', 'permit2', 'tick math'"),
      topK: z.number().optional().default(5),
    },
  },
  async ({ query, topK }) => {
    const results = await vectorStore.search(query, topK);

    const textOutput = results
      .map((r, i) => {
        const meta = r.metadata;
        return `${i + 1}. ${meta.title}\nURL: ${meta.url}\nPreview: ${meta.preview}\nScore: ${r.score.toFixed(
          4
        )}\n`;
      })
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: textOutput,
        },
      ],
      structuredContent: {
        query,
        results: results.map((r) => ({
          id: r.id,
          title: r.metadata.title,
          url: r.metadata.url,
          preview: r.metadata.preview,
          score: r.score,
        })),
      },
    };
  }
);

server.registerTool(
  "learn_about",
  {
    title: "Learn About Uniswap Concept",
    description: "Returns the most relevant Uniswap docs page for a topic.",
    inputSchema: {
      topic: z.string().describe("E.g. hooks, permit2, ticks, swap callback"),
    },
  },
  async ({ topic }) => {
    const results = await vectorStore.search(topic, 1);

    if (!results || results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No results found for '${topic}'.`,
          },
        ],
      };
    }

    const best = results[0];
    const meta = best.metadata;

    return {
      content: [
        {
          type: "text",
          text:
            `Best match for '${topic}':\n\n` +
            `Title: ${meta.title}\n` +
            `URL: ${meta.url}\n\n` +
            `Preview:\n${meta.preview}`,
        },
      ],
      structuredContent: {
        topic,
        id: best.id,
        title: meta.title,
        url: meta.url,
        preview: meta.preview,
        score: best.score,
      },
    };
  }
);

await refreshDocsIfNeeded();

const vectorStore = new VectorStore();
await vectorStore.load();

console.error("Starting Uniswap MCP server...");
const transport = new StdioServerTransport();
await server.connect(transport);