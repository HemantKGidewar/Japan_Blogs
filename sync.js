const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ghostImagesDir = path.join(__dirname, 'ghost-cms', 'content', 'images');
const nextImagesDir = path.join(__dirname, 'next-frontend', 'public', 'images');

async function processDirectory(currentDir, relativePath = '') {
  if (!fs.existsSync(currentDir)) {
    console.log(`Directory does not exist: ${currentDir}`);
    return;
  }

  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    const entryRelativePath = path.join(relativePath, entry.name);

    // Ignore size directories that Ghost creates for themes
    if (entry.isDirectory()) {
      if (entry.name === 'size') continue;

      const destDir = path.join(nextImagesDir, entryRelativePath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      await processDirectory(fullPath, entryRelativePath);
    } else {
      if (entry.name.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
        const parsedPath = path.parse(entryRelativePath);
        const webpRelativePath = path.join(parsedPath.dir, `${parsedPath.name}.webp`);
        const destPath = path.join(nextImagesDir, webpRelativePath);

        // Skip if destination already exists to save build time
        if (!fs.existsSync(destPath)) {
          console.log(`Compressing: ${entryRelativePath} -> ${webpRelativePath}`);
          try {
            await sharp(fullPath)
              .resize({ width: 1920, withoutEnlargement: true })
              .webp({ quality: 80 })
              .toFile(destPath);
          } catch (error) {
            console.error(`Failed to process ${fullPath}:`, error);
          }
        }
      }
    }
  }
}

async function main() {
  console.log('Starting Image Sync & Compression Pipeline...');
  if (!fs.existsSync(nextImagesDir)) {
    fs.mkdirSync(nextImagesDir, { recursive: true });
  }
  await processDirectory(ghostImagesDir);
  console.log('Pipeline complete.');
}

main();
