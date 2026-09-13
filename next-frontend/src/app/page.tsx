import { getPostSummaries } from "@/lib/posts";
import { StoryArchive } from "@/components/StoryArchive";
import styles from "./page.module.css";

export default async function Home() {
  const posts = await getPostSummaries(process.env.NODE_ENV !== "production");

  return (
    <main id="top" className={styles.main}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>A personal photo journal</p>
          <h1>Japan<br /><span>Time-Capsule</span></h1>
          <p className={styles.intro}>Photographs and thoughts from ordinary days, changing seasons, and nights beneath the neon.</p>
          <a href="#stories" className={styles.explore}>Explore the stories <span aria-hidden="true">↓</span></a>
        </header>

        <section id="stories" aria-labelledby="stories-title" className={styles.stories}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>The archive</p>
              <h2 id="stories-title">Photo stories</h2>
            </div>
            <p>{posts.filter((post) => post.status === "published").length} stories and counting</p>
          </div>

          <StoryArchive posts={posts} />
        </section>

        <footer className={styles.footer}>
          <p>Made as a place for photographs that deserve more than a passing scroll.</p>
          <a href="#top">Back to top ↑</a>
        </footer>
      </div>
    </main>
  );
}
