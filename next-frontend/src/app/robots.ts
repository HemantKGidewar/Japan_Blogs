import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/blog/mdx-workflow-preview", "/blog/sakura-layout-stress"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
