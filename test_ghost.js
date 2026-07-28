const GhostAdminAPI = require('@tryghost/admin-api');
const api = new GhostAdminAPI({
  url: 'http://localhost:2368',
  key: '69fc8a1c2ecf43317728f870:300e1004b4ca9f031a5854d0951d6334399ef66a6d2e68bf290dcb089d89b621',
  version: 'v5.0'
});
async function main() {
  const posts = await api.posts.browse({ filter: 'slug:sakura-near-my-houses' });
  console.log(posts[0].html);
}
main();
