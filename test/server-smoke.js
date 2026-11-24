const assert = require('node:assert/strict');
const Module = require('node:module');

class FakeSocket {
  constructor(id) { this.id = id; this.data = {}; this.handlers = {}; this.out = []; }
  on(event, fn) { this.handlers[event] = fn; return this; }
  emit(event, ...args) { this.out.push({ event, args }); return this; }
  trigger(event, ...args) { if (this.handlers[event]) return this.handlers[event](...args); }
  latest(event) { return this.out.filter(x => x.event === event).slice(-1)[0]?.args[0]; }
}
class FakeIO {
  constructor() { this.handlers = {}; this.sockets = new Map(); global.__partiTestIO = this; }
  on(event, fn) { this.handlers[event] = fn; return this; }
  to(id) { return { emit: (event, ...args) => { for (const socket of this.sockets.values()) if (socket.id === id) socket.emit(event, ...args); } }; }
  connect(id) { const socket = new FakeSocket(id); this.sockets.set(id, socket); this.handlers.connection(socket); return socket; }
}

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'socket.io') return { Server: FakeIO };
  return originalLoad.call(this, request, parent, isMain);
};
process.env.PORT = '0';
global.fetch = async () => ({ ok: true, json: async () => ({ thumbnail: { source: 'https://upload.wikimedia.org/test-person.jpg' } }) });
require('../server');
Module._load = originalLoad;
const io = global.__partiTestIO;
let sequence = 0;
function makeRoom(game, extra = {}) {
  const host = io.connect(`h${++sequence}`);
  const guest = io.connect(`g${sequence}`);
  let created, joined;
  host.trigger('create', 'Host', value => { created = value; });
  guest.trigger('join', created.code, 'Guest', value => { joined = value; });
  assert.ok(created.code && joined.code);
  host.trigger('start', { game, rounds: 5, time: 10, difficulty: 'medium', wordLength: 5, ...extra });
  return { host, guest };
}

for (const game of ['wordle', 'kelimelik', 'bagdastirici', 'palavra', 'survey', 'bigger']) {
  const { host, guest } = makeRoom(game);
  const a = host.latest('s'), b = guest.latest('s');
  assert.equal(a.game, game);
  assert.equal(b.game, game);
  assert.equal(a.phase, 'question');
  if (game === 'wordle') {
    assert.equal(a.wordle.length, 5);
    assert.deepEqual(a.q, b.q);
    assert.ok(!JSON.stringify(a).includes('target'));
    host.trigger('wordle:guess', 'AAAAA');
    assert.equal(host.latest('s').wordle.guesses.length, 1);
    assert.equal(host.latest('s').wordle.guesses[0].marks.length, 5);
  }
  if (game === 'kelimelik') {
    assert.ok(a.kelimelik.revealed.length > 0);
    assert.ok(!JSON.stringify(a.q).includes('_answer'));
    const wrong = 'Z'.repeat(a.q.letters);
    host.trigger('answer', wrong);
    host.trigger('answer', wrong);
    assert.equal(host.latest('s').phase, 'question');
  }
  if (game === 'bagdastirici') {
    assert.equal(a.q.words.length, 4);
    assert.ok(!JSON.stringify(a).includes('accepted'));
    host.trigger('answer', 'farklı bir bağlantı');
    guest.trigger('answer', 'başka bir bağlantı');
    assert.equal(host.latest('s').phase, 'reveal');
    assert.equal(host.latest('s').bag.submissions.length, 2);
    host.trigger('bag:judge', guest.latest('s').me);
  }
  if (game === 'palavra') {
    assert.equal(a.palavra.phase, 'bluff');
    assert.ok(!JSON.stringify(a.palavra).includes('optionOwners'));
    host.trigger('palavra:bluff', 'İnandırıcı yanlış cevap A');
    guest.trigger('palavra:bluff', 'İnandırıcı yanlış cevap B');
    assert.equal(host.latest('s').palavra.phase, 'vote');
    host.trigger('palavra:vote', 0);
    guest.trigger('palavra:vote', 0);
    assert.equal(host.latest('s').phase, 'reveal');
    assert.ok(host.latest('s').palavra.results.length >= 3);
  }
  if (game === 'survey') {
    assert.ok(a.q.o.length >= 4);
    assert.ok(a.q.c.includes('Gerçek araştırma değildir'));
    host.trigger('answer', 0);
    guest.trigger('answer', 1);
    assert.equal(host.latest('s').phase, 'reveal');
    assert.ok(host.latest('s').rev.surveyRanks.length >= 4);
  }
  if (game === 'bigger') {
    assert.equal(a.q.o.length, 2);
    assert.ok(a.q.c.includes('Ölçüt:'));
    host.trigger('answer', 0);
    guest.trigger('answer', 1);
    assert.equal(host.latest('s').phase, 'reveal');
    assert.ok([0, 1].includes(host.latest('s').rev.v));
    assert.ok(host.latest('s').rev.x.length > 5);
  }
}

const mixHost = io.connect('mix-host');
let mixRoom;
mixHost.trigger('create', 'Mix Host', value => { mixRoom = value; });
mixHost.trigger('start', { mixMode: true, mixGames: ['tf', 'quiz', 'liar', 'wyr', 'ml', 'emoji', 'wordle', 'clublogo'], mixRoundsPerGame: 1, time: 10, difficulty: 'easy' });
assert.equal(mixHost.latest('s').mix.games.length, 8);

async function visualGameSmoke() {
  for (const game of ['logo', 'celebrity', 'celebritytr', 'celebrityworld', 'footballer', 'clublogo', 'flag', 'universe']) {
    const { host, guest } = makeRoom(game);
    await new Promise(resolve => setTimeout(resolve, 100));
    const state = host.latest('s');
    assert.equal(state.game, game);
    assert.equal(state.phase, 'question');
    assert.ok(Array.isArray(state.q.o) && state.q.o.length === 4);
    if (game !== 'universe') assert.ok(state.q.image && state.q.image.startsWith('https://'));
    host.trigger('answer', 0);
    guest.trigger('answer', 1);
    assert.equal(host.latest('s').phase, 'reveal');
    assert.ok(host.latest('s').rev.v);
  }
}
visualGameSmoke().then(() => {
  console.log('Server smoke tests passed: existing games + visual quizzes including club logos, scoring, hidden-answer flows, and mix mode.');
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
