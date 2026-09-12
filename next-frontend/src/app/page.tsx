import { getPostSummaries } from '@/lib/posts';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  const posts = await getPostSummaries(process.env.NODE_ENV !== 'production');

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <header className="mb-24 space-y-4">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
            Japan Time-Capsule
          </h1>
          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            A minimalist, high-performance photo journal archiving 3.5 years of life, quiet moments, and neon streets in Japan.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block space-y-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-900 border border-gray-800 shadow-2xl">
                {post.cover ? (
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">No Image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div>
                {post.status === 'draft' && (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">Local draft</p>
                )}
                <h2 className="text-xl font-medium tracking-tight text-gray-200 group-hover:text-white transition-colors duration-300">
                  {post.title}
                </h2>
                {post.tags && post.tags.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">{post.tags.join(' • ')}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
