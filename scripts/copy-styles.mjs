import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(root, "dist");

await mkdir(outputDirectory, { recursive: true });
await copyFile(
  resolve(root, "components/GlobalRiskMap/styles.css"),
  resolve(outputDirectory, "styles.css")
);
