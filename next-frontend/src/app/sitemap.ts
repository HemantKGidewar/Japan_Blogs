import type { MetadataRoute } from "next";
import { getPostSummaries } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPostSummaries(false);
  return [
    { url: absoluteUrl("/"), lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(`${post.publishedDate}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: post.cover ? [absoluteUrl(post.cover)] : undefined,
    })),
  ];
}
