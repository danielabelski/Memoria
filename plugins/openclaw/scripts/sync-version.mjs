#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = path.join(pluginRoot, "package.json");
const manifestPath = path.join(pluginRoot, "openclaw.plugin.json");
const packageJson = JSON.parse(await fs.readFile(packagePath, "utf8"));
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

manifest.version = packageJson.version;
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
