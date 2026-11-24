const assert = require('node:assert/strict');
const v = require('../data/visual-games');
for (const [name, list, min] of [
  ['logos', v.LOGOS, 30], ['flags', v.FLAGS, 35], ['Turkish celebrities', v.PEOPLE_TR, 20],
  ['foreign celebrities', v.PEOPLE_WORLD, 20], ['footballers', v.FOOTBALLERS, 25], ['football clubs', v.CLUBS, 35], ['universe quiz', v.UNIVERSE, 30]
]) {
  assert.ok(list.length >= min, `${name} havuzu yeterince geniş değil`);
  assert.equal(new Set(list.map(x => x.id)).size, list.length, `${name} içinde ID tekrarı var`);
}
assert.ok(v.LOGOS.every(x => /^https:\/\//.test(x.image)));
assert.ok(v.FLAGS.every(x => /^https:\/\//.test(x.image)));
assert.ok(v.CLUBS.every(x => typeof x.page === 'string' && x.page.length > 2 && x.answer));
assert.ok(v.UNIVERSE.every(x => Array.isArray(x.o) && x.o.length === 4 && x.v >= 0 && x.v < 4));
console.log('Visual games validation passed:', { logos:v.LOGOS.length, flags:v.FLAGS.length, turkishCelebrities:v.PEOPLE_TR.length, foreignCelebrities:v.PEOPLE_WORLD.length, footballers:v.FOOTBALLERS.length, clubs:v.CLUBS.length, universe:v.UNIVERSE.length });
