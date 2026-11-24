const assert = require('node:assert/strict');
const bank = require('../data/content-bank');
const bonus = require('../data/bonus-content');
const expansion = require('../data/content-expansion');
const extra = require('../data/extra-content');
const musicExpansion = require('../data/music-expansion');
const merged = {};
for (const key of Object.keys(bank)) merged[key] = Array.isArray(bank[key]) ? [...bank[key]] : bank[key];
for (const src of [bonus, expansion]) for (const [key, value] of Object.entries(src)) {
  if (Array.isArray(value) && Array.isArray(merged[key])) merged[key].push(...value);
  else if (key === 'CODENAMES_WORDS') for (const [tier, words] of Object.entries(value)) merged[key][tier].push(...words);
}
for (const key of ['TF_BANK','QUIZ_BANK','LIAR_BANK','EMOJI_BANK']) if (expansion[key + '_EXTRA']) merged[key].push(...expansion[key + '_EXTRA']);
const required = ['TF_BANK','CLOSEST_BANK','QUIZ_BANK','LIAR_BANK','WYR_BANK','ML_BANK','EMOJI_BANK'];
for (const key of required) assert.ok(merged[key].length > 0, `${key} boş`);
assert.ok(merged.CLOSEST_BANK.length >= 50, `En Yakın Cevabı Bul havuzu 50 altı: ${merged.CLOSEST_BANK.length}`);
assert.ok(merged.QUIZ_BANK.length >= 40, `Quiz havuzu 40 altı: ${merged.QUIZ_BANK.length}`);
assert.ok(merged.LIAR_BANK.length >= 25, `Yalan havuzu 25 altı: ${merged.LIAR_BANK.length}`);
assert.ok(merged.WYR_BANK.length >= 30, `İkilem havuzu 30 altı: ${merged.WYR_BANK.length}`);
assert.ok(merged.ML_BANK.length >= 30, `Kim daha olası havuzu 30 altı: ${merged.ML_BANK.length}`);
assert.ok(merged.EMOJI_BANK.length >= 30, `Emoji havuzu 30 altı: ${merged.EMOJI_BANK.length}`);
assert.ok(merged.IMPOSTER_BANK.length >= 20, `Imposter havuzu 20 altı: ${merged.IMPOSTER_BANK.length}`);
assert.ok(extra.FILMS.length >= 50, `Yeni film havuzu 50 altı: ${extra.FILMS.length}`);
const allMusic = [...bank.MUSIC_BANK, ...extra.MUSIC, ...musicExpansion];
const seenMusic = new Set();
const music = allMusic.filter(x => { const k = x.title.toLocaleLowerCase('tr') + '|' + x.artist.toLocaleLowerCase('tr'); if (seenMusic.has(k)) return false; seenMusic.add(k); return true; });
assert.ok(musicExpansion.length >= 100, `Yeni Türkçe şarkı eklemesi 100 altı: ${musicExpansion.length}`);
assert.ok(musicExpansion.some(x => x.lang === 'tr') && musicExpansion.some(x => x.lang === 'en'), 'Türkçe ve yabancı müzik kayıtları birlikte bulunmalı');
assert.ok(music.length >= 70, `Şarkı kataloğu 70 altı: ${music.length}`);
assert.ok(music.every(x => x.id && x.title && x.artist && x.genres?.length && ['tr','en'].includes(x.lang)), 'Şarkı kaydında zorunlu alan eksik');
assert.equal(new Set(music.map(x => x.id)).size, music.length, 'Şarkı kataloğunda ID tekrarı var');
assert.equal(new Set(music.map(x => x.title.toLocaleLowerCase('tr') + '|' + x.artist.toLocaleLowerCase('tr'))).size, music.length, 'Şarkı kataloğunda aynı sanatçı/şarkı tekrarı var');
for (const q of merged.CLOSEST_BANK) { assert.equal(typeof q.v, 'number'); assert.ok(q.t && q.c && q.x); }
for (const key of required) { const serialized = merged[key].map(q => JSON.stringify(q)); assert.equal(new Set(serialized).size, serialized.length, `${key} içinde birebir tekrar var`); }
for (const q of merged.QUIZ_BANK) { assert.ok(Array.isArray(q.o) && q.o.length === 4); assert.ok(q.v >= 0 && q.v < 4); }
for (const q of merged.LIAR_BANK) { assert.ok(Array.isArray(q.o) && q.o.length === 4); assert.ok(q.v >= 0 && q.v < 4); }
for (const f of extra.FILMS) { assert.ok(f.title && f.en && f.year && f.categories.length && f.answers.length); assert.ok(['tr','hollywood'].includes(f.region)); }
assert.equal(new Set([...bank.FILM_BANK, ...extra.FILMS].map(f => f.title.toLocaleLowerCase('tr'))).size, bank.FILM_BANK.length + extra.FILMS.length, 'Film kataloğunda tekrar var');
for (const tier of ['easy','medium','hard']) assert.ok(merged.CODENAMES_WORDS[tier].length >= 25);
console.log(JSON.stringify({
  counts: Object.fromEntries(required.map(k => [k, merged[k].length])),
  imposter: merged.IMPOSTER_BANK.length,
  films: bank.FILM_BANK.length + extra.FILMS.length,
  songs: music.length,
  codenames: Object.fromEntries(['easy','medium','hard'].map(t => [t, merged.CODENAMES_WORDS[t].length]))
}, null, 2));
