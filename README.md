# Japan Time-Capsule

An image-first photo journal for stories and memories from Japan. The site is a statically rendered Next.js application deployed through Vercel.

## Links

- GitHub: [HemantKGidewar/Japan_Blogs](https://github.com/HemantKGidewar/Japan_Blogs)
- Public website: [japan-blogs.vercel.app](https://japan-blogs.vercel.app)

The stable Vercel production alias is public. Generated deployment and preview URLs remain protected.

## Current architecture

```text
MDX stories + image manifests
              ↓
Responsive collage components
              ↓
       Next.js frontend
              ↓
           Vercel
```

Stories are MDX files assembled with reusable responsive collage components. Selected, web-ready images are stored locally for now; full-resolution originals remain outside Git. The site has no Ghost or database dependency. See the intentionally ignored `PROJECT_PLAN.local.md` for the local roadmap.

## Prerequisites

- Node.js 20 or newer
- npm
- Git and optional GitHub CLI (`gh`)

## Install

Install both workspace dependency sets from the repository root:

```bash
npm ci
cd next-frontend
npm ci
cd ..
```

The repository currently has separate root and frontend lockfiles, so both installations are required.

## Environment

Set the canonical public URL locally only when testing production metadata:

```bash
cp .env.example .env.local
```

Set `NEXT_PUBLIC_SITE_URL` to the final public origin in Vercel's Production environment. It is used for canonical links, social previews, structured data, and the sitemap. Vercel's production URL is used as a fallback.

## Run the website locally

From the repository root:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You can also run the command from `next-frontend/`:

```bash
npm run dev
```

## Create an MDX draft

Create a new file-based post from the repository root:

```bash
npm run new:post -- kyoto-at-night
```

This creates `next-frontend/content/kyoto-at-night/post.mdx` and an accompanying image directory. New posts start with `status: draft`; drafts appear locally but are excluded from production builds. Change the status to `published` only when the story is ready.

MDX posts use validated frontmatter containing a title, slug, summary, dates, cover, tags, and publication status. Published stories use `/blog/<slug>` URLs.

## Build image collages

`Photo`, `Collage`, and `AutoGallery` are available directly inside every MDX post—no import or inline CSS is needed. Supply the real image dimensions so the browser can reserve space, and always add meaningful alt text:

```mdx
<Collage layout="large-left" label="Cherry blossoms around Yoga">
  <Photo src="/images/2026/07/photo-1.webp" alt="Sakura canopy over a quiet street" width={1600} height={1067} />
  <Photo src="/images/2026/07/photo-2.webp" alt="Petals beside a stone path" width={1067} height={1600} />
  <Photo src="/images/2026/07/photo-3.webp" alt="Friends beneath cherry trees" width={1600} height={1067} caption="An afternoon walk" focalPoint="top" />
</Collage>
```

Available layouts are `single`, `two-column`, `three-column`, `large-left`, `large-right`, `hero-two`, `portrait-pair`, `masonry`, and `film-strip`. Use `<AutoGallery>` in place of `<Collage>` to choose a layout from the photo count and orientation. A photo can be reused in multiple collages by referencing the same `src`; this does not duplicate the image file.

All photos open in an accessible larger view by default. Set `lightbox={false}` for a non-interactive image, `priority` for an important above-the-fold image, or `focalPoint="top-right"` to control cropping. The local draft at `/blog/mdx-workflow-preview` demonstrates every layout when running the development server.

## Import photos for a post

Keep original photographs backed up outside this repository. Copy only the selected originals for the current story into its ignored authoring directory, then import them:

```bash
cp /path/to/selected/photos/* next-frontend/content/kyoto-at-night/source-photos/
npm run images:import -- content/kyoto-at-night/source-photos
```

The importer auto-rotates from EXIF orientation, limits the web image to 2560 px, creates a 640 px thumbnail and tiny blur placeholder, and uses the original file's SHA-256 hash as its stable asset name. Running it again processes only new or changed files. Identical originals share one generated asset, including when they are selected for different posts.

The command updates `next-frontend/content/<slug>/images.json`. Add meaningful `alt` text and optional captions there, then use its `src`, `width`, and `height` values in the post's `<Photo>` elements. Commit the manifest and generated files under `next-frontend/public/images/library/`; never commit `source-photos/`.

Review generated files no longer referenced by a manifest without deleting anything:

```bash
npm run images:orphans
```

Run the pipeline regression tests with `npm run images:test`.

## Build

Build the frontend from the repository root:

```bash
npm run publish
```

This validates and builds the file-based site without a CMS or database.

To build only the currently cached frontend:

```bash
cd next-frontend
npm run build
```

Original full-resolution photographs should remain in a private photo library or backup. The repository should contain only selected web-ready images until remote image storage is introduced.

## Project structure

```text
.
├── next-frontend/              Next.js application
│   ├── content/                File-based MDX stories
│   ├── public/images/library/  Hash-addressed WebP assets and thumbnails
│   ├── src/components/gallery/ Responsive collage components
│   └── src/lib/posts.ts        Validated MDX post loader
├── scripts/                    Post and image workflow scripts
└── package.json                Root development commands
```

## Deployment

The GitHub repository is connected to Vercel. Pushing `main` creates a production deployment; other branches and pull requests can be used for preview deployments.

The frontend application is rooted in `next-frontend/`. Vercel should use:

```text
Framework: Next.js
Root directory: next-frontend
Build command: npm run build
```

The deployed build reads committed MDX and web-ready images. It does not contact a CMS or database.

Before sharing the site from Instagram:

1. In Vercel, open **Project → Settings → Deployment Protection** and make the Production environment publicly accessible. Preview protection can remain enabled.
2. In **Project → Settings → Domains**, assign a stable `*.vercel.app` alias or connect a custom domain.
3. Set `NEXT_PUBLIC_SITE_URL` for Production to that exact origin and redeploy.

Production uses Vercel Standard Protection: the stable production domain is public, while generated deployment and preview URLs remain protected.

Vercel Web Analytics is enabled through `@vercel/analytics`. After deployment, page views, top pages, referrers, countries, devices, operating systems, and browsers appear under **Vercel → japan-blogs → Analytics**. Analytics runs in production automatically; local development visits are not counted as production traffic.

## Current routes

- `/` — story gallery
- `/blog/sakura-near-my-houses` — published MDX photo story

Development mode also exposes the draft-only `/blog/mdx-workflow-preview` component gallery and `/blog/sakura-layout-stress` 40-photo performance check. Draft routes are excluded from production builds.

Published stories provide canonical metadata, large-image Open Graph and Twitter cards, `BlogPosting` structured data, next/previous navigation, and sitemap entries. Drafts are omitted from the sitemap and marked `noindex` in local previews.

The previous top-level story URLs permanently redirect to `/blog/[slug]` so existing shared links continue working.

## Known transitional limitations

- A custom domain is optional; the stable `japan-blogs.vercel.app` production alias is active.
- Remote object storage is intentionally deferred until the optimized Git image library becomes cumbersome.
