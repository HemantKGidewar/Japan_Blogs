import ghostData from "./ghost-data.json";

export interface GhostTag {
  id?: string;
  name: string;
  slug?: string;
}

export interface GhostPost {
  id: string;
  slug: string;
  title: string;
  html: string | null;
  feature_image: string | null;
  published_at: string | null;
  tags: GhostTag[];
}

function rewriteImageUrls(html: string | null): string | null {
  if (!html) return html;

  return html
    .replace(/http:\/\/localhost:2368\/content\/images\//g, "/images/")
    .replace(/(\/images\/[^"?]+)\.(jpg|jpeg|png)/gi, "$1.webp");
}

function normalizePost(post: GhostPost): GhostPost {
  return {
    ...post,
    html: rewriteImageUrls(post.html),
    feature_image: post.feature_image
      ? rewriteImageUrls(post.feature_image)
      : null,
  };
}

const posts = ghostData as unknown as GhostPost[];

export async function getPosts(): Promise<GhostPost[]> {
  return posts.map(normalizePost);
}

export async function getPostBySlug(slug: string): Promise<GhostPost | null> {
  const post = posts.find((candidate) => candidate.slug === slug);
  return post ? normalizePost(post) : null;
}
