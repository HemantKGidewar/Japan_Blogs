const fs = require("fs");
const path = require("path");

const slug = process.argv[2];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (!slug || !slugPattern.test(slug)) {
  console.error("Usage: npm run new:post -- lowercase-slug-with-hyphens");
  process.exit(1);
}

const projectRoot = path.resolve(__dirname, "..");
const postDirectory = path.join(projectRoot, "next-frontend", "content", slug);
const postFile = path.join(postDirectory, "post.mdx");
const imagesDirectory = path.join(postDirectory, "images");
const sourceDirectory = path.join(postDirectory, "source-photos");

if (fs.existsSync(postDirectory)) {
  console.error(`A post directory already exists: ${postDirectory}`);
  process.exit(1);
}

const title = slug
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");
const today = new Date().toISOString().slice(0, 10);
const template = `---
title: ${title}
slug: ${slug}
summary: Replace this with a short description for the homepage and link previews.
takenDate: ${today}
publishedDate: ${today}
cover: null
tags: []
status: draft
---

Start writing your story here. Put selected originals in this post's source-photos directory, then run:

\`npm run images:import -- content/${slug}/source-photos\`

## First section

Add photos from the generated images.json manifest using Photo, Collage, or AutoGallery.
`;

fs.mkdirSync(imagesDirectory, { recursive: true });
fs.mkdirSync(sourceDirectory, { recursive: true });
fs.writeFileSync(postFile, template);
fs.writeFileSync(path.join(imagesDirectory, ".gitkeep"), "");
fs.writeFileSync(path.join(sourceDirectory, ".gitkeep"), "Selected full-resolution originals placed here are ignored by Git.\n");

console.log(`Created draft: ${path.relative(projectRoot, postFile)}`);
console.log("Run npm run dev:next to preview it locally.");
