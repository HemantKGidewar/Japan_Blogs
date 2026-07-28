import { getPostBySlug, getPosts } from '@/lib/ghost';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post: any) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return notFound();
    }

    return (
      <main className="min-h-screen bg-[#0a0a0a] text-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <Link href="/" className="inline-block text-gray-500 hover:text-white transition-colors mb-16 uppercase tracking-widest text-xs font-semibold">
            ← Back to Gallery
          </Link>
          
          <header className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
              {post.title}
            </h1>
            <div className="flex items-center text-gray-400 space-x-4 text-sm">
              {post.published_at && (
                <time>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</time>
              )}
              {post.tags && post.tags.length > 0 && (
                <>
                  <span>•</span>
                  <span>{post.tags.map((t: any) => t.name).join(', ')}</span>
                </>
              )}
            </div>
          </header>

          {post.feature_image && (
            <div className="w-full mb-16 rounded-xl overflow-hidden bg-gray-900 shadow-2xl">
              <img 
                src={post.feature_image} 
                alt={post.title}
                className="w-full h-auto object-contain"
              />
            </div>
          )}

          <article 
            className="text-lg leading-relaxed text-gray-300 space-y-6 w-full [&>p]:mb-6 [&>img]:rounded-xl [&>img]:my-8 [&>h1]:text-4xl [&>h1]:text-white [&>h1]:font-extrabold [&>h1]:mt-16 [&>h1]:mb-6 [&>h1]:border-b [&>h1]:border-gray-800 [&>h1]:pb-4 [&>h1>span]:text-gray-500 [&>h1>span]:text-2xl [&>h1>span]:font-normal [&>h1>span]:ml-3 [&>h2]:text-2xl [&>h2]:text-white [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:text-white [&>h3]:font-bold [&>h3]:mt-8 [&>h3]:mb-4 [&>a]:text-blue-400 [&>a]:underline hover:[&>a]:text-blue-300 [&>figure]:my-8 [&>figure>img]:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.html || '' }}
          />
        </div>
      </main>
    );
  } catch (err) {
    return notFound();
  }
}
