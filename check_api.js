const GhostContentAPI = require('@tryghost/content-api');

const api = new GhostContentAPI({
  url: 'http://localhost:2368',
  key: '22fdfffaebd3321258e71c3a3a', // From .env.local
  version: "v5.0"
});

async function main() {
  const post = await api.posts.read(
    { slug: 'sakura-near-my-houses' }
  );
  console.log(post.html);
}

main().catch(console.error);
