import type { NextConfig } from "next";
import path from "path";

// Üst klasördeki package-lock.json Turbopack'in yanlış kök dizini seçmesine
// neden olabiliyor; modül çözümlemesini bu projeye sabitle.
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
