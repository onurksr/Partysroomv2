const assert = require('node:assert/strict');
delete process.env.TMDB_API_KEY;
delete process.env.TMDB_READ_ACCESS_TOKEN;
const media = require('../data/media');
(async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => { throw new Error('No-key mode must not use weak unverified search matches'); };
  try {
    const frames = await media.resolveFilm({ id: 'no-key-film', title: 'Known Movie', en: 'Known Movie', year: 2021 });
    assert.equal(frames, null, 'Güvenilir eşleşme yoksa yanlış film karesi gösterilmemeli');
    console.log('Film strict fallback test passed without TMDB_API_KEY.');
  } finally { global.fetch = originalFetch; }
})().catch(err => { console.error(err); process.exitCode = 1; });
