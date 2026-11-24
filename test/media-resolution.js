const assert = require('node:assert/strict');
process.env.TMDB_API_KEY = 'test-key';
const media = require('../data/media');

(async () => {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async input => {
    const url = String(input);
    calls.push(url);
    if (url.includes('commons.wikimedia.org/w/api.php')) {
      return { ok: true, json: async () => ({ query: { pages: { 1: { title: 'File:Test Film - Scene still.jpg', imageinfo: [{ thumburl: 'https://upload.wikimedia.org/test-film-scene.jpg' }] } } } }) };
    }
    if (url.includes('/search/movie')) return { ok: true, json: async () => url.includes('Search%20Fixture') || url.includes('Search+Fixture') ? ({ results: [{ id: 456, title: 'Search Fixture', original_title: 'Search Fixture', release_date: '2021-01-01', backdrop_path: '/search-fixture.jpg' }] }) : ({ results: [] }) };
    if (url.includes('/movie/456/images')) return { ok: true, json: async () => ({ backdrops: [] }) };
    if (url.includes('/movie/123/images')) {
      return { ok: true, json: async () => ({ backdrops: [
        { file_path: '/scene-one.jpg', width: 1920, height: 1080, aspect_ratio: 1.78, iso_639_1: null, vote_count: 2 }
      ] }) };
    }
    if (url.includes('itunes.apple.com/search')) {
      return { ok: true, json: async () => ({ results: [
        { trackName: 'Bad Guy', artistName: 'Billie Eilish', previewUrl: 'https://audio.example/bad-guy.m4a' }
      ] }) };
    }
    throw new Error('Unexpected test URL: ' + url);
  };
  try {
    const frames = await media.resolveFilm({ id: 'test-film', title: 'Test Film', en: 'Test Film', year: 2020, tmdb: 123 });
    assert.ok(frames.length >= 1, 'Tek uygun backdrop da filmi oynatabilmeli');
    assert.ok(frames.includes('https://image.tmdb.org/t/p/w1280/scene-one.jpg'));
    assert.ok(!frames.includes('https://upload.wikimedia.org/test-film-scene.jpg'), 'Alakasız Wikimedia eşleşmeleri kullanılmamalı');
    const searchedFrames = await media.resolveFilm({ id: 'search-film', title: 'Search Fixture', en: 'Search Fixture', year: 2021 });
    assert.ok(searchedFrames.includes('https://image.tmdb.org/t/p/w1280/search-fixture.jpg'), 'TMDB arama sonucu backdrop alanı da kullanılmalı');
    const fallbackFrames = await media.resolveFilm({ id: 'commons-film', title: 'Test Film', en: 'Test Film', year: 2020 });
    assert.ok(fallbackFrames && fallbackFrames.length >= 1, 'TMDB yetersiz kalınca Commons doğrulanmış yedek görselleri kullanılmalı');
    const audio = await media.resolveSong({ id: 'test-song', title: 'Bad Guy', artist: 'Billie Eilish' });
    assert.equal(audio, 'https://audio.example/bad-guy.m4a');
    assert.ok(calls.some(x => x.includes('/movie/123/images')));
    console.log('Media resolution tests passed: strict TMDB matching + iTunes preview.');
  } finally {
    global.fetch = originalFetch;
  }
})().catch(err => { console.error(err); process.exitCode = 1; });
