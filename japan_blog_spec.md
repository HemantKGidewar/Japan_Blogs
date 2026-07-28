# Project Specification: The Japan Time-Capsule Blog

## 1. Overview & Objective
A high-performance, minimalist photo-blogging platform designed to showcase a 3.5-year collection of photos from Japan. The primary goal is a **zero-friction reader experience**—no logins, no pop-ups, and no paywalls—delivered at **$0 hosting cost**.

## 2. Technical Stack
* **CMS (Headless):** Ghost (Running locally via `ghost-cli`).
* **Frontend:** Next.js (Static Site Generation - SSG).
* **Deployment:** Vercel / GitHub Pages.
* **Styling:** Tailwind CSS (Modern, clean, mobile-first).

## 3. Development Requirements for Antigravity

### A. Local CMS Setup
* Initialize a local Ghost instance (`ghost install local`) to serve as the Content API.
* Configure a **Custom Integration** to generate the `Content API Key` and `API URL`.
* Ensure the Ghost instance is strictly used for content creation/management.

### B. Frontend Architecture
* Scaffold a Next.js project using a Ghost-compatible template (e.g., `cms-ghost`).
* Implement **Static Site Generation (SSG)** to ensure all pages are pre-rendered for maximum speed.
* **Image Pipeline (Critical):** Since Ghost images are stored locally, implement a script to sync images from the Ghost `/content/images` directory to the Next.js `/public/images` directory during the build process.
* Update image path logic in the frontend to resolve to `/images/` instead of `localhost:2368`.

### C. UI/UX Design
* **Photo-First Layout:** Wide-screen gallery view for high-res photos.
* **Reading Experience:** Clean typography for "Short Stories" (200-400 words).
* **Instagram Optimization:** Ensure the site is perfectly responsive for viewers clicking links from the Instagram in-app browser.
* **Zero Noise:** No subscription modals, no sidebars, no footer bloat.

### D. Deployment Workflow
* Automate a build command: `sync-images && next build && next export`.
* Connect the repository to **Vercel** for automatic deployment upon pushing to the `main` branch.

## 4. Key Functional Features
* **Metadata:** Capture the "Taken Date" vs "Posted Date" to emphasize the nostalgia of the 3.5-year-old archive.
* **Tags:** Organize by "Vibe" (e.g., Quiet, Neon, Nature, Infrastructure) rather than just chronological order.
* **SEO:** Lightweight JSON-LD for travel/photography discoverability.

## 5. Maintenance Strategy
* Content is written locally.
* Images are stored in the GitHub repo (Static Assets).
* The live site remains a set of static files—permanent, secure, and free.
