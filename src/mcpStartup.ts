import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function runScript(cmd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err)
        return reject(err);
      if (stderr)
        console.error(stderr);
      resolve();
    });
  });
}

export async function refreshDocsIfNeeded() {
  const rawDir = path.join(process.cwd(), "src/data/raw");
  const lastFile = path.join(rawDir, "last_download.json");

  let shouldDownload = false;

  try {
    const data = await fs.readFile(lastFile, "utf8");
    const { lastDownload } = JSON.parse(data);

    const age = Date.now() - lastDownload;

    if (age > SEVEN_DAYS_MS) {
      shouldDownload = true;
    }
  } catch {
    shouldDownload = true;
  }

  if (shouldDownload) {
    await runScript("node build/ingestion/fetchDocs.js");
    await runScript("node build/ingestion/parseLLMFiles.js");
    await fs.writeFile(
      lastFile,
      JSON.stringify({ lastDownload: Date.now() }, null, 2)
    );
  }
}
