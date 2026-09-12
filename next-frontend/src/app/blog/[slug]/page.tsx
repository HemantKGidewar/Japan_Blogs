import { getBlogPostBySlug, getPostSummaries } from "@/lib/posts";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const includeDrafts = process.env.NODE_ENV !== "production";

export async function generateStaticParams() {
  const posts = await getPostSummaries(includeDrafts);
  return posts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug, includeDrafts);
  if (!post) notFound();

  const { metadata } = post;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/" className="inline-block text-gray-500 hover:text-white transition-colors mb-16 uppercase tracking-widest text-xs font-semibold">
          ← Back to Gallery
        </Link>

        <header className="mb-16">
          {metadata.status === "draft" && (
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-amber-400">Local draft preview</p>
          )}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            {metadata.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-400 text-sm">
            <time dateTime={metadata.publishedDate}>
              {new Date(`${metadata.publishedDate}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
            </time>
            {metadata.tags.length > 0 && (
              <>
                <span>•</span>
                <span>{metadata.tags.join(", ")}</span>
              </>
            )}
          </div>
        </header>

        {metadata.cover && (
          <div className="w-full mb-16 rounded-xl overflow-hidden bg-gray-900 shadow-2xl">
            <Image
              src={metadata.cover}
              alt={metadata.title}
              width={1920}
              height={1080}
              sizes="(min-width: 896px) 848px, calc(100vw - 3rem)"
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        )}

        {post.source === "mdx" ? (
          <article className="blog-content text-lg leading-relaxed text-gray-300">
            <post.Content />
          </article>
        ) : (
          <article
            className="blog-content text-lg leading-relaxed text-gray-300"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        )}
      </div>
    </main>
  );
}
