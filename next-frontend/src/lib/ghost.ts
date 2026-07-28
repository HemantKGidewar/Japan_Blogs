import GhostContentAPI from '@tryghost/content-api';

const api = new GhostContentAPI({
  url: process.env.NEXT_PUBLIC_GHOST_URL || process.env.GHOST_URL || 'http://localhost:2368',
  key: process.env.NEXT_PUBLIC_GHOST_CONTENT_API_KEY || process.env.GHOST_CONTENT_API_KEY || '',
  version: "v5.0"
});

/**
 * Replaces localhost Ghost URLs with relative Next.js paths, 
 * and changes image extensions to .webp to match the sync.js pipeline.
 */
function rewriteImageUrls(html: string | null) {
  if (!html) return html;
  
  // Replace absolute ghost url with /images/
  let processed = html.replace(/http:\/\/localhost:2368\/content\/images\//g, '/images/');
  
  // Replace .jpg, .jpeg, .png with .webp
  processed = processed.replace(/(\/images\/[^"]+)\.(jpg|jpeg|png|PNG|JPG|JPEG)/gi, '$1.webp');
  
  return processed;
}

export async function getPosts() {
  try {
    const posts = await api.posts.browse({
      limit: 'all',
      include: ['tags', 'authors']
    });
    
    return posts.map(post => {
      if (post.feature_image) {
        post.feature_image = post.feature_image
          .replace(/http:\/\/localhost:2368\/content\/images\//, '/images/')
          .replace(/\.(jpg|jpeg|png|PNG|JPG|JPEG)$/i, '.webp');
      }
      return post;
    });
  } catch (err) {
    console.warn("Ghost API Error fetching posts:", err);
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  const post = await api.posts.read(
    { slug },
    { include: ['tags', 'authors'] }
  );
  
  if (post.html) {
    post.html = rewriteImageUrls(post.html);
  }
  if (post.feature_image) {
    post.feature_image = post.feature_image
      .replace(/http:\/\/localhost:2368\/content\/images\//, '/images/')
      .replace(/\.(jpg|jpeg|png|PNG|JPG|JPEG)$/i, '.webp');
  }
  
  return post;
}
