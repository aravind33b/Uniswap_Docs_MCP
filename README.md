# Uniswap Docs MCP

This is a ModelContextProtocol server that provides access to the Uniswap Docs.

## Usage

1. Access to Uniswap v4 documentation
2. Local semantic search (vector embeddings)
3. Tools for fetching docs pages
4. Tools for searching the LLMs metadata index
5. Can be used with any LLM

## Requirements

Node.js ≥ 18
npm ≥ 8
OpenAI API key
Mac/Linux environment recommended
Claude Desktop if you want to register the MCP server (Or ModelContextProtocol inspector)

## Setup

```bash
git clone https://github.com/aravind33b/Uniswap_Docs_MCP.git
cd Uniswap_Docs_MCP
npm install
```

Copy the .env.example file to .env and fill in the OpenAI API key.

```bash
cp .env.example .env
```

Build the server
```bash
npm run build
```

This generates the following files:

build/index.js
build/ingestion/*.js
build/utils/*.js

## Steps for local development

1. Fetch LLM metadata files
    ```bash
    node build/ingestion/fetchDocs.js
    ```
This will download the LLM metadata files to src/data/raw
    ```bash
    data/raw/v4-llms.txt
    data/raw/v4-llms-full.txt
    ```

2. Parse LLM metadata files
    ```bash
    node build/ingestion/parseLLMFiles.js
    ```
This will parse the LLM metadata files and generate an index file at `src/data/index.json`
