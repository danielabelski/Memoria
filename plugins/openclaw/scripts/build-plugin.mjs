#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(pluginRoot, "dist");
const outfile = path.join(distDir, "openclaw", "index.js");

await fs.rm(distDir, { recursive: true, force: true });
await fs.mkdir(path.dirname(outfile), { recursive: true });
await build({
  entryPoints: [path.join(pluginRoot, "openclaw", "index.ts")],
  outfile,
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  packages: "external",
  logLevel: "info",
});
