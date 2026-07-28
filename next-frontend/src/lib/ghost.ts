// @ts-ignore
import ghostData from './ghost-data.json';

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
    const posts = ghostData as any[];
    
    return posts.map(post => {
      if (post.feature_image) {
        post.feature_image = post.feature_image
          .replace(/http:\/\/localhost:2368\/content\/images\//, '/images/')
          .replace(/\.(jpg|jpeg|png|PNG|JPG|JPEG)$/i, '.webp');
      }
      return post;
    });
  } catch (err) {
    console.warn("Error reading posts from ghost-data.json:", err);
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  const posts = ghostData as any[];
  const post = posts.find(p => p.slug === slug);
  
  if (!post) return null;
  
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
