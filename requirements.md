# Uniswap MCP Server – Requirements

## Overview

The Uniswap MCP Server provides programmatic access to Uniswap documentation and developer resources through the **Model Context Protocol (MCP)**.  
It enables AI assistants and developers to query, search, and retrieve up-to-date documentation content — allowing for seamless integration into LLM-based workflows.

---

## 1. Objectives

- Provide structured access to Uniswap documentation and repositories via MCP.
- Enable **semantic and keyword search** across Uniswap Docs (v3, v4, Unichain, etc.).
- Support **direct retrieval** of documentation content and metadata.
- Maintain **automatic synchronization** with the latest documentation releases.
- Be **compliant with MCP specification** and usable with any MCP-compatible client (Claude, ChatGPT, etc.).

---

## 2. Functional Requirements

### 2.1 Core MCP Functions

| Tool / Resource | Type | Description |
|-----------------|------|-------------|
| `search_docs` | Tool | Searches Uniswap documentation using keyword and semantic matching. |
| `get_doc_content` | Tool | Fetches full documentation content given an identifier or URL. |
| `list_topics` | Resource | Lists all available documentation topics or sections. |
| `list_versions` | Resource | Returns supported Uniswap doc versions (v2, v3, v4, unichain). |

### 2.2 Documentation Indexing
- Parse and index Markdown / MDX files from:
  - `https://docs.uniswap.org`
  - `https://github.com/uniswap/v4-core`
  - `https://github.com/uniswap/v4-periphery`
  - `https://github.com/uniswapfoundation`
- Extract:
  - Title
  - Path / URL
  - Version (if applicable)
  - Content (plain text)
  - Metadata (tags, categories)
- Store the indexed data locally (SQLite or JSON file).

### 2.3 Search & Retrieval
- Support both:
  - **Keyword Search** (via Lunr.js)
  - **Semantic Search** (optional via embeddings)
- Return results with:
  - Title
  - Snippet / Summary
  - URL
  - Version tag
  - Relevance score

### 2.4 Syncing
- Scheduled task (via GitHub Action or cron job) to update index weekly.
- Track last updated timestamp in metadata.
- Optional manual re-index endpoint.

### 2.5 Version Management
- Maintain separate indices for each documentation version (`v3`, `v4`, `unichain`).
- Allow filtering searches by version.

---

## 3. Non-Functional Requirements

| Category | Requirement |
|-----------|-------------|
| **Language** | TypeScript |
| **Framework** | Fastify or Express |
| **Runtime** | Node.js 20+ |
| **MCP SDK** | `@modelcontextprotocol/sdk` |
| **Search** | `lunr` or `meilisearch` (for keyword), optional embeddings |
| **Data Store** | SQLite / JSON index file |
| **Logging** | `pino` or `winston` |
| **Error Handling** | Standard MCP-compliant error responses |
| **Performance** | <200ms query latency for cached results |
| **Scalability** | Must handle multiple concurrent client requests |
| **Documentation** | `README.md` and OpenAPI-like endpoint list |
| **Security** | Read-only; no auth required for public use |
| **Deployment** | Vercel / Fly.io / Render (any Node host supporting HTTPS) |

---