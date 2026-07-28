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

async function fetchAndSavePosts() {
  console.log('Fetching posts from local Ghost API...');
  try {
    const envPath = path.join(__dirname, 'env.json');
    let apiKey = '22fdfffaebd3321258e71c3a3a'; // Fallback
    if (fs.existsSync(envPath)) {
      const envData = JSON.parse(fs.readFileSync(envPath, 'utf8'));
      apiKey = envData.CONTENT_API_KEY || apiKey;
    }

    const url = `http://localhost:2368/ghost/api/content/posts/?key=${apiKey}&include=tags,authors&limit=all`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Save to Next.js src/lib directory
    const destDir = path.join(__dirname, 'next-frontend', 'src', 'lib');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const destFile = path.join(destDir, 'ghost-data.json');
    fs.writeFileSync(destFile, JSON.stringify(data.posts, null, 2));
    console.log(`Successfully saved ${data.posts.length} posts to ${destFile}`);
  } catch (error) {
    console.error('Error fetching posts from Ghost:', error);
  }
}

async function main() {
  console.log('Starting Sync Pipeline...');
  if (!fs.existsSync(nextImagesDir)) {
    fs.mkdirSync(nextImagesDir, { recursive: true });
  }
  
  // 1. Sync Images
  console.log('Syncing images...');
  await processDirectory(ghostImagesDir);
  
  // 2. Fetch and Cache Posts Data
  await fetchAndSavePosts();
  
  console.log('Pipeline complete.');
}

main();
