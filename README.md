# Japan Time-Capsule

An image-first photo journal for stories and memories from Japan. The site is a statically rendered Next.js application deployed through Vercel.

## Links

- GitHub: [HemantKGidewar/Japan_Blogs](https://github.com/HemantKGidewar/Japan_Blogs)
- Current verified Vercel deployment: [japan-blogs-69fnw9otr-hemantkumar-gidewars-projects.vercel.app](https://japan-blogs-69fnw9otr-hemantkumar-gidewars-projects.vercel.app) (Vercel authentication currently required)

The URL above identifies the currently verified production deployment, but deployment protection currently redirects visitors to Vercel SSO. Deployment protection must be disabled for production, and a stable project alias or custom domain should be configured before the site is widely shared.

## Current architecture

```text
Local Ghost CMS
    ↓ Content API
sync.js
    ├── next-frontend/src/lib/ghost-data.json
    └── next-frontend/public/images/*.webp
            ↓
       Next.js frontend
            ↓
          Vercel
```

Ghost is currently a temporary local authoring dependency. The frontend reads cached post data and local WebP images, so the deployed application does not require a running Ghost server.

New stories can now be written as MDX and assembled with reusable responsive collage components. Ghost remains only as a temporary source for the existing stories. See the local project plan in `PROJECT_PLAN.local.md`; that file is intentionally ignored by Git.

## Prerequisites

- Node.js 20 or newer
- npm
- Ghost CLI, only while the legacy Ghost workflow remains in use
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

Copy the environment template and fill in the local Ghost credentials:

```bash
cp .env.example .env.local
```

The legacy sync process reads `GHOST_URL` and `GHOST_CONTENT_API_KEY`. Legacy Admin API scripts additionally require `GHOST_ADMIN_API_KEY`. `.env.local` is ignored by Git and must never be committed.

## Run the website locally

The Next.js frontend uses the already-cached content and images, so Ghost is not required for normal frontend development:

```bash
npm run dev:next
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

## Run the legacy Ghost authoring workflow

Start the local Ghost installation:

```bash
npm run dev:ghost
```

Ghost runs at [http://localhost:2368](http://localhost:2368), with its admin interface at [http://localhost:2368/ghost](http://localhost:2368/ghost).

After publishing or updating content in Ghost, open another terminal at the repository root and run:

```bash
node sync.js
```

The sync command:

- Fetches published posts from the local Ghost Content API.
- Finds locally hosted images referenced by those posts.
- Corrects orientation and converts required images to WebP.
- Reuses identical generated output rather than producing duplicate files.
- Updates the cached post data used by Next.js.

## Build

Build the frontend from the repository root:

```bash
npm run publish
```

This legacy command requires Ghost to be running because it synchronizes content before building.

To build only the currently cached frontend:

```bash
cd next-frontend
npm run build
```

## Image maintenance

Preview exact duplicate-image cleanup:

```bash
npm run images:dedupe
```

Apply the audited cleanup:

```bash
npm run images:dedupe:apply
```

The deduplication command hashes file contents and protects image filenames referenced by the cached Ghost data. Run the dry-run command before applying removals.

Original full-resolution photographs should remain in a private photo library or backup. The repository should contain only selected web-ready images until remote image storage is introduced.

## Project structure

```text
.
├── ghost-cms/                  Local legacy Ghost installation
├── next-frontend/              Next.js application
│   ├── content/                File-based MDX stories
│   ├── public/images/          Selected/generated WebP assets
│   ├── src/components/gallery/ Responsive collage components
│   └── src/lib/ghost-data.json Cached legacy stories
├── scripts/                    Image maintenance scripts
├── sync.js                     Ghost content and image synchronizer
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

The deployed build reads committed `ghost-data.json` and committed public images. It does not contact the local Ghost server during a Vercel build.

## Current routes

- `/` — story gallery
- `/blog/sakura-near-my-houses`
- `/blog/midnight-in-shinjuku`
- `/blog/coming-soon`

The previous top-level story URLs permanently redirect to `/blog/[slug]` so existing shared links continue working.

## Known transitional limitations

- Ghost must run locally when synchronizing newly published content.
- The current deployment requires Vercel authentication and is not yet public.
- A stable production alias or custom domain is not yet configured.
- Existing Ghost stories still need to be migrated to MDX.
- Image importing and remote object storage are planned but not implemented yet.
