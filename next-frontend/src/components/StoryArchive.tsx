"use client";

import type { PostSummary } from "@/lib/posts";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "@/app/page.module.css";

const pageSize = 12;

function displayDate(value: string) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function StoryArchive({ posts }: { posts: PostSummary[] }) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <>
      <div className={styles.grid}>
        {visiblePosts.map((post, index) => (
          <article key={post.slug} className={styles.card}>
            <Link href={`/blog/${post.slug}`} className={styles.cardLink} aria-label={`Read ${post.title}`}>
              <div className={styles.imageFrame}>
                {post.cover ? (
                  <Image src={post.cover} alt="" fill sizes="(min-width: 1100px) 42vw, (min-width: 700px) 50vw, 100vw" priority={index === 0} className={styles.cover} />
                ) : (
                  <div className={styles.noImage}>Story in progress</div>
                )}
                <span className={styles.read}>View story ↗</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.meta}>
                  <time dateTime={post.takenDate || post.publishedDate}>{displayDate(post.takenDate || post.publishedDate)}</time>
                  {post.status === "draft" && <span className={styles.draft}>Local draft</span>}
                </div>
                <h3>{post.title}</h3>
                <p className={styles.summary}>{post.summary}</p>
                <ul className={styles.tags} aria-label="Story tags">
                  {post.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              </div>
            </Link>
          </article>
        ))}
      </div>
      {visibleCount < posts.length && (
        <div className={styles.loadMoreWrap}>
          <button type="button" className={styles.loadMore} onClick={() => setVisibleCount((count) => count + pageSize)}>
            Load more stories
          </button>
        </div>
      )}
    </>
  );
}
