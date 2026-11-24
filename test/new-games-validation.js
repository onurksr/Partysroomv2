const assert = require('node:assert/strict');
const { WORDS, CONNECTIONS, BLUFF, SURVEYS, BIGGER, KELIME_CATEGORIES } = require('../data/new-games');
for (const level of ['easy','medium','hard']) {
  assert.ok(WORDS[level].length >= 40, `${level} Wordle/Kelimelik kelime havuzu 40 altı`);
  assert.equal(new Set(WORDS[level].map(x => x.toLocaleLowerCase('tr-TR'))).size, WORDS[level].length, `${level} kelime havuzunda tekrar var`);
}
for (const [name, list, key] of [
  ['Bağdaştırıcı', CONNECTIONS, x => x.w.join('|')],
  ['Palavra', BLUFF, x => x.q],
  ['Anket', SURVEYS, x => x.q],
  ['Karşılaştırma', BIGGER, x => [x.c,x.a,x.b,x.metric].join('|')]
]) assert.equal(new Set(list.map(key)).size, list.length, `${name} havuzunda tekrar var`);
for (const [name, list] of Object.entries(KELIME_CATEGORIES)) assert.equal(new Set(list.map(x=>x.toLocaleLowerCase('tr-TR'))).size, list.length, `${name} kategorisinde tekrar var`);
for (const item of CONNECTIONS) {
  assert.ok(['easy','medium','hard'].includes(item.d));
  assert.equal(item.w.length, 4);
  assert.ok(item.c && item.a.length >= 2 && item.a.every(Boolean));
}
for (const item of BLUFF) {
  assert.ok(item.q && item.a && item.fake.length >= 3 && item.c);
  assert.ok(!item.fake.some(x => x.toLocaleLowerCase('tr-TR') === item.a.toLocaleLowerCase('tr-TR')));
}
for (const item of SURVEYS) {
  assert.ok(item.q && item.o.length >= 4);
  assert.ok(item.o.every(x => x[0] && Number.isFinite(x[1]) && x[1] >= 0));
  assert.ok(item.o.reduce((n,x)=>n+x[1],0) === 100, `Anket yüzdeleri 100 etmiyor: ${item.q}`);
}
for (const item of BIGGER) {
  assert.ok(['Coğrafya','Hayvanlar','Bilim','Tarih','Spor','Film','Müzik','Genel kültür'].includes(item.c));
  assert.ok(item.a && item.b && item.a !== item.b && item.metric && item.x);
  assert.ok(item.v === 0 || item.v === 1);
}
assert.ok(CONNECTIONS.length >= 30);
assert.ok(BLUFF.length >= 15);
assert.ok(SURVEYS.length >= 20);
assert.ok(BIGGER.length >= 35);
assert.deepEqual(new Set(BIGGER.map(x=>x.c)), new Set(['Coğrafya','Hayvanlar','Bilim','Tarih','Spor','Film','Müzik','Genel kültür']));
assert.deepEqual(Object.keys(KELIME_CATEGORIES), ['İsim','Şehir','Ülke','Film','Sanatçı','Nesne']);
assert.ok(Object.values(KELIME_CATEGORIES).every(list => list.length >= 10));
console.log(JSON.stringify({ wordLists: Object.fromEntries(Object.entries(WORDS).map(([k,v])=>[k,v.length])), connections: CONNECTIONS.length, bluff: BLUFF.length, surveys: SURVEYS.length, comparisons: BIGGER.length, kelimeCategories: Object.fromEntries(Object.entries(KELIME_CATEGORIES).map(([k,v])=>[k,v.length])) }, null, 2));
