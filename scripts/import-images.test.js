const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const sharp = require("sharp");
const { findOrphans, importImages, parseExifDate } = require("./import-images");

test("imports incrementally and deduplicates identical source files", async (context) => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "japan-image-import-"));
  context.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));

  const sourceDirectory = path.join(projectRoot, "next-frontend", "content", "test-story", "source-photos");
  fs.mkdirSync(sourceDirectory, { recursive: true });
  const first = path.join(sourceDirectory, "Mount-Fuji.png");
  const duplicate = path.join(sourceDirectory, "Mount-Fuji-copy.png");
  await sharp({ create: { width: 1200, height: 800, channels: 3, background: "#b9d9f5" } }).png().toFile(first);
  fs.copyFileSync(first, duplicate);

  const initial = await importImages("next-frontend/content/test-story/source-photos", { projectRoot });
  assert.deepEqual({ sourceCount: initial.sourceCount, imageCount: initial.imageCount, created: initial.created, duplicateInputs: initial.duplicateInputs }, { sourceCount: 2, imageCount: 1, created: 1, duplicateInputs: 1 });

  const manifest = JSON.parse(fs.readFileSync(initial.manifestFile, "utf8"));
  assert.equal(manifest.images[0].width, 1200);
  assert.equal(manifest.images[0].height, 800);
  assert.equal(manifest.images[0].aspectRatio, 1.5);
  assert.match(manifest.images[0].blurDataURL, /^data:image\/webp;base64,/);
  assert.equal(manifest.images[0].alt, "");

  manifest.images[0].alt = "Mount Fuji beneath a pale blue sky";
  fs.writeFileSync(initial.manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  const repeated = await importImages("content/test-story/source-photos", { projectRoot });
  const repeatedManifest = JSON.parse(fs.readFileSync(repeated.manifestFile, "utf8"));
  assert.equal(repeated.created, 0);
  assert.equal(repeated.reused, 1);
  assert.equal(repeated.manifestUpdated, false);
  assert.equal(repeatedManifest.generatedAt, manifest.generatedAt);
  assert.equal(repeatedManifest.images[0].alt, "Mount Fuji beneath a pale blue sky");

  const secondSourceDirectory = path.join(projectRoot, "next-frontend", "content", "second-story", "source-photos");
  fs.mkdirSync(secondSourceDirectory, { recursive: true });
  fs.copyFileSync(first, path.join(secondSourceDirectory, "Fuji-again.png"));
  const crossPost = await importImages("content/second-story/source-photos", { projectRoot });
  const crossPostManifest = JSON.parse(fs.readFileSync(crossPost.manifestFile, "utf8"));
  assert.equal(crossPost.created, 0);
  assert.equal(crossPost.reused, 1);
  assert.equal(crossPostManifest.images[0].src, repeatedManifest.images[0].src);
  assert.equal(walkLibrary(projectRoot).length, 2);
  assert.deepEqual(findOrphans(projectRoot), []);
});

test("extracts an EXIF-style capture date", () => {
  assert.equal(parseExifDate(Buffer.from("DateTimeOriginal\0 2024:04:12 08:08:59\0", "latin1")), "2024-04-12T08:08:59");
  assert.equal(parseExifDate(undefined), null);
});

function walkLibrary(projectRoot) {
  return fs.readdirSync(path.join(projectRoot, "next-frontend", "public", "images", "library"));
}
