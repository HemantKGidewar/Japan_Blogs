const GhostAdminAPI = require('@tryghost/admin-api');
const path = require('path');
const { loadLocalEnv, requireEnv } = require('./scripts/load-env');

loadLocalEnv(__dirname);

const api = new GhostAdminAPI({
  url: process.env.GHOST_URL || 'http://localhost:2368',
  key: requireEnv('GHOST_ADMIN_API_KEY'),
  version: 'v5.0'
});

async function main() {
  try {
    const imagePath = process.argv[2];
    if (!imagePath) throw new Error('Usage: node generate_post_template.js /absolute/path/to/cover-image');
    const resolvedImagePath = path.resolve(imagePath);
    console.log('Uploading image...');
    const uploadedImage = await api.images.upload({
      file: resolvedImagePath,
      purpose: 'image'
    });

    console.log('Creating post...');
    const htmlContent = `
      <p>I moved to 3 different houses in Japan during my time there, and each neighborhood had its own completely unique sakura scenery. This is a look back at those memories.</p>
      
      <h2>1. The First House</h2>
      <p><em>Spring 2023. The sakura here were vibrant, creating a beautiful canopy over my daily commute.</em></p>
      <figure class="kg-card kg-image-card">
        <img src="${uploadedImage.url}" class="kg-image" alt="Sakura at House 1">
        <figcaption>Replace this image with your photo from your first house.</figcaption>
      </figure>
      <p>Describe your specific memories of this location here. What was the vibe? How did it feel walking past these trees every morning?</p>
      <hr>

      <h2>2. The Second House</h2>
      <p><em>Spring 2024. A much quieter neighborhood where the petals fell onto narrow, ancient stone paths.</em></p>
      <figure class="kg-card kg-image-card">
        <img src="${uploadedImage.url}" class="kg-image" alt="Sakura at House 2">
        <figcaption>Replace this image with your photo from your second house.</figcaption>
      </figure>
      <p>Describe your specific memories of the second location here...</p>
      <hr>

      <h2>3. The Final House</h2>
      <p><em>Spring 2025. The air was still crisp, but the sudden burst of pink flowers brought warmth to the quiet streets.</em></p>
      <figure class="kg-card kg-image-card">
        <img src="${uploadedImage.url}" class="kg-image" alt="Sakura at House 3">
        <figcaption>Replace this image with your photo from your third house.</figcaption>
      </figure>
      <p>Describe your specific memories of the final location here...</p>
    `;

    const post = await api.posts.add({
      title: 'Sakura Near My Houses',
      html: htmlContent,
      status: 'published',
      feature_image: uploadedImage.url,
      tags: [{name: 'Nature'}, {name: 'Sakura'}]
    }, {source: 'html'});

    console.log(`Success! Post created with ID: ${post.id}`);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
