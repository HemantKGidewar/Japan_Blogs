import { getBlogPostBySlug, getPostSummaries } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

const includeDrafts = process.env.NODE_ENV !== "production";

export async function generateStaticParams() {
  const posts = await getPostSummaries(includeDrafts);
  return posts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug, includeDrafts);
  if (!post) return {};
  const { metadata } = post;
  const pathname = `/blog/${metadata.slug}`;
  const images = metadata.cover ? [{ url: metadata.cover, alt: metadata.title }] : undefined;

  return {
    title: metadata.title,
    description: metadata.summary,
    alternates: { canonical: pathname },
    robots: metadata.status === "draft" ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "article",
      siteName: site.name,
      title: metadata.title,
      description: metadata.summary,
      url: pathname,
      publishedTime: `${metadata.publishedDate}T00:00:00Z`,
      tags: metadata.tags,
      images,
    },
    twitter: { card: "summary_large_image", title: metadata.title, description: metadata.summary, images: metadata.cover ? [metadata.cover] : undefined },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug, includeDrafts);
  if (!post) notFound();

  const { metadata } = post;
  const publishedPosts = await getPostSummaries(false);
  const currentIndex = publishedPosts.findIndex((candidate) => candidate.slug === slug);
  const newerPost = currentIndex > 0 ? publishedPosts[currentIndex - 1] : null;
  const olderPost = currentIndex >= 0 && currentIndex < publishedPosts.length - 1 ? publishedPosts[currentIndex + 1] : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: metadata.title,
    description: metadata.summary,
    datePublished: metadata.publishedDate,
    image: metadata.cover ? absoluteUrl(metadata.cover) : undefined,
    url: absoluteUrl(`/blog/${metadata.slug}`),
    author: { "@type": "Person", name: site.author },
    publisher: { "@type": "Organization", name: site.name },
    keywords: metadata.tags.join(", "),
  };

  return (
    <main className={styles.main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className={styles.shell}>
        <Link href="/" className={styles.back}>
          ← Back to Gallery
        </Link>

        <header className={styles.header}>
          {metadata.status === "draft" && (
            <p className={styles.draft}>Local draft preview</p>
          )}
          <h1>{metadata.title}</h1>
          <p className={styles.summary}>{metadata.summary}</p>
          <div className={styles.meta}>
            <time dateTime={metadata.publishedDate}>
              {new Date(`${metadata.publishedDate}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
            </time>
            {metadata.tags.length > 0 && (
              <>
                <span aria-hidden="true">•</span>
                <span>{metadata.tags.join(", ")}</span>
              </>
            )}
          </div>
        </header>

        {metadata.cover && (
          <figure className={styles.cover}>
            <Image
              src={metadata.cover}
              alt={metadata.title}
              width={metadata.coverWidth || 1920}
              height={metadata.coverHeight || 1080}
              sizes="(min-width: 896px) 848px, calc(100vw - 3rem)"
              className={styles.coverImage}
              priority
            />
            {metadata.coverCaption && <figcaption className={styles.coverCaption}>{metadata.coverCaption}</figcaption>}
          </figure>
        )}

        <article className={`blog-content ${styles.article}`}>
          <post.Content />
        </article>

        {(newerPost || olderPost) && (
          <nav className={styles.storyNav} aria-label="More photo stories">
            {newerPost ? <Link href={`/blog/${newerPost.slug}`}><span>Newer story</span><strong>← {newerPost.title}</strong></Link> : <span />}
            {olderPost ? <Link href={`/blog/${olderPost.slug}`}><span>Older story</span><strong>{olderPost.title} →</strong></Link> : <span />}
          </nav>
        )}
      </div>
    </main>
  );
}
