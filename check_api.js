const GhostContentAPI = require('@tryghost/content-api');
const { loadLocalEnv, requireEnv } = require('./scripts/load-env');

loadLocalEnv(__dirname);

const api = new GhostContentAPI({
  url: process.env.GHOST_URL || 'http://localhost:2368',
  key: requireEnv('GHOST_CONTENT_API_KEY'),
  version: "v5.0"
});

async function main() {
  const post = await api.posts.read(
    { slug: 'sakura-near-my-houses' }
  );
  console.log(post.html);
}

main().catch(console.error);
