#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const packed = spawnSync(
  npmCommand,
  ["pack", "--dry-run", "--json", "--ignore-scripts", "--silent"],
  { cwd: pluginRoot, encoding: "utf8" },
);

if (packed.status !== 0) {
  throw new Error(packed.stderr || packed.stdout || "npm pack --dry-run failed");
}

const report = JSON.parse(packed.stdout);
const files = new Set(report[0]?.files?.map((file) => file.path) ?? []);
if (!files.has("dist/openclaw/index.js")) {
  throw new Error("Packed package is missing dist/openclaw/index.js");
}

const sourceFiles = [...files].filter(
  (file) => file.endsWith(".ts") || file.includes("/__tests__/"),
);
if (sourceFiles.length > 0) {
  throw new Error(`Packed package contains source/test files: ${sourceFiles.join(", ")}`);
}

console.log(`Verified ${files.size} packed files`);
