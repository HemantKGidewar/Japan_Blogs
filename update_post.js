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
  const photosRoot = requireEnv('SAKURA_PHOTOS_DIR');
  const photo = (...segments) => path.join(photosRoot, ...segments);
  const images = {
    // Yoga
    cover: photo('Yoga', 'IMG_0633.jpeg'),
    tree1: photo('Yoga', 'IMG_0665.jpeg'),
    tree2: photo('Yoga', 'IMG_0632.jpeg'),
    tree3: photo('Yoga', 'IMG_0727.jpeg'),
    me: photo('Yoga', 'IMG_0623.jpeg'),
    friends: photo('Yoga', 'IMG_0635.jpeg'),
    // Naruse
    naruse1: photo('Naruse', '20240412_075352.jpg'),
    naruse2: photo('Naruse', '20240412_080507.jpg'),
    naruse3: photo('Naruse', '20240412_080859.jpg'),
    naruse4: photo('Naruse', 'IMG_5728.JPG'),
    naruse5: photo('Naruse', 'IMG_5737.JPG'),
    naruse6: photo('Naruse', 'IMG_5738.JPG'),
    naruse7: photo('Naruse', '20240412_080632.jpg'),
    naruse8: photo('Naruse', '20240412_081519.jpg'),
    naruse9: photo('Naruse', '20240412_081504.jpg'),
    // Nakayama
    nakayama1: photo('Nakayama', '20260405_133523.jpg'),
    nakayama2: photo('Nakayama', 'IMG_1632.JPG'),
    nakayama3: photo('Nakayama', 'IMG_1703.JPG'),
    nakayama4: photo('Nakayama', 'IMG_9016.JPG'),
    nakayama5: photo('Nakayama', 'IMG_9029.JPG'),
    nakayama6: photo('Nakayama', 'IMG_9031.JPG'),
    nakayama7: photo('Nakayama', 'IMG_9051.JPG'),
    nakayama8: photo('Nakayama', 'Image.jpeg'),
    nakayama9: photo('Nakayama', 'IMG_9042.JPG'),
  };

  const dates = {
    nakayama1: 'April 5, 2026 • 5:05 PM',
    nakayama2: 'April 5, 2026 • 5:07 PM',
    nakayama3: 'April 6, 2026 • 1:09 PM',
    nakayama4: 'April 5, 2025 • 6:17 PM', // Friends
    nakayama5: 'April 5, 2025 • 6:22 PM',
    nakayama6: 'April 5, 2025 • 6:27 PM', // Me
    nakayama7: 'April 5, 2025 • 6:50 PM',
    nakayama8: 'April 5, 2025',
    nakayama9: 'April 5, 2025 • 6:31 PM',
  };

  const uploaded = {};

  for (const [key, path] of Object.entries(images)) {
    console.log(`Uploading ${key}...`);
    try {
      const result = await api.images.upload({ file: path, purpose: 'image' });
      uploaded[key] = result.url;
    } catch (e) {
      console.error(`Failed to upload ${key}`, e);
      return;
    }
  }

  // Get the post
  console.log("Fetching post...");
  const posts = await api.posts.browse({ filter: 'slug:sakura-near-my-houses' });
  if (posts.length === 0) {
    console.log("Post not found!");
    return;
  }
  const post = posts[0];

  function imgWithDate(url, dateStr, extraStyles = '') {
    return `
    <div style="position: relative; width: 100%; height: 100%;">
      <img src="${url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.75rem; ${extraStyles}" alt="Nakayama Photo">
      <div style="position: absolute; bottom: 0.75rem; left: 0.75rem; background: rgba(0,0,0,0.6); color: white; padding: 0.25rem 0.6rem; border-radius: 0.375rem; font-size: 0.8rem; font-weight: 500; font-family: sans-serif; letter-spacing: 0.025em; backdrop-filter: blur(4px);">
        ${dateStr}
      </div>
    </div>`;
  }

  const htmlContent = `
    <p>I moved to 3 different houses in Japan during my time there, and each neighborhood had its own completely unique sakura scenery. This is a look back at those memories.</p>
    
    <hr>
    
    <h1>I. Yoga <span>| March 25, 2023</span></h1>
    <p><em>The sakura here were vibrant, creating a beautiful canopy over my daily commute. A much quieter neighborhood where the petals fell onto narrow, ancient stone paths.</em></p>
    
    <!--kg-card-begin: html-->
    <div style="margin: 2rem 0; display: flex; flex-direction: column; gap: 0.75rem;">
      <div style="width: 100%;">
        <img src="${uploaded.tree1}" style="width: 100%; border-radius: 0.75rem; object-fit: cover; aspect-ratio: 16/9;" alt="Sakura Tree 1">
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <img src="${uploaded.tree2}" style="width: 100%; border-radius: 0.75rem; object-fit: cover; aspect-ratio: 4/3;" alt="Sakura Tree 2">
        <img src="${uploaded.tree3}" style="width: 100%; border-radius: 0.75rem; object-fit: cover; aspect-ratio: 4/3;" alt="Sakura Tree 3">
      </div>
      <p style="text-align: center; font-size: 0.875rem; color: #9ca3af; margin-top: 0.25rem; font-style: italic;">The beautiful canopy and petals along the stone paths.</p>
    </div>
    <!--kg-card-end: html-->

    <h2>Friends & Me</h2>
    <p><em>Taking a moment to appreciate the breathtaking view and enjoying the spring breeze under the blooming flowers. A memory I'll always cherish.</em></p>
    <!--kg-card-begin: html-->
    <div style="margin: 2rem 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
      <img src="${uploaded.me}" style="width: 100%; border-radius: 0.75rem; object-fit: cover; aspect-ratio: 4/3;" alt="Me in the Sakura">
      <img src="${uploaded.friends}" style="width: 100%; border-radius: 0.75rem; object-fit: cover; aspect-ratio: 4/3;" alt="Friends in the Sakura">
    </div>
    <!--kg-card-end: html-->

    <hr>
    
    <h1>II. Naruse <span>| April 12, 2024</span></h1>
    <p><em>The ancient stone paths and quiet neighborhood of Naruse.</em></p>
    
    <!--kg-card-begin: html-->
    <div style="margin: 2rem 0;">
      <!-- Block 1: Asymmetrical Grid -->
      <div style="display: grid; grid-template-columns: 60% calc(40% - 0.75rem); gap: 0.75rem; margin-bottom: 0.75rem;">
        <div style="grid-row: span 2;">
          <img src="${uploaded.naruse5}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.75rem;" alt="Naruse large left">
        </div>
        <div>
          <img src="${uploaded.naruse4}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.75rem; aspect-ratio: 4/3;" alt="Naruse right top">
        </div>
        <div>
          <img src="${uploaded.naruse7}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.75rem; aspect-ratio: 4/3;" alt="Naruse right bottom">
        </div>
      </div>

      <!-- Block 2: Full width horizontal -->
      <div style="margin-bottom: 0.75rem;">
        <img src="${uploaded.naruse3}" style="width: 100%; border-radius: 0.75rem; object-fit: cover;" alt="Naruse full width horizontal">
      </div>

      <!-- Block 3: Side-by-side -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
        <div>
          <img src="${uploaded.naruse1}" style="width: 100%; border-radius: 0.75rem; object-fit: cover; aspect-ratio: 4/3;" alt="Naruse small side 1">
        </div>
        <div>
          <img src="${uploaded.naruse6}" style="width: 100%; border-radius: 0.75rem; object-fit: cover; aspect-ratio: 4/3;" alt="Naruse small side 2">
        </div>
      </div>

      <!-- Block 4: Massive Full-width -->
      <div style="margin-bottom: 0.75rem;">
        <img src="${uploaded.naruse8}" style="width: 100%; height: auto; border-radius: 0.75rem; object-fit: contain;" alt="Naruse massive full width preserved ratio">
      </div>

      <!-- Block 5: Side-by-side -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
        <div>
          <img src="${uploaded.naruse2}" style="width: 100%; border-radius: 0.75rem; object-fit: cover; aspect-ratio: 3/4;" alt="Naruse small side 3">
        </div>
        <div>
          <img src="${uploaded.naruse9}" style="width: 100%; border-radius: 0.75rem; object-fit: cover; aspect-ratio: 3/4;" alt="Naruse new image side">
        </div>
      </div>
    </div>
    <!--kg-card-end: html-->
    
    <hr>
    
    <h1>III. Nakayama <span>| Spring 2025</span></h1>
    <p><em>The crisp spring air and sudden burst of pink flowers in Nakayama.</em></p>
    
    <!--kg-card-begin: html-->
    <div style="margin: 2rem 0; display: flex; flex-direction: column; gap: 0.75rem;">
      <!-- Block 1: 133523 Full Width -->
      <div style="width: 100%; aspect-ratio: 16/9;">
        ${imgWithDate(uploaded.nakayama1, dates.nakayama1)}
      </div>
      
      <!-- Block 2: 1632 & 1703 Side-by-side -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; aspect-ratio: 2/1;">
        ${imgWithDate(uploaded.nakayama2, dates.nakayama2)}
        ${imgWithDate(uploaded.nakayama3, dates.nakayama3)}
      </div>
      
      <!-- Block 3: 9029 Full Width -->
      <div style="width: 100%; aspect-ratio: 16/9;">
        ${imgWithDate(uploaded.nakayama5, dates.nakayama5)}
      </div>
      
      <!-- Block 4: Crop for Size Grid (9051 is bigger) -->
      <div style="display: flex; gap: 0.75rem; width: 100%; align-items: stretch;">
        <!-- Left Col: Image.jpeg (Determines Height) -->
        <div style="flex: 0 0 calc(40% - 0.375rem);">
          ${imgWithDate(uploaded.nakayama8, dates.nakayama8, 'height: 100%; aspect-ratio: unset; object-fit: contain;')}
        </div>
        
        <!-- Right Col: Stacked, taking up 100% of left column's height -->
        <div style="flex: 0 0 calc(60% - 0.375rem); display: flex; flex-direction: column; gap: 0.75rem;">
          <!-- 9051 (Bigger - Flex 1.5) -->
          <div style="flex: 1.5; position: relative;">
            <div style="position: absolute; inset: 0;">
              ${imgWithDate(uploaded.nakayama7, dates.nakayama7, 'height: 100%; width: 100%; aspect-ratio: unset; object-fit: cover; position: absolute; inset: 0;')}
            </div>
          </div>
          <!-- 9042 (Smaller - Flex 1) -->
          <div style="flex: 1; position: relative;">
            <div style="position: absolute; inset: 0;">
              ${imgWithDate(uploaded.nakayama9, dates.nakayama9, 'height: 100%; width: 100%; aspect-ratio: unset; object-fit: cover; position: absolute; inset: 0;')}
            </div>
          </div>
        </div>
      </div>
      
      <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Friends & Me</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; aspect-ratio: 2/1;">
        ${imgWithDate(uploaded.nakayama4, dates.nakayama4)}
        ${imgWithDate(uploaded.nakayama6, dates.nakayama6)}
      </div>
    </div>
    <!--kg-card-end: html-->
  `;

  console.log("Updating post...");
  const updatedPost = await api.posts.edit({
    id: post.id,
    updated_at: post.updated_at,
    feature_image: uploaded.cover,
    html: htmlContent
  }, { source: 'html' });

  console.log('Post updated successfully!');
}

main().catch(console.error);
