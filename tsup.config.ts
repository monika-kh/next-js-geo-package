import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "components/GlobalRiskMap/index.ts" },
  outDir: "dist",
  format: ["esm", "cjs"],
  target: "es2020",
  dts: { compilerOptions: { incremental: false } },
  noExternal: ["world-atlas"],
  clean: true,
  splitting: false,
  sourcemap: false,
  minify: false,
  banner: { js: '"use client";' },
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
