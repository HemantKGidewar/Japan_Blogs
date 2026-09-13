import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const postMetadataSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().regex(slugPattern, "Use lowercase words separated by hyphens"),
  summary: z.string().trim().min(1).max(300),
  takenDate: z.string().regex(isoDate, "Use YYYY-MM-DD").optional(),
  publishedDate: z.string().regex(isoDate, "Use YYYY-MM-DD"),
  cover: z.string().trim().min(1).nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(["draft", "published"]),
});

export type PostMetadata = z.infer<typeof postMetadataSchema>;

export interface PostSummary extends PostMetadata {
  source: "mdx";
}

interface MdxModule {
  default: ComponentType<{ components?: MDXComponents }>;
}

export interface BlogPost {
  source: "mdx";
  metadata: PostMetadata;
  Content: MdxModule["default"];
}

function getMdxSlugs(): string[] {
  const contentDirectory = path.join(process.cwd(), "content");
  if (!fs.existsSync(contentDirectory)) return [];
  return fs.readdirSync(contentDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(contentDirectory, entry.name, "post.mdx")))
    .map((entry) => entry.name)
    .sort();
}

async function importMdxPost(slug: string): Promise<MdxModule> {
  if (!slugPattern.test(slug) || !getMdxSlugs().includes(slug)) {
    throw new Error(`Unknown MDX post slug: ${slug}`);
  }
  return import(`../../content/${slug}/post.mdx`);
}

function validateMetadata(value: unknown, expectedSlug: string): PostMetadata {
  const result = postMetadataSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid frontmatter for ${expectedSlug}: ${z.prettifyError(result.error)}`);
  }
  if (result.data.slug !== expectedSlug) {
    throw new Error(`Post folder "${expectedSlug}" must match frontmatter slug "${result.data.slug}".`);
  }
  return result.data;
}

function readMetadata(slug: string): PostMetadata {
  if (!slugPattern.test(slug)) throw new Error(`Invalid MDX post slug: ${slug}`);
  const postFile = path.join(process.cwd(), "content", slug, "post.mdx");
  const source = fs.readFileSync(postFile, "utf8");
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) throw new Error(`Missing YAML frontmatter in ${postFile}.`);
  return validateMetadata(parseYaml(frontmatter[1]), slug);
}

async function getMdxPosts(): Promise<BlogPost[]> {
  return Promise.all(
    getMdxSlugs().map(async (slug) => {
      const mdxModule = await importMdxPost(slug);
      return {
        source: "mdx" as const,
        metadata: readMetadata(slug),
        Content: mdxModule.default,
      };
    }),
  );
}

export async function getPostSummaries(includeDrafts = false): Promise<PostSummary[]> {
  const mdxPosts = await getMdxPosts();
  const mdxSummaries = mdxPosts.map((post) => ({ ...post.metadata, source: post.source }));

  return mdxSummaries
    .filter((post) => includeDrafts || post.status === "published")
    .sort((left, right) => {
      const dateOrder = right.publishedDate.localeCompare(left.publishedDate);
      return dateOrder || left.title.localeCompare(right.title);
    });
}

export async function getBlogPostBySlug(slug: string, includeDrafts = false): Promise<BlogPost | null> {
  if (getMdxSlugs().includes(slug)) {
    const mdxModule = await importMdxPost(slug);
    const metadata = readMetadata(slug);
    if (!includeDrafts && metadata.status === "draft") return null;
    return { source: "mdx", metadata, Content: mdxModule.default };
  }

  return null;
}
