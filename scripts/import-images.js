const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const defaultProjectRoot = path.resolve(__dirname, "..");
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".avif", ".heic", ".heif"]);

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

function sha256(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(file);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function humanizeFilename(file) {
  return path.basename(file, path.extname(file)).replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function parseExifDate(exif) {
  if (!exif) return null;
  const text = exif.toString("latin1");
  const match = text.match(/(?:19|20)\d{2}:[01]\d:[0-3]\d[ T][0-2]\d:[0-5]\d:[0-5]\d/);
  if (!match) return null;
  return match[0].replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3").replace(" ", "T");
}

function readManifests(contentRoot) {
  return walk(contentRoot)
    .filter((file) => path.basename(file) === "images.json")
    .map((file) => ({ file, data: JSON.parse(fs.readFileSync(file, "utf8")) }));
}

function assetIndex(manifests) {
  const index = new Map();
  for (const { data } of manifests) {
    for (const image of data.images || []) {
      if (image.hash && image.src && image.thumbnailSrc) index.set(image.hash, image);
    }
  }
  return index;
}

function resolveSourceDirectory(input, projectRoot) {
  if (!input) throw new Error("Usage: npm run images:import -- content/<post-slug>/source-photos");
  const direct = path.resolve(projectRoot, input);
  const insideFrontend = path.resolve(projectRoot, "next-frontend", input);
  const sourceDirectory = fs.existsSync(direct) ? direct : insideFrontend;
  if (!fs.existsSync(sourceDirectory) || !fs.statSync(sourceDirectory).isDirectory()) {
    throw new Error(`Source photo directory was not found: ${input}`);
  }
  return sourceDirectory;
}

async function createAsset(file, hash, publicRoot) {
  const assetDirectory = path.join(publicRoot, "images", "library");
  const webFile = path.join(assetDirectory, `${hash}.webp`);
  const thumbnailFile = path.join(assetDirectory, `${hash}-thumb.webp`);
  fs.mkdirSync(assetDirectory, { recursive: true });

  if (!fs.existsSync(webFile)) {
    await sharp(file).rotate().resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toFile(webFile);
  }
  if (!fs.existsSync(thumbnailFile)) {
    await sharp(file).rotate().resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).webp({ quality: 76 }).toFile(thumbnailFile);
  }

  const metadata = await sharp(webFile).metadata();
  const originalMetadata = await sharp(file).metadata();
  const blurBuffer = await sharp(file).rotate().resize({ width: 20, height: 20, fit: "inside" }).webp({ quality: 35 }).toBuffer();
  const width = metadata.width;
  const height = metadata.height;
  if (!width || !height) throw new Error(`Could not determine processed dimensions for ${file}`);

  return {
    hash,
    src: `/images/library/${hash}.webp`,
    thumbnailSrc: `/images/library/${hash}-thumb.webp`,
    width,
    height,
    aspectRatio: Number((width / height).toFixed(6)),
    blurDataURL: `data:image/webp;base64,${blurBuffer.toString("base64")}`,
    capturedAt: parseExifDate(originalMetadata.exif),
  };
}

async function importImages(sourceInput, options = {}) {
  const projectRoot = options.projectRoot || defaultProjectRoot;
  const contentRoot = path.join(projectRoot, "next-frontend", "content");
  const publicRoot = path.join(projectRoot, "next-frontend", "public");
  const sourceDirectory = resolveSourceDirectory(sourceInput, projectRoot);
  const postDirectory = path.dirname(sourceDirectory);
  const slug = path.basename(postDirectory);
  const manifestFile = path.join(postDirectory, "images.json");

  if (!postDirectory.startsWith(`${contentRoot}${path.sep}`)) {
    throw new Error(`Source photos must be inside ${toPosix(path.relative(projectRoot, contentRoot))}/<post-slug>/source-photos.`);
  }

  const previous = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, "utf8")) : { version: 1, post: slug, images: [] };
  const previousByHash = new Map((previous.images || []).map((image) => [image.hash, image]));
  const sharedByHash = assetIndex(readManifests(contentRoot));
  const sourceFiles = walk(sourceDirectory).filter((file) => supportedExtensions.has(path.extname(file).toLowerCase())).sort();
  const images = [];
  let created = 0;
  let reused = 0;
  let duplicateInputs = 0;

  for (const file of sourceFiles) {
    const hash = await sha256(file);
    if (images.some((image) => image.hash === hash)) {
      duplicateInputs += 1;
      continue;
    }

    const existing = previousByHash.get(hash) || sharedByHash.get(hash);
    let asset = existing;
    const filesExist = existing && fs.existsSync(path.join(publicRoot, existing.src.replace(/^\//, ""))) && fs.existsSync(path.join(publicRoot, existing.thumbnailSrc.replace(/^\//, "")));
    if (!filesExist) {
      asset = await createAsset(file, hash, publicRoot);
      created += 1;
    } else {
      reused += 1;
    }

    const previousEntry = previousByHash.get(hash);
    images.push({
      ...asset,
      id: previousEntry?.id || `${humanizeFilename(file).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "photo"}-${hash.slice(0, 8)}`,
      sourceName: path.basename(file),
      alt: previousEntry?.alt || "",
      caption: previousEntry?.caption || "",
    });
  }

  const manifestContentChanged = previous.version !== 1 || previous.post !== slug || JSON.stringify(previous.images || []) !== JSON.stringify(images);
  const manifest = { version: 1, post: slug, generatedAt: manifestContentChanged ? new Date().toISOString() : previous.generatedAt, images };
  if (manifestContentChanged || !fs.existsSync(manifestFile)) {
    fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  return { manifestFile, manifestUpdated: manifestContentChanged, sourceCount: sourceFiles.length, imageCount: images.length, created, reused, duplicateInputs };
}

function findOrphans(projectRoot = defaultProjectRoot) {
  const contentRoot = path.join(projectRoot, "next-frontend", "content");
  const libraryRoot = path.join(projectRoot, "next-frontend", "public", "images", "library");
  const referenced = new Set();
  for (const { data } of readManifests(contentRoot)) {
    for (const image of data.images || []) {
      if (image.src) referenced.add(path.basename(image.src));
      if (image.thumbnailSrc) referenced.add(path.basename(image.thumbnailSrc));
    }
  }
  return walk(libraryRoot).filter((file) => !referenced.has(path.basename(file)));
}

async function main() {
  if (process.argv.includes("--orphans")) {
    const orphans = findOrphans();
    console.log(`${orphans.length} unreferenced generated image${orphans.length === 1 ? "" : "s"}.`);
    for (const file of orphans) console.log(toPosix(path.relative(defaultProjectRoot, file)));
    console.log("No files were deleted.");
    return;
  }

  const result = await importImages(process.argv[2]);
  console.log(`Scanned ${result.sourceCount} source photo${result.sourceCount === 1 ? "" : "s"}.`);
  console.log(`Manifest contains ${result.imageCount} unique image${result.imageCount === 1 ? "" : "s"}: ${result.created} processed, ${result.reused} reused, ${result.duplicateInputs} duplicate input${result.duplicateInputs === 1 ? "" : "s"} skipped.`);
  console.log(`${result.manifestUpdated ? "Updated" : "No changes to"} ${toPosix(path.relative(defaultProjectRoot, result.manifestFile))}.`);
  console.log("Add meaningful alt text in images.json before publishing.");
  const orphans = findOrphans();
  console.log(`${orphans.length} generated image${orphans.length === 1 ? " is" : "s are"} currently unreferenced; run npm run images:orphans to list them.`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { findOrphans, importImages, parseExifDate };
