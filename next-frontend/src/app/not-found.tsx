import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#090909] px-6 text-white">
      <div className="max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-300">404 · Frame not found</p>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">This story is not in the archive.</h1>
        <p className="mt-6 text-lg leading-relaxed text-neutral-400">The link may have moved, or the story may still be developing in the darkroom.</p>
        <Link href="/" className="mt-10 inline-flex rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold transition hover:border-rose-300 hover:text-rose-200">
          Return to the photo stories
        </Link>
      </div>
    </main>
  );
}
