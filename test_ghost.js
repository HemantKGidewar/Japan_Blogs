const GhostAdminAPI = require('@tryghost/admin-api');
const { loadLocalEnv, requireEnv } = require('./scripts/load-env');

loadLocalEnv(__dirname);
const api = new GhostAdminAPI({
  url: process.env.GHOST_URL || 'http://localhost:2368',
  key: requireEnv('GHOST_ADMIN_API_KEY'),
  version: 'v5.0'
});
async function main() {
  const posts = await api.posts.browse({ filter: 'slug:sakura-near-my-houses' });
  console.log(posts[0].html);
}
main();
