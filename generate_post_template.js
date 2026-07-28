const GhostAdminAPI = require('@tryghost/admin-api');

const api = new GhostAdminAPI({
  url: 'http://localhost:2368',
  key: '69fc8a1c2ecf43317728f870:300e1004b4ca9f031a5854d0951d6334399ef66a6d2e68bf290dcb089d89b621',
  version: 'v5.0'
});

async function main() {
  try {
    const imagePath = '/Users/hemantkumargidewar/.gemini/antigravity/brain/ee6bbede-4e9e-4c72-8fbc-8f0946701ca8/sakura_dummy_1778219942580.png';
    console.log('Uploading image...');
    const uploadedImage = await api.images.upload({
      file: imagePath,
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
