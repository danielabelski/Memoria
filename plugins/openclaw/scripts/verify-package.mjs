#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await fs.readFile(path.join(pluginRoot, "package.json"), "utf8"));
const manifest = JSON.parse(
  await fs.readFile(path.join(pluginRoot, "openclaw.plugin.json"), "utf8"),
);

if (packageJson.version !== manifest.version) {
  throw new Error(
    `Version mismatch: package.json=${packageJson.version}, openclaw.plugin.json=${manifest.version}`,
  );
}

const extensions = packageJson.openclaw?.extensions;
if (!Array.isArray(extensions) || extensions.length === 0) {
  throw new Error("package.json must declare at least one openclaw extension");
}

for (const extension of extensions) {
  if (typeof extension !== "string" || !/\.(?:c|m)?js$/.test(extension)) {
    throw new Error(`OpenClaw extension must be compiled JavaScript: ${String(extension)}`);
  }
  const extensionPath = path.resolve(pluginRoot, extension);
  const relativePath = path.relative(pluginRoot, extensionPath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error(`OpenClaw extension escapes the package root: ${extension}`);
  }
  const stat = await fs.stat(extensionPath).catch(() => null);
  if (!stat?.isFile()) {
    throw new Error(`OpenClaw extension does not exist: ${extension}`);
  }
}

console.log(`Verified package ${packageJson.name}@${packageJson.version}`);
