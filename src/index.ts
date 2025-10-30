import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
  name: "Uniswap MCP",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  {
    name: "get_page",
    description: "Fetches the text content of a Uniswap Docs page",
    inputSchema: z.object({
      url: z.string().url().describe("URL of a Uniswap Docs page"),
    }),
  },
  async ({ url }) => {
    if (!url.startsWith("https://docs.uniswap.org")) {
      throw new Error("Only URLs from docs.uniswap.org are allowed");
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);

    const html = await res.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      url,
      length: text.length,
      preview: text.slice(0, 1000),
    };
  }
);

console.error("Starting Uniswap MCP server...");
const transport = new StdioServerTransport();
await server.connect(transport);