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

The planned architecture replaces Ghost with MDX posts and reusable responsive collage components. See the local project plan in `PROJECT_PLAN.local.md`; that file is intentionally ignored by Git.

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

The legacy sync process expects `env.json` in the repository root with:

```json
{
  "CONTENT_API_KEY": "your-ghost-content-api-key",
  "GHOST_URL": "http://localhost:2368"
}
```

Do not add real credentials to new documentation, scripts, or commits. Moving the existing configuration to an ignored environment file is a pending security task.

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
│   ├── public/images/          Generated WebP assets
│   └── src/lib/ghost-data.json Cached published posts
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
- `/sakura-near-my-houses`
- `/midnight-in-shinjuku`
- `/coming-soon`

The planned route format is `/blog/[slug]`, with redirects retained for existing shared links.

## Known transitional limitations

- Creating rich collages currently requires custom HTML inside Ghost content.
- Ghost must run locally when synchronizing newly published content.
- TypeScript build errors are temporarily ignored.
- The Next.js configuration contains a deprecated ESLint option.
- The current deployment requires Vercel authentication and is not yet public.
- A stable production alias or custom domain is not yet configured.
- The content and image workflow will be migrated to MDX.
