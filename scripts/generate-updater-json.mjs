#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function usage() {
  console.error(
    [
      "Usage:",
      "  node scripts/generate-updater-json.mjs \\",
      "    --version 0.9.1 \\",
      "    --pub-date 2026-04-15T12:00:00Z \\",
      "    --notes-file notes.md \\",
      "    --platform windows-x86_64=https://example/msi.zip::SIGNATURE \\",
      "    --platform darwin-aarch64=https://example/app.tar.gz::SIGNATURE \\",
      "    --output dist/latest.json",
    ].join("\n"),
  );
}

function readArgs(argv) {
  const result = {
    version: "",
    pubDate: "",
    notes: "",
    output: "",
    platforms: {},
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--version":
        result.version = argv[++i] ?? "";
        break;
      case "--pub-date":
        result.pubDate = argv[++i] ?? "";
        break;
      case "--notes-file":
        result.notes = fs.readFileSync(argv[++i] ?? "", "utf8").trim();
        break;
      case "--output":
        result.output = argv[++i] ?? "";
        break;
      case "--platform": {
        const raw = argv[++i] ?? "";
        const eqIndex = raw.indexOf("=");
        const sigIndex = raw.lastIndexOf("::");
        if (eqIndex <= 0 || sigIndex <= eqIndex + 1) {
          throw new Error(`invalid --platform value: ${raw}`);
        }

        const key = raw.slice(0, eqIndex);
        const url = raw.slice(eqIndex + 1, sigIndex);
        const signature = raw.slice(sigIndex + 2);
        result.platforms[key] = { signature, url };
        break;
      }
      default:
        throw new Error(`unknown argument: ${arg}`);
    }
  }

  if (!result.version || !result.output || Object.keys(result.platforms).length === 0) {
    throw new Error("missing required arguments");
  }

  return result;
}

try {
  const args = readArgs(process.argv.slice(2));
  const payload = {
    version: args.version,
    notes: args.notes,
    pub_date: args.pubDate || undefined,
    platforms: args.platforms,
  };

  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.writeFileSync(args.output, `${JSON.stringify(payload, null, 2)}\n`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  usage();
  process.exit(1);
}
