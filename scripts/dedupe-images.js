const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const imagesRoot = path.join(projectRoot, 'next-frontend', 'public', 'images');
const contentFile = path.join(projectRoot, 'next-frontend', 'src', 'lib', 'ghost-data.json');
const shouldApply = process.argv.includes('--apply');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

function hashFile(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function referencedImages() {
  const content = fs.readFileSync(contentFile, 'utf8');
  const references = new Set();
  const pattern = /(?:http:\/\/localhost:2368\/content\/images\/|\/images\/)([^"'\\s<>)?]+)/gi;

  for (const match of content.matchAll(pattern)) {
    const relativePath = decodeURIComponent(match[1])
      .replace(/\\/g, '/')
      .replace(/\.(jpe?g|png)$/i, '.webp');
    references.add(relativePath);
  }

  return references;
}

if (!fs.existsSync(imagesRoot) || !fs.statSync(imagesRoot).isDirectory()) {
  throw new Error(`Expected image directory was not found: ${imagesRoot}`);
}

const referenced = referencedImages();
const files = walk(imagesRoot).filter((file) => fs.statSync(file).isFile());
const groups = new Map();

for (const file of files) {
  const hash = hashFile(file);
  const group = groups.get(hash) || [];
  group.push(file);
  groups.set(hash, group);
}

const removals = [];
let duplicateGroups = 0;

for (const group of groups.values()) {
  if (group.length < 2) continue;
  duplicateGroups += 1;

  const sorted = group.sort((left, right) => {
    const leftRelative = path.relative(imagesRoot, left).split(path.sep).join('/');
    const rightRelative = path.relative(imagesRoot, right).split(path.sep).join('/');
    const leftReferenced = referenced.has(leftRelative);
    const rightReferenced = referenced.has(rightRelative);

    if (leftReferenced !== rightReferenced) return leftReferenced ? -1 : 1;
    return leftRelative.length - rightRelative.length || leftRelative.localeCompare(rightRelative);
  });

  // Keep every referenced filename. Otherwise keep one deterministic canonical copy.
  const referencedInGroup = sorted.filter((file) => {
    const relative = path.relative(imagesRoot, file).split(path.sep).join('/');
    return referenced.has(relative);
  });
  const keep = new Set(referencedInGroup.length > 0 ? referencedInGroup : [sorted[0]]);

  for (const file of sorted) {
    if (!keep.has(file)) removals.push(file);
  }
}

const bytes = removals.reduce((total, file) => total + fs.statSync(file).size, 0);

console.log(`${shouldApply ? 'Removing' : 'Would remove'} ${removals.length} duplicate files from ${duplicateGroups} groups.`);
console.log(`Recoverable space: ${(bytes / 1024 / 1024).toFixed(1)} MiB.`);
console.log(`${referenced.size} content image references are protected.`);

if (!shouldApply) {
  console.log('Dry run only. Re-run with --apply to remove the duplicates.');
  process.exit(0);
}

for (const file of removals) {
  const relative = path.relative(imagesRoot, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to remove a file outside the image directory: ${file}`);
  }
  fs.unlinkSync(file);
}

console.log('Duplicate image removal complete.');
