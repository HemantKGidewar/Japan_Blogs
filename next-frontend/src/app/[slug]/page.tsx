import { getPostSummaries } from "@/lib/posts";
import { notFound, permanentRedirect } from "next/navigation";

export async function generateStaticParams() {
  const posts = await getPostSummaries(false);
  return posts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export default async function LegacyPostRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await getPostSummaries(false);
  if (!posts.some((post) => post.slug === slug)) notFound();
  permanentRedirect(`/blog/${slug}`);
}
