const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const projectRoot = __dirname;
const ghostImagesDir = path.join(projectRoot, 'ghost-cms', 'content', 'images');
const nextImagesDir = path.join(projectRoot, 'next-frontend', 'public', 'images');
const postsFile = path.join(projectRoot, 'next-frontend', 'src', 'lib', 'ghost-data.json');

function readConfig() {
  const envPath = path.join(projectRoot, 'env.json');
  const defaults = {
    GHOST_URL: 'http://localhost:2368',
  };

  const config = fs.existsSync(envPath)
    ? { ...defaults, ...JSON.parse(fs.readFileSync(envPath, 'utf8')) }
    : defaults;
  if (!config.CONTENT_API_KEY) {
    throw new Error('CONTENT_API_KEY is required in env.json to sync posts from Ghost.');
  }
  return config;
}

function visitStrings(value, callback) {
  if (typeof value === 'string') {
    callback(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => visitStrings(item, callback));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => visitStrings(item, callback));
  }
}

function replaceStrings(value, replacements) {
  if (typeof value === 'string') {
    let result = value;
    for (const [from, to] of replacements) result = result.split(from).join(to);
    return result;
  }
  if (Array.isArray(value)) return value.map((item) => replaceStrings(item, replacements));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceStrings(item, replacements)])
    );
  }
  return value;
}

function collectLocalImageUrls(posts, ghostUrl) {
  const urls = new Set();
  const base = ghostUrl.replace(/\/$/, '');
  const prefix = `${base}/content/images/`;

  visitStrings(posts, (value) => {
    let start = 0;
    while ((start = value.indexOf(prefix, start)) !== -1) {
      const remainder = value.slice(start);
      const match = remainder.match(/^[^"'\s<>)?]+/);
      if (!match) break;
      const url = match[0];
      if (/\.(jpe?g|png|webp|avif)$/i.test(url)) urls.add(url);
      start += url.length;
    }
  });

  return [...urls].sort();
}

function safeSourcePath(relativePath) {
  const source = path.resolve(ghostImagesDir, relativePath);
  const root = `${path.resolve(ghostImagesDir)}${path.sep}`;
  if (!source.startsWith(root)) {
    throw new Error(`Refusing to read an image outside Ghost's image directory: ${relativePath}`);
  }
  return source;
}

async function syncReferencedImages(posts, ghostUrl) {
  const base = ghostUrl.replace(/\/$/, '');
  const prefix = `${base}/content/images/`;
  const urls = collectLocalImageUrls(posts, base);
  const outputByHash = new Map();
  const replacements = new Map();
  let written = 0;
  let reused = 0;

  fs.mkdirSync(nextImagesDir, { recursive: true });

  for (const imageUrl of urls) {
    const relativeSource = decodeURIComponent(imageUrl.slice(prefix.length));
    const source = safeSourcePath(relativeSource);
    if (!fs.existsSync(source)) throw new Error(`Referenced Ghost image is missing: ${source}`);

    const parsed = path.parse(relativeSource);
    const relativeOutput = path.join(parsed.dir, `${parsed.name}.webp`);
    const destination = path.join(nextImagesDir, relativeOutput);
    const sourceIsOlder = fs.existsSync(destination)
      && fs.statSync(source).mtimeMs <= fs.statSync(destination).mtimeMs;
    const output = sourceIsOlder
      ? fs.readFileSync(destination)
      : await sharp(source)
          .rotate()
          .resize({ width: 1920, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
    const hash = crypto.createHash('sha256').update(output).digest('hex');
    const canonicalOutput = outputByHash.get(hash);

    if (canonicalOutput) {
      const canonicalUrl = `${prefix}${canonicalOutput.split(path.sep).join('/')}`;
      replacements.set(imageUrl, canonicalUrl);
      reused += 1;
      continue;
    }

    outputByHash.set(hash, relativeOutput);
    if (!sourceIsOlder) {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, output);
      written += 1;
    }
  }

  console.log(`Referenced images: ${urls.length}; generated: ${written}; duplicate references reused: ${reused}.`);
  return replaceStrings(posts, replacements);
}

async function fetchPosts(config) {
  console.log('Fetching published posts from the local Ghost API...');
  const base = config.GHOST_URL.replace(/\/$/, '');
  const url = `${base}/ghost/api/content/posts/?key=${encodeURIComponent(config.CONTENT_API_KEY)}&include=tags,authors&limit=all`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Ghost Content API returned ${response.status} ${response.statusText}`);
  const data = await response.json();
  return data.posts;
}

async function main() {
  console.log('Starting sync pipeline...');
  const config = readConfig();
  const posts = await fetchPosts(config);
  const normalizedPosts = await syncReferencedImages(posts, config.GHOST_URL);

  fs.mkdirSync(path.dirname(postsFile), { recursive: true });
  fs.writeFileSync(postsFile, JSON.stringify(normalizedPosts, null, 2));
  console.log(`Saved ${normalizedPosts.length} posts to ${postsFile}`);
  console.log('Sync pipeline complete.');
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Sync pipeline failed:', error);
    process.exitCode = 1;
  });
}

module.exports = { collectLocalImageUrls, replaceStrings, syncReferencedImages };
