import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  images: {
    formats: ["image/webp"],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1440, 1920],
    imageSizes: [32, 64, 96, 160, 256, 384, 640],
    qualities: [70, 75, 84],
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter"],
  },
});

export default withMDX(nextConfig);
