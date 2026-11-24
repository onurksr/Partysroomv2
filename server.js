const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Server } = require('socket.io');

const bank = require('./data/content-bank');
const extra = require('./data/extra-content');
const media = require('./data/media');
const bonus = require('./data/bonus-content');
const expansion = require('./data/content-expansion');
const pixelPool = require('./data/pixel-pool');
const newGames = require('./data/new-games');
const musicExpansion = require('./data/music-expansion');
const visualGames = require('./data/visual-games');
const contentAdditions = require('./data/content-additions');
bank.CLOSEST_BANK.push(...contentAdditions.closest);
const fmtCn = (() => { const s = String(bank.CODENAMES_WORDS.easy[0] || ''); return s === s.toLocaleUpperCase('tr') ? w => w.toLocaleUpperCase('tr') : w => w; })();
const haveCn = new Set(Object.values(bank.CODENAMES_WORDS).flat().map(w => String(w).toLocaleLowerCase('tr')));
for (const k of Object.keys(bonus)) {
  if (Array.isArray(bank[k])) { bank[k].push(...bonus[k]); continue; }
  for (const tier of Object.keys(bonus[k])) for (const w of bonus[k][tier]) {
    const lw = w.toLocaleLowerCase('tr');
    if (!haveCn.has(lw)) { haveCn.add(lw); bank[k][tier].push(fmtCn(w)); }
  }
}
for (const k of Object.keys(expansion)) {
  if (Array.isArray(expansion[k]) && Array.isArray(bank[k])) { bank[k].push(...expansion[k]); continue; }
  if (k === 'CODENAMES_WORDS' && bank[k]) {
    for (const tier of Object.keys(expansion[k])) for (const w of expansion[k][tier]) {
      const lw = String(w).toLocaleLowerCase('tr');
      if (!haveCn.has(lw)) { haveCn.add(lw); bank[k][tier].push(fmtCn(w)); }
    }
  }
}
for (const k of ['TF_BANK_EXTRA', 'QUIZ_BANK_EXTRA', 'EMOJI_BANK_EXTRA']) { const target = k.replace('_EXTRA', ''); if (Array.isArray(bank[target]) && Array.isArray(expansion[k])) bank[target].push(...expansion[k]); }
for (const k of ['TF_BANK','QUIZ_BANK','LIAR_BANK','EMOJI_BANK']) {
  const extraRows = expansion[k + '_EXTRA'];
  if (Array.isArray(extraRows)) bank[k].push(...extraRows);
}


bank.TF_BANK.push(
 {d:'easy',c:'Bilim',t:'Ahtapotların üç kalbi vardır.',v:true,x:'İki kalp solungaçlara, biri vücudun geri kalanına kan pompalar.'},
 {d:'easy',c:'Coğrafya',t:'Japonya’nın başkenti Tokyo’dur.',v:true,x:'Tokyo Japonya’nın başkentidir.'},
 {d:'medium',c:'Uzay',t:'Venüs, Güneş Sistemi’nin en sıcak gezegenidir.',v:true,x:'Yoğun sera etkisi yüzey sıcaklığını çok yükseltir.'},
 {d:'medium',c:'Tarih',t:'İstanbul 1453 yılında fethedilmiştir.',v:true,x:'Fetih 29 Mayıs 1453 tarihinde gerçekleşti.'},
 {d:'medium',c:'Doğa',t:'Penguenler yalnızca Kuzey Kutbu’nda yaşar.',v:false,x:'Penguenler doğal olarak Güney Yarımküre’de yaşar.'},
 {d:'hard',c:'Bilim',t:'İnsan vücudundaki en büyük organ deridir.',v:true,x:'Deri, yüzey alanı ve kütle bakımından en büyük organdır.'}
);
bank.QUIZ_BANK.push(
 {d:'easy',c:'Coğrafya',t:'Kanada’nın başkenti hangisidir?',o:['Toronto','Ottawa','Vancouver','Montreal'],v:1,x:'Kanada’nın başkenti Ottawa’dır.'},
 {d:'easy',c:'Bilim',t:'Suyun kimyasal formülü nedir?',o:['CO₂','H₂O','O₂','NaCl'],v:1,x:'Su iki hidrojen ve bir oksijen atomundan oluşur.'},
 {d:'medium',c:'Sinema',t:'Yüzüklerin Efendisi film üçlemesinin yönetmeni kimdir?',o:['Peter Jackson','James Cameron','Ridley Scott','Steven Spielberg'],v:0,x:'Üçlemeyi Peter Jackson yönetti.'},
 {d:'medium',c:'Müzik',t:'Queen grubunun solisti kimdir?',o:['David Bowie','Freddie Mercury','Elton John','Mick Jagger'],v:1,x:'Queen’in ikonik solisti Freddie Mercury’dir.'},
 {d:'hard',c:'Tarih',t:'Magna Carta hangi ülkede imzalanmıştır?',o:['Fransa','İngiltere','İspanya','İtalya'],v:1,x:'Magna Carta 1215’te İngiltere’de mühürlendi.'}
);
bank.CLOSEST_BANK.push(
 {d:'easy',c:'Doğa',t:'Bir bal arısının ortalama kaç kanadı vardır?',v:4,u:'kanat',x:'Bal arılarının iki çift, yani dört kanadı bulunur.'},
 {d:'medium',c:'Coğrafya',t:'Japonya’da kaç ana ada vardır?',v:4,u:'ana ada',x:'Japonya’nın dört büyük ana adası vardır.'},
 {d:'medium',c:'Uzay',t:'Dünya’nın Güneş etrafındaki bir turu yaklaşık kaç gündür?',v:365,u:'gün',x:'Bir yıl yaklaşık 365,24 gündür.'},
 {d:'hard',c:'Bilim',t:'İnsan kalbi dakikada dinlenme halinde ortalama kaç kez atar?',v:72,u:'atım',x:'Yetişkinlerde dinlenme nabzı çoğunlukla dakikada 60–100 arasındadır.'}
);
bank.LIAR_BANK.push(
 {d:'easy',c:'Coğrafya',t:'Hangisi yanlıştır?',o:['İtalya’nın başkenti Roma’dır.','Mısır Afrika’dadır.','İsviçre’nin denize kıyısı vardır.','Norveç’in başkenti Oslo’dur.'],v:2,x:'İsviçre denize kıyısı olmayan bir ülkedir.'},
 {d:'medium',c:'Bilim',t:'Hangisi yanlıştır?',o:['Işık sesten hızlıdır.','Su 0°C civarında donar.','İnsanların üç akciğeri vardır.','Dünya kendi ekseni etrafında döner.'],v:2,x:'İnsanlarda iki akciğer bulunur.'},
 {d:'hard',c:'Tarih',t:'Hangisi yanlıştır?',o:['Roma İmparatorluğu Akdeniz çevresinde büyüdü.','Rönesans İtalya’da başladı.','Fransız Devrimi 1789’da başladı.','Sanayi Devrimi ilk olarak Japonya’da başladı.'],v:3,x:'Sanayi Devrimi ilk olarak Britanya’da başladı.'}
);
bank.WYR_BANK.push(
 {d:'easy',c:'Günlük','t':'Hangisini tercih ederdin?','o':['Deniz tatili','Dağ tatili'],v:null,x:'Seçimini yap; çoğunluğa katıl.'},
 {d:'medium',c:'Eğlence','t':'Bir hafta hangisinden vazgeçerdin?','o':['Sosyal medya','Dizi/film'],v:null,x:'Çoğunluğun tercihi puan kazandırır.'},
 {d:'medium',c:'Yemek','t':'Birini sonsuza kadar seç:','o':['Pizza','Hamburger'],v:null,x:'Çoğunluğun tercihi puan kazandırır.'}
);
bank.ML_BANK.push(
 {d:'easy',c:'Grup','t':'Odada kim daha olası: Bir geziyi son dakikada planlamak?','o':[],v:null,x:'Arkadaşlarını oylayın.'},
 {d:'medium',c:'Grup','t':'Odada kim daha olası: Bir şarkının tüm sözlerini ezbere bilmek?','o':[],v:null,x:'Arkadaşlarını oylayın.'},
 {d:'medium',c:'Grup','t':'Odada kim daha olası: Bir konuda saatlerce araştırma yapmak?','o':[],v:null,x:'Arkadaşlarını oylayın.'}
);
bank.EMOJI_BANK.push(
 {d:'easy',c:'Animasyon',t:'🦁👑',a:['Aslan Kral'],x:'Aslan Kral'},
 {d:'easy',c:'Sinema',t:'🕷️🧑',a:['Örümcek Adam','Spider-Man'],x:'Örümcek-Adam'},
 {d:'medium',c:'Dizi',t:'🧪👨‍🔬💊',a:['Breaking Bad'],x:'Breaking Bad'},
 {d:'medium',c:'Sinema',t:'🚢🧊💔',a:['Titanik','Titanic'],x:'Titanik'},
 {d:'hard',c:'Sinema',t:'🌀💤🧠',a:['Başlangıç','Inception'],x:'Başlangıç'}
);

const PORT = process.env.PORT || 3000;

const MIX_ALLOWED = new Set(['tf', 'closest', 'quiz', 'liar', 'wyr', 'ml', 'emoji', 'song', 'film', 'pixel', 'wordle', 'kelimelik', 'bagdastirici', 'palavra', 'survey', 'bigger', 'logo', 'celebrity', 'celebritytr', 'celebrityworld', 'footballer', 'clublogo', 'flag', 'universe']);
const MIX_FORBIDDEN = new Set(['codenames', 'werewolf', 'imposter']);
const ALL_GAMES = new Set([
  'tf', 'closest', 'quiz', 'liar', 'wyr', 'ml', 'emoji',
  'codenames', 'werewolf', 'imposter', 'song', 'film', 'pixel', 'logo', 'celebrity', 'celebritytr', 'celebrityworld', 'footballer', 'clublogo', 'flag', 'universe',
  'wordle', 'kelimelik', 'bagdastirici', 'palavra', 'survey', 'bigger'
]);

const AV = ['🦊', '🐼', '🐸', '🦄', '🐙', '🐯', '🐵', '🦁', '🐨', '🐧'];
const TEAMS = [['Kırmızı', '#ef4444'], ['Mavi', '#3b82f6'], ['Yeşil', '#22c55e'], ['Turuncu', '#f59e0b']];
const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const rooms = new Map();

const customCatalog = {
  music: (() => { const all = [...bank.MUSIC_BANK.map(({ notes, ...m }) => m), ...extra.MUSIC, ...musicExpansion, ...contentAdditions.songs.map((m, i) => ({ id: `m_add_${i+1}`, title: m.title, artist: m.artist, lang: 'tr', genres: [m.genre === 'rap' ? 'Türkçe Rap' : m.genre === 'rock' ? 'Rock' : m.genre === 'Alternatif' ? 'Alternatif' : 'Türkçe Pop', 'Karışık'], year: 0, d: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard', pop: 'high' }))]; const seen = new Set(); return all.filter(m => { const k = `${String(m.title).toLocaleLowerCase('tr')}|${String(m.artist).toLocaleLowerCase('tr')}`; if (seen.has(k)) return false; seen.add(k); return true; }); })(),
  films: [...bank.FILM_BANK.map(({ scenes, ...f }) => f), ...extra.FILMS],
  imposter: [...bank.IMPOSTER_BANK],
  codenames: {
    easy: [...bank.CODENAMES_WORDS.easy],
    medium: [...bank.CODENAMES_WORDS.medium],
    hard: [...bank.CODENAMES_WORDS.hard],
  },
  artistsTr: [...new Set([...bank.TURKISH_ARTISTS, ...extra.ARTISTS_TR, ...musicExpansion.map(x => x.artist)])],
  artistsEn: [...new Set([...bank.FOREIGN_ARTISTS, ...extra.ARTISTS_EN])],
  musicCategories: [...new Set([...bank.MUSIC_CATEGORIES, 'Türkçe', 'Yabancı', 'Manifest', 'Oğuzhan Koç', 'Tarkan', 'Sezen Aksu', 'Mabel Matiz', 'Hadise', 'Edis', 'Gülşen', 'Sertab Erener', 'Yalın', 'Kenan Doğulu', 'Mustafa Sandal', 'Ajda Pekkan', 'Athena', 'Şebnem Ferah', 'Emre Aydın', 'Pinhani', 'Gripin', 'Model', 'Madrigal', 'Yüzyüzeyken Konuşuruz', 'Adamlar', 'Motive', 'Uzi', 'Ezhel', 'Ceza', 'Sagopa Kajmer', 'Lvbel C5', 'Güneş', 'Reynmen', 'Taylor Swift', 'The Weeknd', 'Dua Lipa', 'Ed Sheeran', 'Billie Eilish', 'Eminem', 'Adele', 'Coldplay', 'Queen', 'Linkin Park', 'Rihanna', 'Beyoncé', 'Bruno Mars', 'Drake', 'Harry Styles', 'Imagine Dragons', 'Maroon 5', 'Türkçe Rock'])],
  filmCategories: [...bank.FILM_CATEGORIES],
  filmSeries: [...bank.FILM_SERIES],
};

const newCode = () => {
  let c;
  do {
    c = Array.from({ length: 5 }, () => ABC[crypto.randomInt(ABC.length)]).join('');
  } while (rooms.has(c));
  return c;
};
const clean = (s, max = 12) => String(s || '').replace(/[<>]/g, '').trim().slice(0, max);
const norm = media.fold;
const shuffle = a => {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
const clamp = (v, a, b, d) => {
  const n = Math.round(+v);
  return Number.isFinite(n) ? Math.min(b, Math.max(a, n)) : d;
};
const diffSec = (baseSec, diff) => {
  if (diff === 'easy') return Math.min(90, Math.round(baseSec * 1.25));
  if (diff === 'hard') return Math.max(8, Math.round(baseSec * 0.78));
  return baseSec;
};
const filterByDiff = (items, diff) => {
  if (!Array.isArray(items) || !items.length) return [];
  const exact = items.filter(x => x.d === diff);
  if (exact.length >= 2) return exact;
  if (diff === 'easy') {
    const f = items.filter(x => x.d === 'easy' || x.d === 'medium');
    return f.length ? f : items;
  }
  if (diff === 'hard') {
    const f = items.filter(x => x.d === 'hard' || x.d === 'medium');
    return f.length ? f : items;
  }
  return items;
};

const akey = (r, p) => (r.game === 'closest' && r.mode === 'team' ? 't' + p.team : p.id);
const activePlayers = r => [...r.players.values()].filter(p => p.on);
const allDone = r => {
  const act = activePlayers(r);
  if (!act.length) return false;
  if (r.game === 'codenames' && r.cn) {
    return false;
  }
  return act.every(p => r.ans.has(akey(r, p)));
};
const me = s => {
  const r = rooms.get(s.data.code);
  const p = r && r.players.get(s.data.id);
  return p ? [r, p] : [];
};

function sanitizeMusicFilter(raw) {
  const f = raw && typeof raw === 'object' ? raw : {};
  const cats = Array.isArray(f.categories) ? f.categories.map(x => String(x)).slice(0, 12) : [];
  const artists = Array.isArray(f.artists) ? f.artists.map(x => String(x)).slice(0, 25) : [];
  const lang = ['all', 'tr', 'en'].includes(f.lang) ? f.lang : 'all';
  const minYear = f.minYear ? clamp(f.minYear, 1950, 2026, 1950) : null;
  const maxYear = f.maxYear ? clamp(f.maxYear, 1950, 2026, 2026) : null;
  const onlyPopular = Boolean(f.onlyPopular);
  const randomMix = Boolean(f.randomMix);
  return { categories: cats, artists, lang, minYear, maxYear, onlyPopular, randomMix };
}

function getFilteredMusic(r, diff) {
  const mf = sanitizeMusicFilter(r.cfg && r.cfg.musicFilter);
  let pool = customCatalog.music.filter(m => {
    if (mf.lang === 'tr' && m.lang !== 'tr') return false;
    if (mf.lang === 'en' && m.lang !== 'en') return false;
    if (mf.onlyPopular && m.pop !== 'high') return false;
    if (mf.minYear && m.year < mf.minYear) return false;
    if (mf.maxYear && m.year > mf.maxYear) return false;
    if (!mf.randomMix && mf.categories.length && !mf.categories.includes('Karışık')) {
      const hasCat = m.genres.some(g => mf.categories.includes(g)) || mf.categories.includes(m.artist) || (mf.categories.includes('Türkçe') && m.lang === 'tr') || (mf.categories.includes('Yabancı') && m.lang === 'en');
      if (!hasCat) return false;
    }
    if (!mf.randomMix && mf.artists.length) {
      if (!mf.artists.includes(m.artist)) return false;
    }
    return true;
  });
  if (!pool.length) pool = [...customCatalog.music];
  const dPool = filterByDiff(pool, diff);
  return dPool.length ? dPool : pool;
}


// Şarkı çoktan seçmeli seçenekleri yalnızca aynı sanatçının gerçek katalog kayıtlarından üret.
function buildSongChoices(item) {
  const artistKey = norm(item.artist);
  const sameArtist = customCatalog.music.filter(m =>
    norm(m.artist) === artistKey && m.lang === item.lang && m.title &&
    !/^https?:\/\//i.test(String(m.title))
  );
  const unique = [];
  const seen = new Set();
  for (const song of sameArtist) {
    const key = norm(song.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(song.title);
  }
  if (unique.length < 3) return null;
  const distractors = shuffle(unique.filter(title => norm(title) !== norm(item.title))).slice(0, 3);
  const options = shuffle([item.title, ...distractors]);
  return options.length >= 2 ? { options, correctIndex: options.findIndex(title => norm(title) === norm(item.title)) } : null;
}

function sanitizeFilmFilter(raw) {
  const f = raw && typeof raw === 'object' ? raw : {};
  const categories = Array.isArray(f.categories) ? f.categories.map(x => String(x)).slice(0, 15) : [];
  const series = Array.isArray(f.series) ? f.series.map(x => String(x)).slice(0, 15) : [];
  const region = ['all', 'tr', 'hollywood'].includes(f.region) ? f.region : 'all';
  const minYear = f.minYear ? clamp(f.minYear, 1920, 2026, 1920) : null;
  const maxYear = f.maxYear ? clamp(f.maxYear, 1920, 2026, 2026) : null;
  const popLevel = ['all', 'high', 'medium'].includes(f.popLevel) ? f.popLevel : 'all';
  const randomMix = Boolean(f.randomMix);
  return { categories, series, region, minYear, maxYear, popLevel, randomMix };
}

function getFilteredFilms(r, diff) {
  const ff = sanitizeFilmFilter(r.cfg && r.cfg.filmFilter);
  let pool = customCatalog.films.filter(item => {
    if (ff.region === 'tr' && item.region !== 'tr') return false;
    if (ff.region === 'hollywood' && item.region !== 'hollywood') return false;
    if (ff.popLevel !== 'all' && item.pop !== ff.popLevel) return false;
    if (ff.minYear && item.year < ff.minYear) return false;
    if (ff.maxYear && item.year > ff.maxYear) return false;
    if (!ff.randomMix && ff.categories.length) {
      const ok = item.categories.some(c => ff.categories.includes(c));
      if (!ok) return false;
    }
    if (!ff.randomMix && ff.series.length) {
      if (!item.series || !ff.series.includes(item.series)) return false;
    }
    return true;
  });
  if (!pool.length) pool = [...customCatalog.films];
  const dPool = filterByDiff(pool, diff);
  return dPool.length ? dPool : pool;
}

function getActiveGameId(r) {
  if (r.mix && r.mix.active) {
    return r.mix.games[r.mix.step % r.mix.games.length];
  }
  return r.game;
}

function getActiveDifficulty(r) {
  return (r.cfg && ['easy', 'medium', 'hard'].includes(r.cfg.difficulty)) ? r.cfg.difficulty : 'medium';
}

function speedBonus(r, answer, cap = 120) {
  if (!answer || !Number.isFinite(answer.t)) return 0;
  const elapsed = Math.max(0, answer.t - (r.startedAt || (r.deadline - (r.activeSec || 20) * 1000)));
  const duration = Math.max(1, (r.activeSec || 20) * 1000);
  return Math.max(0, Math.round(cap * (1 - elapsed / duration)));
}

function givePoints(r, p, pts) {
  if (!p || !pts) return;
  if (r.mode === 'team' && p.team != null && r.teams[p.team]) {
    r.teams[p.team].score += pts;
  } else {
    p.score += pts;
  }
}

function initCodenames(r) {
  const diff = getActiveDifficulty(r);
  const ps = [...r.players.values()];
  r.mode = 'team';
  r.teams = [
    { name: 'Kırmızı', color: '#ef4444', score: 0 },
    { name: 'Mavi', color: '#3b82f6', score: 0 }
  ];
  const shuffledPlayers = shuffle(ps);
  shuffledPlayers.forEach((p, i) => {
    p.team = i % 2;
    p.spymaster = false;
  });
  const redSpies = shuffledPlayers.filter(p => p.team === 0);
  const blueSpies = shuffledPlayers.filter(p => p.team === 1);
  if (redSpies[0]) redSpies[0].spymaster = true;
  if (blueSpies[0]) blueSpies[0].spymaster = true;

  const baseWords = customCatalog.codenames[diff] || customCatalog.codenames.medium;
  const allW = shuffle([...baseWords, ...customCatalog.codenames.easy, ...customCatalog.codenames.medium]);
  const usedSet = new Set(r.usedKeys || []);
  const fresh = allW.filter(w => !usedSet.has('cn:' + w));
  const chosenWords = [...fresh, ...allW.filter(w => usedSet.has('cn:' + w))].slice(0, 25);
  chosenWords.forEach(w => r.usedKeys.add('cn:' + w));

  const firstTeam = crypto.randomInt(2);
  const secondTeam = firstTeam === 0 ? 1 : 0;
  const types = [
    ...Array(9).fill(firstTeam === 0 ? 'red' : 'blue'),
    ...Array(8).fill(secondTeam === 0 ? 'red' : 'blue'),
    ...Array(7).fill('neutral'),
    'assassin'
  ];
  const keyMap = shuffle(types);
  const redTotal = keyMap.filter(t => t === 'red').length;
  const blueTotal = keyMap.filter(t => t === 'blue').length;

  r.cn = {
    cards: chosenWords.map((word, idx) => ({
      idx,
      word,
      type: keyMap[idx],
      revealed: false,
      byTeam: null
    })),
    turnTeam: firstTeam,
    clue: null,
    guessesLeft: 0,
    redLeft: redTotal,
    blueLeft: blueTotal,
    winnerTeam: null,
    reason: '',
    log: [`Oyun başladı! İlk sıra ${firstTeam === 0 ? 'Kırmızı' : 'Mavi'} takımda.`]
  };
  r.phase = 'question';
  r.round = 1;
}

function initWerewolf(r) {
  const ps = [...r.players.values()];
  const count = ps.length;
  const wolfCount = count >= 8 ? 3 : count >= 5 ? 2 : 1;
  const rolePool = ['doctor', 'detective'];
  for (let i = 0; i < wolfCount; i++) rolePool.push('werewolf');
  while (rolePool.length < count) rolePool.push('villager');

  const assigned = shuffle(rolePool);
  ps.forEach((p, idx) => {
    p.role = assigned[idx];
    p.alive = true;
    p.score = 0;
  });

  const nightSec = diffSec(r.cfg.time || 25, getActiveDifficulty(r));
  r.ww = {
    dayNum: 1,
    subPhase: 'night',
    nightActions: { wolfTarget: null, doctorSave: null, detectiveCheck: null },
    votes: new Map(),
    lastNightSummary: '',
    lastVoteSummary: '',
    winner: null,
    history: [`1. Gece başladı. Roller gizlice dağıtıldı (${wolfCount} Vampir, 1 Doktor, 1 Dedektif).`],
    durations: {
      night: clamp(r.cfg.wwNight, 10, 90, nightSec),
      day: clamp(r.cfg.wwDay, 15, 180, 45),
      vote: clamp(r.cfg.wwVote, 10, 120, 25),
    }
  };
  r.phase = 'question';
  r.round = 1;
  r.deadline = Date.now() + r.ww.durations.night * 1000;
  r.timer = setTimeout(() => resolveWerewolfNight(r), r.ww.durations.night * 1000);
}

function checkWerewolfWin(r) {
  const alive = [...r.players.values()].filter(p => p.alive);
  const wolves = alive.filter(p => p.role === 'werewolf');
  const others = alive.filter(p => p.role !== 'werewolf');
  if (wolves.length === 0) {
    r.ww.winner = 'villagers';
    r.ww.subPhase = 'ended';
    r.ww.history.push('Tüm vampirler elendi! Köylüler kazandı.');
    for (const p of r.players.values()) {
      if (p.role !== 'werewolf') p.score += 150;
    }
    finish(r);
    return true;
  }
  if (wolves.length >= others.length) {
    r.ww.winner = 'werewolves';
    r.ww.subPhase = 'ended';
    r.ww.history.push('Vampirler sayısal üstünlüğü ele geçirdi! Vampirler kazandı.');
    for (const p of r.players.values()) {
      if (p.role === 'werewolf') p.score += 150;
    }
    finish(r);
    return true;
  }
  return false;
}

function resolveWerewolfNight(r) {
  if (!r.ww || r.phase !== 'question' || r.ww.subPhase !== 'night') return;
  clearTimeout(r.timer);
  const na = r.ww.nightActions;
  const target = na.wolfTarget ? r.players.get(na.wolfTarget) : null;
  const saved = na.doctorSave && na.doctorSave === na.wolfTarget;

  let summary = '';
  if (target && target.alive && !saved) {
    target.alive = false;
    summary = `Gece ${target.name} (${target.av}) vampirler tarafından oyun dışı bırakıldı.`;
  } else if (target && saved) {
    summary = `Gece bir saldırı gerçekleşti ancak Doktor müdahalesiyle kurtarıldı!`;
  } else {
    summary = `Gece sessiz geçti, kimse oyun dışı kalmadı.`;
  }
  r.ww.lastNightSummary = summary;
  r.ww.history.push(`${r.ww.dayNum}. Gece Sonucu: ${summary}`);
  r.ww.nightActions = { wolfTarget: null, doctorSave: null, detectiveCheck: null };

  if (checkWerewolfWin(r)) return;

  r.ww.subPhase = 'day_discuss';
  r.deadline = Date.now() + r.ww.durations.day * 1000;
  push(r);
  r.timer = setTimeout(() => startWerewolfVote(r), r.ww.durations.day * 1000);
}

function startWerewolfVote(r) {
  if (!r.ww || r.phase !== 'question' || r.ww.subPhase === 'ended') return;
  clearTimeout(r.timer);
  r.ww.subPhase = 'day_vote';
  r.ww.votes = new Map();
  r.ww.history.push(`${r.ww.dayNum}. Gün oylaması başladı.`);
  r.deadline = Date.now() + r.ww.durations.vote * 1000;
  push(r);
  r.timer = setTimeout(() => resolveWerewolfVote(r), r.ww.durations.vote * 1000);
}

function resolveWerewolfVote(r) {
  if (!r.ww || r.phase !== 'question' || r.ww.subPhase !== 'day_vote') return;
  clearTimeout(r.timer);
  const counts = new Map();
  for (const [, tid] of r.ww.votes) {
    if (!tid) continue;
    counts.set(tid, (counts.get(tid) || 0) + 1);
  }
  let topVotes = 0;
  let topIds = [];
  for (const [tid, c] of counts) {
    if (c > topVotes) {
      topVotes = c;
      topIds = [tid];
    } else if (c === topVotes) {
      topIds.push(tid);
    }
  }

  let vSummary = '';
  if (topIds.length === 1 && topVotes > 0) {
    const eliminated = r.players.get(topIds[0]);
    if (eliminated && eliminated.alive) {
      eliminated.alive = false;
      vSummary = `Oylama sonucu ${eliminated.name} (${eliminated.av}) ${topVotes} oyla elendi!`;
    }
  } else if (topIds.length > 1 && topVotes > 0) {
    vSummary = `Oylamada eşitlik (${topVotes} oy) çıktı; kimse elenmedi.`;
  } else {
    vSummary = `Oylama yapılmadı veya geçerli oy çıkmadı; kimse elenmedi.`;
  }

  r.ww.lastVoteSummary = vSummary;
  r.ww.history.push(`${r.ww.dayNum}. Gün Oylaması: ${vSummary}`);

  if (checkWerewolfWin(r)) return;

  r.ww.dayNum++;
  r.ww.subPhase = 'night';
  r.ww.history.push(`${r.ww.dayNum}. Gece başladı.`);
  r.deadline = Date.now() + r.ww.durations.night * 1000;
  push(r);
  r.timer = setTimeout(() => resolveWerewolfNight(r), r.ww.durations.night * 1000);
}

function initImposter(r) {
  const diff = getActiveDifficulty(r);
  const ps = [...r.players.values()];
  const impCount = clamp(r.cfg.imposterCount, 1, Math.max(1, Math.floor((ps.length - 1) / 2)), 1);

  const pool = filterByDiff(customCatalog.imposter, diff);
  const unused = pool.filter(x => !r.usedKeys.has('imp:' + x.common + ':' + x.imposter));
  const source = unused.length ? unused : pool;
  const pick = source[crypto.randomInt(source.length)];
  r.usedKeys.add('imp:' + pick.common + ':' + pick.imposter);

  const shuffledIds = shuffle(ps.map(p => p.id));
  const impSet = new Set(shuffledIds.slice(0, impCount));

  ps.forEach(p => {
    p.isImposter = impSet.has(p.id);
    p.secretWord = p.isImposter ? pick.imposter : pick.common;
  });

  const sec = diffSec(r.cfg.time || 30, diff);
  r.imp = {
    category: pick.c,
    commonWord: pick.common,
    imposterWord: pick.imposter,
    impCount,
    clues: [],
    votes: new Map(),
    subPhase: 'clues',
    guessAttempted: false,
    winnerSide: null,
  };
  r.phase = 'question';
  r.round = 1;
  r.deadline = Date.now() + sec * 1000;
  r.timer = setTimeout(() => {
    if (r.imp && r.phase === 'question') {
      r.imp.subPhase = 'vote';
      r.deadline = Date.now() + Math.max(15, Math.round(sec * 0.7)) * 1000;
      push(r);
      r.timer = setTimeout(() => resolveImposterVote(r), Math.max(15, Math.round(sec * 0.7)) * 1000);
    }
  }, sec * 1000);
}

function resolveImposterVote(r) {
  if (!r.imp || r.phase !== 'question') return;
  clearTimeout(r.timer);
  const tally = new Map();
  for (const [, tid] of r.imp.votes) {
    if (!tid) continue;
    tally.set(tid, (tally.get(tid) || 0) + 1);
  }
  let maxV = 0;
  let topIds = [];
  for (const [tid, c] of tally) {
    if (c > maxV) {
      maxV = c;
      topIds = [tid];
    } else if (c === maxV) {
      topIds.push(tid);
    }
  }
  const caught = topIds.length === 1 && maxV > 0 && r.players.get(topIds[0]) && r.players.get(topIds[0]).isImposter;
  if (caught) {
    if (r.cfg.imposterGuessBonus && !r.imp.guessAttempted) {
      r.imp.subPhase = 'guess_common';
      r.imp.caughtTargetId = topIds[0];
      r.deadline = Date.now() + 15000;
      push(r);
      r.timer = setTimeout(() => finalizeImposterResult(r, false), 15000);
      return;
    }
    finalizeImposterResult(r, true);
  } else {
    finalizeImposterResult(r, false);
  }
}

function finalizeImposterResult(r, crewWon) {
  if (!r.imp) return;
  clearTimeout(r.timer);
  r.imp.winnerSide = crewWon ? 'crew' : 'imposter';
  const rows = [];
  for (const p of r.players.values()) {
    const pts = crewWon ? (!p.isImposter ? 120 : 0) : (p.isImposter ? 150 : 0);
    p.score += pts;
    rows.push({
      n: p.name,
      av: p.av,
      v: (p.isImposter ? '🕵️ Imposter (' : '✅ Ortak (') + (p.secretWord || '') + ')',
      pts
    });
  }
  rows.sort((a, b) => b.pts - a.pts);
  r.rev = {
    v: `Ortak Kelime: ${r.imp.commonWord} · Imposter Kelimesi: ${r.imp.imposterWord}`,
    x: crewWon ? 'Normal oyuncular Imposter’ı yakaladı!' : 'Imposter izini kaybettirdi ve kazandı!',
    rows
  };
  r.phase = 'reveal';
  push(r);
  r.timer = setTimeout(() => finish(r), 7000);
}

const QCAT_BANK = { tf: 'TF_BANK', closest: 'CLOSEST_BANK', quiz: 'QUIZ_BANK', liar: 'LIAR_BANK', wyr: 'WYR_BANK', ml: 'ML_BANK', emoji: 'EMOJI_BANK' };
const gameCats = g => (g === 'pixel' ? pixelPool : bank[QCAT_BANK[g]] || []).map(x => x.c);
function sanitizeCats(arr, game) {
  if (!Array.isArray(arr)) return [];
  const ok = new Set(gameCats(game));
  return [...new Set(arr)].filter(x => typeof x === 'string' && ok.has(x)).slice(0, 20);
}
function byCat(pool, r) {
  const c = (r.cfg && r.cfg.cats) || [];
  const f = c.length ? pool.filter(i => c.includes(i.c)) : pool;
  return f.length ? f : pool;
}
function getPixelPool(r, diff) {
  const c = (r.cfg && r.cfg.cats) || [];
  const base = pixelPool.filter(x => !c.length || c.includes(x.c));
  const byD = base.filter(x => x.d === diff);
  return byD.length >= 6 ? byD : (base.length ? base : pixelPool);
}
function pickNonRepeating(pool, prefix, usedSet) {
  const fresh = pool.filter((item, idx) => {
    const identity = item.id || JSON.stringify(item) || String(idx);
    const key = prefix + ':' + identity;
    return !usedSet.has(key);
  });
  if (!fresh.length) pool.forEach((item, idx) => usedSet.delete(prefix + ':' + (item.id || item.t || idx)));
  const src = fresh.length ? fresh : pool;
  const chosen = src[crypto.randomInt(src.length)];
  const chosenIdx = pool.indexOf(chosen);
  usedSet.add(prefix + ':' + (chosen.id || JSON.stringify(chosen) || String(chosenIdx)));
  return chosen;
}


function beginPalavraVote(r) {
  if (!r || r.phase !== 'question' || r.game !== 'palavra' || !r.palavra || r.palavra.phase !== 'bluff') return;
  const entries = shuffle([{ text: r.palavra.real, owner: null }, ...[...r.palavra.fake.entries()].map(([owner, text]) => ({ text, owner }))]);
  r.palavra.options = entries.map(x => x.text);
  r.palavra.optionOwners = entries.map(x => x.owner);
  r.palavra.correctIndex = entries.findIndex(x => !x.owner);
  r.palavra.phase = 'vote';
  clearTimeout(r.timer);
  const sec = clamp(r.cfg.time, 10, 60, 20);
  r.deadline = Date.now() + sec * 1000;
  r.timer = setTimeout(() => reveal(r), sec * 1000 + 300);
  push(r);
}

function startRound(r) {
  clearTimeout(r.timer);
  const gameId = getActiveGameId(r);
  r.game = gameId;

  if (gameId === 'codenames') {
    initCodenames(r);
    push(r);
    return;
  }
  if (gameId === 'werewolf') {
    initWerewolf(r);
    push(r);
    return;
  }
  if (gameId === 'imposter') {
    initImposter(r);
    push(r);
    return;
  }

  r.round++;
  const diff = getActiveDifficulty(r);
  const baseSec = clamp(r.cfg.time, 10, 60, 20);
  const sec = gameId === 'wordle' ? Math.max(75, diffSec(baseSec, diff)) : diffSec(baseSec, diff);

  r.ans = new Map();
  r.phase = 'question';
  r.deadline = Date.now() + sec * 1000;
  r.activeSec = sec;

  if (gameId === 'tf') {
    const item = pickNonRepeating(byCat(filterByDiff(bank.TF_BANK, diff), r), 'tf', r.usedKeys);
    r.q = { t: item.t, o: ['Doğru', 'Yanlış'], v: item.v ? 0 : 1, x: item.x, c: item.c, u: '' };
  } else if (gameId === 'closest') {
    const item = pickNonRepeating(byCat(filterByDiff(bank.CLOSEST_BANK, diff), r), 'cl', r.usedKeys);
    r.q = { t: item.t, v: item.v, u: item.u || '', x: item.x, c: item.c };
  } else if (gameId === 'quiz') {
    const item = pickNonRepeating(byCat(filterByDiff(bank.QUIZ_BANK, diff), r), 'qz', r.usedKeys);
    r.q = { t: item.t, o: item.o, v: item.v, x: item.x, c: item.c, u: '' };
  } else if (gameId === 'liar') {
    const item = pickNonRepeating(byCat(filterByDiff(bank.LIAR_BANK, diff), r), 'lr', r.usedKeys);
    r.q = { t: item.t, o: item.o, v: item.v, x: item.x, c: item.c, u: '' };
  } else if (gameId === 'wyr') {
    const item = pickNonRepeating(byCat(filterByDiff(bank.WYR_BANK, diff), r), 'wr', r.usedKeys);
    r.q = { t: item.t, o: item.o, v: null, x: item.x, c: item.c, u: '' };
  } else if (gameId === 'ml') {
    const item = pickNonRepeating(byCat(filterByDiff(bank.ML_BANK, diff), r), 'ml', r.usedKeys);
    const opts = [...r.players.values()].map(p => `${p.av} ${p.name}`);
    r.q = { t: item.t, o: opts.length ? opts : ['Oyuncu 1', 'Oyuncu 2'], v: null, x: item.x, c: item.c, u: '' };
  } else if (gameId === 'emoji') {
    const item = pickNonRepeating(byCat(filterByDiff(bank.EMOJI_BANK, diff), r), 'em', r.usedKeys);
    r.q = { t: item.t, v: item.x, a: item.a, x: `Cevap: ${item.x}`, c: item.c, u: '' };
  } else if (['logo', 'celebrity', 'celebritytr', 'celebrityworld', 'footballer', 'clublogo', 'flag', 'universe'].includes(gameId)) {
    return startVisualRound(r, gameId, sec, diff);
  } else if (gameId === 'wordle') {
    const requested = clamp(r.cfg.wordLength, 4, 7, 5);
    const pool = (newGames.WORDS[diff] || newGames.WORDS.medium).filter(w => [...w].length === requested);
    const fallback = Object.values(newGames.WORDS).flat().filter(w => [...w].length === requested);
    const words = pool.length ? pool : fallback.length ? fallback : Object.values(newGames.WORDS).flat().filter(w => [...w].length >= 4 && [...w].length <= 7);
    const wordItem = pickNonRepeating(words.map(word => ({ id: 'wordle:' + word, word })), 'wd', r.usedKeys);
    const target = wordItem.word.toLocaleUpperCase('tr-TR');
    r.wordle = { target, guesses: new Map(), solved: new Map(), maxAttempts: 6 };
    r.q = { t: 'Herkes aynı gizli kelimeyi bulmaya çalışıyor!', c: `${[...target].length} harf · ${diff === 'easy' ? 'Kolay' : diff === 'hard' ? 'Zor' : 'Orta'}`, length: [...target].length };
  } else if (gameId === 'kelimelik') {
    const category = r.cfg.kelimeCategory || 'Tümü';
    const pool = newGames.KELIME_CATEGORIES[category] || (newGames.WORDS[diff] || newGames.WORDS.medium);
    const wordItem = pickNonRepeating(pool.map(word => ({ id: 'kelime:' + word, word })), 'kl', r.usedKeys);
    const target = wordItem.word.toLocaleUpperCase('tr-TR');
    const chars = [...target];
    r.kelimelik = { target, opened: 0, solved: new Map(), hints: shuffle(chars.map((ch, i) => ({ ch, i }))).slice(0, Math.max(1, Math.ceil(chars.length * .35))).map(x => x.i) };
    r.kelimelik.opened = r.kelimelik.hints.length;
    r.q = { t: 'Harfler açıldıkça kelimeyi ilk sen bul!', c: `${category === 'Tümü' ? 'Karışık kategori' : category} · Hızlı tahmin`, letters: chars.length, _answer: target, revealed: chars.map((ch, i) => r.kelimelik.hints.includes(i) ? ch : '＿') };
    const revealStep = () => {
      if (r.phase !== 'question' || r.game !== 'kelimelik' || !r.kelimelik) return;
      if (r.kelimelik.opened < chars.length) {
        const hidden = chars.map((_, i) => i).filter(i => !r.kelimelik.hints.includes(i));
        if (!hidden.length) return;
        const idx = hidden[crypto.randomInt(hidden.length)]; r.kelimelik.hints.push(idx); r.kelimelik.opened++;
        r.q.revealed[idx] = chars[idx]; push(r);
        r.kelimeHintTimer = setTimeout(revealStep, Math.max(2500, Math.floor(sec * 1000 / Math.max(2, chars.length - 1))));
      }
    };
    r.kelimeHintTimer = setTimeout(revealStep, Math.max(2500, Math.floor(sec * 1000 / Math.max(2, chars.length - 1))));
  } else if (gameId === 'bagdastirici') {
    const pool = newGames.CONNECTIONS.filter(x => x.d === diff);
    const item = pickNonRepeating(pool, 'bg', r.usedKeys);
    r.bag = { accepted: item.a.map(norm), answers: new Map(), judged: new Set(), manual: true };
    r.q = { t: 'Bu kelimeleri birleştiren ortak bağlantı nedir?', c: item.c, words: shuffle(item.w), u: '', x: '' };
  } else if (gameId === 'palavra') {
    const item = pickNonRepeating(newGames.BLUFF, 'bl', r.usedKeys);
    r.palavra = { real: item.a, fake: new Map(), votes: new Map(), phase: 'bluff', category: item.c, options: [], correctIndex: -1 };
    r.q = { t: item.q, c: item.c };
  } else if (gameId === 'survey') {
    const item = pickNonRepeating(newGames.SURVEYS, 'sv', r.usedKeys);
    r.survey = { options: item.o.map((x, i) => ({ text: x[0], points: x[1], rank: i })), question: item.q };
    r.q = { t: item.q, o: shuffle(item.o.map(x => x[0])), c: 'Oyun için hazırlanmış anket verisi · Gerçek araştırma değildir' };
    r.q.v = r.q.o.indexOf(item.o.slice().sort((a,b)=>b[1]-a[1])[0][0]);
    r.q.scores = Object.fromEntries(item.o.map(x => [x[0], x[1]]));
  } else if (gameId === 'bigger') {
    const pool = newGames.BIGGER.filter(x => x.c === (r.cfg.biggerCategory || x.c));
    const item = pickNonRepeating(pool.length ? pool : newGames.BIGGER, 'bggr', r.usedKeys);
    r.q = { t: `Hangisi daha büyük?`, o: [item.a, item.b], v: item.v, c: `${item.c} · Ölçüt: ${item.metric}`, x: item.x, u: '' };
  } else if (gameId === 'song' || gameId === 'film' || gameId === 'pixel') {
    return startMediaRound(r, gameId, sec, diff);
  }

  r.timer = setTimeout(() => { if (gameId === 'palavra' && r.palavra && r.palavra.phase === 'bluff') beginPalavraVote(r); else reveal(r); }, sec * 1000 + 400);
  push(r);
}

function personGender(item) {
  const female = new Set(['Taylor Swift','Sezen Aksu','Hadise','Hande Erçel','Aleyna Tilki','Demet Özdemir','Beren Saat','Fahriye Evcen','Şebnem Ferah','Angelina Jolie','Ariana Grande','Beyoncé','Rihanna','Billie Eilish','Scarlett Johansson','Zendaya','Shakira','Lady Gaga','Adele']);
  const male = new Set(['Tarkan','Cem Yılmaz','Şahan Gökbakar','Kenan İmirzalıoğlu','Kıvanç Tatlıtuğ','Murat Boz','Oğuzhan Koç','Engin Akyürek','Barış Arduç','Ezhel','Ceza','Sagopa Kajmer','Mabel Matiz','Aras Bulut İynemli','Burak Özçivit','Müslüm Gürses','Barış Manço','Leonardo DiCaprio','Cristiano Ronaldo','Lionel Messi','Dwayne Johnson','Tom Cruise','Brad Pitt','Eminem','Ed Sheeran','Robert Downey Jr.','Keanu Reeves','Johnny Depp','Kylian Mbappé','Michael Jackson','Jackie Chan']);
  const n = item && item.answer;
  return female.has(n) ? 'f' : male.has(n) ? 'm' : null;
}

async function startVisualRound(r, gameId, sec, diff) {
  const round = r.round;
  const token = (r.vtoken = (r.vtoken || 0) + 1);
  r.q = { loading: true, t: '⏳ Görsel hazırlanıyor…', c: '' };
  r.deadline = Date.now() + 45000;
  push(r);
  const alive = () => r.phase === 'question' && r.round === round && r.vtoken === token;
  const pools = { logo: visualGames.LOGOS, celebrity: [...visualGames.PEOPLE_TR, ...visualGames.PEOPLE_WORLD], celebritytr: visualGames.PEOPLE_TR, celebrityworld: visualGames.PEOPLE_WORLD, footballer: visualGames.FOOTBALLERS, clublogo: visualGames.CLUBS, flag: visualGames.FLAGS, universe: visualGames.UNIVERSE };
  const pool = pools[gameId];
  let item = null, image = null;
  for (let i = 0; i < Math.min(8, pool.length) && !image; i++) {
    item = pickNonRepeating(pool, 'vg-' + gameId, r.usedKeys);
    image = item.image || await media.resolveVisual(item);
    if (!alive()) return;
    if (image && ['celebrity','celebritytr','celebrityworld'].includes(gameId)) {
      const gender = personGender(item);
      if (gender) {
        const matching = pool.filter(x => x.id !== item.id && x.answer !== item.answer && personGender(x) === gender);
        if (matching.length < 3) image = null;
      }
    }
  }
  if (!item || (gameId !== 'universe' && !image)) {
    r.q = { t: 'Bu tur için görsel yüklenemedi; sonraki tura geçiliyor.', o: ['Tamam', 'Geç'], v: 0, c: 'Görsel kaynağı' };
    push(r); r.timer = setTimeout(() => reveal(r), 1800); return;
  }
  if (gameId === 'universe') {
    r.q = { t: item.t, o: shuffle(item.o.map((x,i)=>({x,i}))).map(x=>x.x), v: 0, x: item.x, c: item.c };
    // Preserve correct answer after shuffling.
    const correct = item.o[item.v]; r.q.v = r.q.o.indexOf(correct);
  } else {
    const correct = item.answer;
    let candidates = pool.filter(x => x.id !== item.id && x.answer !== correct);
    if (['celebrity','celebritytr','celebrityworld'].includes(gameId)) {
      const gender = personGender(item);
      if (gender) candidates = candidates.filter(x => personGender(x) === gender);
      // Do not show mixed-gender or generic filler options. Try another person if this pool is too small.
      if (candidates.length < 3) {
        r.q = { t: 'Bu tur için yeterli tutarlı seçenek bulunamadı; sonraki tura geçiliyor.', o: ['Tamam', 'Geç'], v: 0, c: 'Seçenek havuzu' };
        push(r); r.timer = setTimeout(() => reveal(r), 1500); return;
      }
    }
    const distractors = shuffle([...new Set(candidates.map(x => x.answer).filter(Boolean))]).slice(0, 3);
    const opts = shuffle([...new Set([correct, ...distractors])]);
    r.q = { t: item.t, image, o: opts, v: opts.indexOf(correct), x: `Doğru cevap: ${correct}`, c: item.c };
  }
  r.activeSec = sec; r.deadline = Date.now() + sec * 1000;
  r.timer = setTimeout(() => reveal(r), sec * 1000 + 300);
  push(r);
}

const FRAME_PTS = [100, 80, 60, 40, 20];

async function startMediaRound(r, gameId, sec, diff) {
  const round = r.round;
  const token = (r.mtoken = (r.mtoken || 0) + 1);
  r.penaltyUntil = new Map();
  r.q = { loading: true, t: gameId === 'song' ? '⏳ Şarkı hazırlanıyor…' : '⏳ Sahne hazırlanıyor…', c: '', u: '' };
  r.deadline = Date.now() + 60000;
  push(r);
  const alive = () => r.phase === 'question' && r.round === round && r.mtoken === token;
  const pool = gameId === 'song' ? getFilteredMusic(r, diff) : gameId === 'pixel' ? getPixelPool(r, diff) : getFilteredFilms(r, diff);
  let q = null;
  for (let i = 0; i < 6 && !q; i++) {
    const item = pickNonRepeating(pool, gameId === 'song' ? 'sg' : gameId === 'pixel' ? 'px' : 'fm', r.usedKeys);
    let res = null;
    try { res = gameId === 'song' ? await media.resolveSong(item) : gameId === 'pixel' ? await media.resolvePixel(item) : await media.resolveFilm(item, 5, r.usedSceneUrls || (r.usedSceneUrls = new Set())); } catch (e) { res = null; }
    if (!alive()) return;
    if (!res) continue;
    if (gameId === 'song') {
      const choices = buildSongChoices(item);
      if (!choices) continue;
      const clipSec = Math.min(sec, 28);
      q = {
        t: '🎵 Şarkıyı dinle ve doğru şarkıyı seç!', c: item.genres[0] || 'Müzik', u: '',
        songId: item.id, artist: item.artist, title: item.title, audio: res, clipSec,
        o: choices.options, correctIndex: choices.correctIndex,
        seek: crypto.randomInt(Math.max(1, 29 - clipSec)), playAt: Date.now() + 3000
      };
    } else if (gameId === 'pixel') {
      const stepMs = Math.max(900, Math.floor((sec * 1000) / 7));
      q = {
        t: '🧩 Pikseller açıldıkça kim olduğunu bul!', c: item.c, u: '',
        filmId: item.id, title: item.name, year: '', answers: item.ans,
        scenes: [10, 18, 30, 54, 0].map((cells, k) => ({ label: 'Seviye ' + (k + 1), img: res[k], cells })),
        sceneIndex: 0, stepMs, nextAt: Date.now() + 1000 + stepMs
      };
    } else {
      // Film oyunu: doğrulanmış film eşleşmesinden 3 ayrı TMDB backdrop kademeli gösterilir.
      const scenesList = res.slice(0, 5).map((img, k) => ({ label: `Kare ${k + 1}`, img }));
      q = {
        t: '🎬 Filmden kareleri gör ve filmi tahmin et!', c: item.categories[0] || 'Sinema', u: '',
        filmId: item.id, title: item.title, year: item.year, answers: item.answers || [item.title],
        scenes: scenesList, sceneIndex: 0, stepMs: Math.max(4500, Math.floor(sec * 1000 / Math.max(1, scenesList.length))), nextAt: 0
      };
    }
  }
  if (!q) {
    r.q = { t: gameId === 'film' ? '⚠️ Bu film için sahne görseli bulunamadı; tur atlanıyor.' : '⚠️ Medya kaynağı bulunamadı; tur atlanıyor.', c: '', u: '', title: 'Kaynak bulunamadı', artist: '-', year: '-', scenes: [], sceneIndex: 0, answers: [] };
    push(r);
    r.timer = setTimeout(() => reveal(r), 2000);
    return;
  }
  const lead = 3000;
  r.q = q;
  r.activeSec = sec;
  r.deadline = Date.now() + lead + sec * 1000;
  if (gameId === 'film' || gameId === 'pixel') {
    clearTimeout(r.sceneTimer);
    r.sceneTimer = setTimeout(function step() {
      if (!alive() || !r.q.scenes) return;
      if (r.q.sceneIndex < r.q.scenes.length - 1) {
        r.q.sceneIndex++;
        r.q.nextAt = r.q.sceneIndex < r.q.scenes.length - 1 ? Date.now() + r.q.stepMs : 0;
        push(r);
        if (r.q.nextAt) r.sceneTimer = setTimeout(step, r.q.stepMs);
      }
    }, lead + (gameId === 'pixel' ? 1000 : q.stepMs));
  }
  r.timer = setTimeout(() => reveal(r), lead + sec * 1000 + 400);
  push(r);
}

function reveal(r) {
  if (r.phase !== 'question') return;
  clearTimeout(r.timer);
  clearTimeout(r.sceneTimer);
  clearTimeout(r.kelimeHintTimer);

  const g = r.game;
  const q = r.q || {};
  let rows = [];
  let cnt = null;
  let revVal = q.v != null ? q.v : null;
  let revExtra = q.x || '';

  if (g === 'wordle' && r.wordle) {
    const solved = [...r.wordle.solved.entries()].sort((a,b) => a[1].time - b[1].time);
    solved.forEach(([pid, data], idx) => { const p = r.players.get(pid); if (!p) return; const pts = Math.max(50, 220 - idx * 35 - (data.attempt - 1) * 10); givePoints(r,p,pts); rows.push({n:p.name,av:p.av,v:`${data.attempt}. denemede`,pts}); });
    for (const p of r.players.values()) if (!r.wordle.solved.has(p.id)) rows.push({n:p.name,av:p.av,v:'Bulamadı',pts:0});
    revVal = r.wordle.target; revExtra = 'Yeşil: doğru harf ve konum · Sarı: kelimede var · Gri: kelimede yok';
  } else if (g === 'kelimelik' && r.kelimelik) {
    const solved = [...r.kelimelik.solved.entries()].sort((a,b) => a[1].time - b[1].time);
    solved.forEach(([pid, data], idx) => { const p = r.players.get(pid); if (!p) return; const pts = Math.max(25, 180 - idx * 30 - (r.kelimelik.opened - 1) * 8); givePoints(r,p,pts); rows.push({n:p.name,av:p.av,v:data.answer,pts}); });
    revVal = r.kelimelik.target; revExtra = 'İlk doğru bilen en yüksek puanı aldı.';
  } else if (g === 'bagdastirici' && r.bag) {
    for (const [pid,a] of r.bag.answers) { const p=r.players.get(pid); if(!p) continue; const accepted=r.bag.judged.has(pid); const pts=accepted?100:0; if(pts) givePoints(r,p,pts); rows.push({n:p.name,av:p.av,v:a.v,pts}); }
    revVal = r.bag.accepted.join(' · '); revExtra = 'Oda sahibi tarafından kabul edilen cevaplar puan kazandı.';
  } else if (g === 'palavra' && r.palavra) {
    const tally = new Map();
    for (const [pid,idx] of r.palavra.votes) { const fakeOwner = r.palavra.optionOwners[idx]; if (fakeOwner) tally.set(fakeOwner,(tally.get(fakeOwner)||0)+1); if (idx === r.palavra.correctIndex) { const p=r.players.get(pid); if(p){givePoints(r,p,100); rows.push({n:p.name,av:p.av,v:'Gerçek cevabı buldu',pts:100});} } }
    for (const [pid] of r.palavra.fake) { const p=r.players.get(pid); if(!p) continue; const fooled=tally.get(pid)||0; const pts=fooled*50; if(pts) givePoints(r,p,pts); rows.push({n:p.name,av:p.av,v:`${fooled} kişi cevabına inandı`,pts}); }
    r.palavra.results = r.palavra.options.map((text,i)=>({text,real:i===r.palavra.correctIndex,owner:r.palavra.optionOwners[i] ? (r.players.get(r.palavra.optionOwners[i])||{}).name : null}));
    revVal = r.palavra.real; revExtra = 'Gerçek cevap ve anonim oyuncu cevapları açıldı.';
  } else if (g === 'survey') {
    cnt = Array((q.o || []).length).fill(0);
    const scoreByText = q.scores || {};
    for (const [pid,a] of r.ans) { const p=r.players.get(pid); if(!p) continue; const text=q.o[a.v]; const pts=clamp(scoreByText[text],0,100,0)*2; givePoints(r,p,pts); cnt[a.v]++; rows.push({n:p.name,av:p.av,v:a.v,pts}); }
    revVal = null; revExtra = 'Oyun için hazırlanmış anket puanlarıdır; gerçek anket sonucu değildir.';
  } else if (g === 'tf' || g === 'quiz' || g === 'liar' || g === 'bigger' || ['logo','celebrity','celebritytr','celebrityworld','footballer','clublogo','flag','universe'].includes(g)) {
    cnt = Array((q.o || []).length).fill(0);
    revVal = ['logo','celebrity','celebritytr','celebrityworld','footballer','clublogo','flag','universe'].includes(g) ? (q.o && q.o[q.v] != null ? q.o[q.v] : null) : g === 'bigger' ? q.v : null;
    revExtra = q.x || '';
    for (const [pid, a] of r.ans) {
      const p = r.players.get(pid);
      if (!p) continue;
      if (typeof a.v === 'number' && cnt[a.v] != null) cnt[a.v]++;
      const ok = a.v === q.v;
      const ratio = Math.max(0, (r.deadline - a.t) / ((r.activeSec || 20) * 1000));
      const pts = ok ? 200 + Math.round(250 * ratio) + speedBonus(r, a, 100) : 0;
      givePoints(r, p, pts);
      rows.push({ n: p.name, av: p.av, c: r.mode === 'team' && p.team != null ? r.teams[p.team].color : null, v: a.v, pts });
    }
  } else if (g === 'wyr' || g === 'ml') {
    cnt = Array((q.o || []).length).fill(0);
    for (const [, a] of r.ans) {
      if (typeof a.v === 'number' && cnt[a.v] != null) cnt[a.v]++;
    }
    let maxC = 0;
    for (const c of cnt) if (c > maxC) maxC = c;
    const majSet = new Set();
    cnt.forEach((c, idx) => { if (maxC > 0 && c === maxC) majSet.add(idx); });
    for (const [pid, a] of r.ans) {
      const p = r.players.get(pid);
      if (!p) continue;
      const pts = (majSet.has(a.v) ? 100 : 25) + speedBonus(r, a, 100);
      givePoints(r, p, pts);
      rows.push({ n: p.name, av: p.av, c: r.mode === 'team' && p.team != null ? r.teams[p.team].color : null, v: a.v, pts });
    }
    revVal = null;
  } else if (g === 'closest') {
    const v = q.v;
    const L = [...r.ans].map(([k, a]) => ({ k, a, d: Math.abs(a.v - v) })).sort((x, y) => x.d - y.d);
    const ds = [...new Set(L.map(x => x.d))];
    rows = L.map(x => {
      const rk = ds.indexOf(x.d);
      const base = rk === 0 ? 200 : rk === 1 ? 120 : rk === 2 ? 70 : 25;
      const speed = Math.max(0, Math.round(60 * (1 - (x.a.t - r.startedAt || 0) / Math.max(1, (r.activeSec || 20) * 1000))));
      const pts = base + speed;
      if (x.k[0] === 't') {
        const tm = r.teams[+x.k.slice(1)];
        if (tm) tm.score += pts;
        return { n: tm ? tm.name : 'Takım', av: '🏳️', c: tm ? tm.color : null, v: x.a.v, pts };
      }
      const p = r.players.get(x.k);
      if (!p) return null;
      p.score += pts;
      return { n: p.name, av: p.av, v: x.a.v, pts };
    }).filter(Boolean);
  } else if (g === 'emoji' || g === 'song' || g === 'film' || g === 'pixel') {
    const corr = [...r.ans.entries()]
      .filter(([, a]) => a.ok)
      .sort((a, b) => a[1].t - b[1].t);
    const rankPts = [250, 170, 120, 80, 50];
    corr.forEach(([pid, a], idx) => {
      const p = r.players.get(pid);
      if (!p) return;
      const pts = ((g === 'film' || g === 'pixel') ? (FRAME_PTS[a.fi] != null ? FRAME_PTS[a.fi] : 20) : (rankPts[idx] != null ? rankPts[idx] : 25)) + speedBonus(r, a, 100);
      givePoints(r, p, pts);
      rows.push({ n: p.name, av: p.av, c: r.mode === 'team' && p.team != null ? r.teams[p.team].color : null, v: a.v, pts });
    });
    for (const [pid, a] of r.ans) {
      if (!a.ok) {
        const p = r.players.get(pid);
        if (p) rows.push({ n: p.name, av: p.av, c: null, v: a.v, pts: 0 });
      }
    }
    if (g === 'song') {
      revVal = `${q.title} — ${q.artist}`;
      revExtra = `Tür: ${q.c}`;
    } else if (g === 'pixel') {
      revVal = q.title;
      revExtra = `Açılan seviye: ${q.sceneIndex + 1}/${q.scenes.length}`;
    } else if (g === 'film') {
      revVal = `${q.title} (${q.year})`;
      revExtra = `Açılan kare: ${q.sceneIndex + 1}/${q.scenes.length}`;
    }
  }

  rows.sort((a, b) => b.pts - a.pts);
  r.rev = { v: revVal, cnt, x: revExtra, rows, surveyRanks: g === 'survey' ? Object.entries(q.scores || {}).map(([text,points])=>({text,points})).sort((a,b)=>b.points-a.points) : null };
  r.phase = 'reveal';

  let nextAction = () => finish(r);
  if (r.mix && r.mix.active) {
    const perGame = r.mix.roundsPerGame || 2;
    const totalSteps = r.mix.games.length * perGame;
    r.mix.completedRounds++;
    if (r.mix.completedRounds >= totalSteps) {
      nextAction = () => finish(r);
    } else {
      r.mix.step = Math.floor(r.mix.completedRounds / perGame) % r.mix.games.length;
      nextAction = () => startRound(r);
    }
  } else {
    nextAction = () => (r.cfg.rounds && r.round >= r.cfg.rounds ? finish(r) : startRound(r));
  }

  push(r);
  r.timer = setTimeout(nextAction, g === 'bagdastirici' ? 15000 : 6500);
}

function finish(r) {
  if (r.phase === 'end') return;
  clearTimeout(r.timer);
  clearTimeout(r.sceneTimer);
  clearTimeout(r.kelimeHintTimer);
  r.phase = 'end';
  for (const p of r.players.values()) {
    const gamePts = r.mode === 'team' && p.team != null && r.teams[p.team] ? r.teams[p.team].score : p.score;
    p.night += gamePts;
  }
  push(r);
}

function toLobby(r) {
  clearTimeout(r.timer);
  clearTimeout(r.sceneTimer);
  clearTimeout(r.kelimeHintTimer);
  r.phase = 'lobby';
  r.round = 0;
  r.cn = null;
  r.ww = null;
  r.imp = null;
  r.mix = null;
  r.q = null;
  r.rev = null;
  r.teams = [];
  r.mode = 'solo';
  for (const p of r.players.values()) {
    p.score = 0;
    p.team = null;
    p.spymaster = false;
    p.role = null;
    p.alive = true;
    p.isImposter = false;
    p.secretWord = null;
    p.ready = false;
  }
  push(r);
}

function leave(r, p) {
  r.players.delete(p.id);
  if (!r.players.size) {
    clearTimeout(r.timer);
    clearTimeout(r.sceneTimer);
    rooms.delete(r.code);
    return;
  }
  if (r.host === p.id) {
    const nextHost = [...r.players.values()].find(x => x.on) || [...r.players.values()][0];
    r.host = nextHost.id;
  }
  if (r.phase === 'question' && allDone(r)) reveal(r);
  else push(r);
}

function addPlayer(r, name, s) {
  const used = new Set([...r.players.values()].map(p => p.av));
  const p = {
    id: 'p' + ++r.seq,
    key: crypto.randomBytes(12).toString('hex'),
    name: clean(name, 12) || 'Oyuncu',
    av: AV.find(a => !used.has(a)) || '🎉',
    sid: s.id,
    on: true,
    off: 0,
    ready: false,
    team: null,
    spymaster: false,
    role: null,
    alive: true,
    isImposter: false,
    secretWord: null,
    score: 0,
    night: 0
  };
  r.players.set(p.id, p);
  s.data.code = r.code;
  s.data.id = p.id;
  return p;
}

function buildView(r, p) {
  const base = {
    code: r.code,
    me: p.id,
    host: r.host,
    phase: r.phase,
    game: r.game,
    mode: r.mode,
    cfg: {
      difficulty: getActiveDifficulty(r),
      rounds: r.cfg.rounds,
      time: r.cfg.time,
      teams: r.cfg.teams,
      imposterCount: r.cfg.imposterCount || 1,
      imposterGuessBonus: Boolean(r.cfg.imposterGuessBonus),
      wordLength: r.cfg.wordLength || 5,
      biggerCategory: r.cfg.biggerCategory || '',
      kelimeCategory: r.cfg.kelimeCategory || 'Tümü',
    },
    round: r.round,
    teams: r.teams,
    players: [...r.players.values()].map(x => ({
      id: x.id,
      name: x.name,
      av: x.av,
      team: x.team,
      spymaster: Boolean(x.spymaster),
      alive: x.alive !== false,
      score: x.score,
      night: x.night,
      ready: x.ready,
      on: x.on,
      done: r.phase === 'question' && r.ans && r.ans.has(akey(r, x))
    })),
    left: r.phase === 'question' ? Math.max(0, r.deadline - Date.now()) : 0,
    mine: r.phase === 'question' && r.ans && r.ans.has(akey(r, p)),
    rev: r.phase === 'reveal' ? r.rev : null,
    mix: r.mix && r.mix.active ? {
      active: true,
      games: r.mix.games,
      currentGame: getActiveGameId(r),
      nextGame: r.mix.games[(r.mix.step + 1) % r.mix.games.length],
      completedRounds: r.mix.completedRounds,
      totalRounds: r.mix.games.length * r.mix.roundsPerGame,
      roundsPerGame: r.mix.roundsPerGame
    } : null,
  };

  if (r.phase === 'question' || r.phase === 'reveal') {
    if (r.game === 'codenames' && r.cn) {
      base.cn = {
        turnTeam: r.cn.turnTeam,
        clue: r.cn.clue,
        guessesLeft: r.cn.guessesLeft,
        redLeft: r.cn.redLeft,
        blueLeft: r.cn.blueLeft,
        winnerTeam: r.cn.winnerTeam,
        reason: r.cn.reason,
        log: r.cn.log.slice(-8),
        isSpymaster: Boolean(p.spymaster),
        myTeam: p.team,
        cards: r.cn.cards.map(c => ({
          idx: c.idx,
          word: c.word,
          revealed: c.revealed,
          byTeam: c.byTeam,
          type: (c.revealed || p.spymaster) ? c.type : undefined
        }))
      };
      base.q = { t: `Codenames · ${r.cn.turnTeam === 0 ? 'Kırmızı' : 'Mavi'} Takım Sırası`, c: '5x5 Kelime Tahtası' };
    } else if (r.game === 'werewolf' && r.ww) {
      let detectiveResult = null;
      if (p.role === 'detective' && r.ww.nightActions.detectiveCheck) {
        const target = r.players.get(r.ww.nightActions.detectiveCheck);
        if (target) {
          detectiveResult = `${target.name}: ${target.role === 'werewolf' ? '🐺 VAMPİR' : '🏡 VAMPİR DEĞİL'}`;
        }
      }
      base.ww = {
        dayNum: r.ww.dayNum,
        subPhase: r.ww.subPhase,
        myRole: p.role,
        alive: p.alive,
        lastNightSummary: r.ww.lastNightSummary,
        lastVoteSummary: r.ww.lastVoteSummary,
        winner: r.ww.winner,
        history: r.ww.history.slice(-10),
        detectiveResult,
        votedCount: r.ww.votes ? r.ww.votes.size : 0,
        myVote: r.ww.votes ? r.ww.votes.get(p.id) || null : null
      };
      base.q = {
        t: r.ww.subPhase === 'night' ? `🌙 ${r.ww.dayNum}. Gece` : r.ww.subPhase === 'day_discuss' ? `☀️ ${r.ww.dayNum}. Gün · Tartışma` : `🗳️ ${r.ww.dayNum}. Gün · Oylama`,
        c: 'Vampir Köylü'
      };
    } else if (r.game === 'imposter' && r.imp) {
      base.imp = {
        category: r.imp.category,
        subPhase: r.imp.subPhase,
        myWord: p.secretWord || '',
        isImposter: Boolean(p.isImposter),
        clues: r.imp.clues,
        votedCount: r.imp.votes ? r.imp.votes.size : 0,
        myVote: r.imp.votes ? r.imp.votes.get(p.id) || null : null,
        caughtTargetId: r.imp.caughtTargetId || null
      };
      base.q = { t: `🕵️ Gizli Kelime (${r.imp.category})`, c: 'Imposter' };
    } else if ((r.game === 'song' || r.game === 'film' || r.game === 'pixel') && r.q && r.q.loading) {
      base.q = { t: r.q.t, c: '', u: '', loading: true };
    } else if (r.game === 'song' && r.q) {
      base.q = {
        t: r.q.t,
        c: r.q.c,
        u: r.q.u || '',
        clipSec: r.q.clipSec,
        o: r.q.o,
        audio: r.q.audio,
        seek: r.q.seek,
        playAt: r.q.playAt,
        serverNow: Date.now(),
        penaltyLeft: (r.penaltyUntil && r.penaltyUntil.get(p.id)) ? Math.max(0, r.penaltyUntil.get(p.id) - Date.now()) : 0
      };
    } else if ((r.game === 'film' || r.game === 'pixel') && r.q) {
      const idx = Math.min(r.q.sceneIndex || 0, r.q.scenes.length - 1);
      base.q = {
        t: r.q.t,
        c: r.q.c,
        u: r.q.u || '',
        sceneIndex: idx,
        serverNow: Date.now(),
        nextAt: r.q.nextAt || 0,
        penaltyLeft: (r.penaltyUntil && r.penaltyUntil.get(p.id)) ? Math.max(0, r.penaltyUntil.get(p.id) - Date.now()) : 0,
        totalScenes: r.q.scenes.length,
        unlockedScenes: r.q.scenes.slice(0, idx + 1)
      };
    } else if (['logo','celebrity','celebritytr','celebrityworld','footballer','clublogo','flag','universe'].includes(r.game) && r.q && r.q.loading) {
      base.q = { t: r.q.t, c: r.q.c || '', loading: true };
    } else if (['logo','celebrity','celebritytr','celebrityworld','footballer','clublogo','flag','universe'].includes(r.game) && r.q) {
      base.q = { t: r.q.t, c: r.q.c, o: r.q.o, image: r.q.image || '', x: r.phase === 'reveal' ? (r.q.x || '') : '' };
    } else if (r.game === 'wordle' && r.q && r.wordle) {
      base.wordle = { length: r.q.length, maxAttempts: r.wordle.maxAttempts, guesses: r.wordle.guesses.get(p.id) || [], solved: r.wordle.solved.has(p.id), solvedCount: r.wordle.solved.size, playerCount: r.players.size };
      base.q = { t: r.q.t, c: r.q.c, length: r.q.length };
    } else if (r.game === 'kelimelik' && r.q) {
      base.kelimelik = { revealed: r.q.revealed, solved: r.kelimelik ? r.kelimelik.solved.size : 0, playerCount: r.players.size, solvedMe: Boolean(r.kelimelik && r.kelimelik.solved.has(p.id)) };
      base.q = { t: r.q.t, c: r.q.c, letters: r.q.letters, revealed: r.q.revealed };
    } else if (r.game === 'bagdastirici' && r.q) {
      base.bag = { words: r.q.words, submitted: Boolean(r.bag && r.bag.answers.has(p.id)), submissions: r.phase === 'reveal' ? [...(r.bag ? r.bag.answers.entries() : [])].map(([pid,a]) => ({ pid, text:a.v, name:(r.players.get(pid)||{}).name, av:(r.players.get(pid)||{}).av, accepted:Boolean(r.bag.judged.has(pid)) })) : [], host: r.host === p.id };
      base.q = { t:r.q.t, c:r.q.c, words:r.q.words };
    } else if (r.game === 'palavra' && r.q && r.palavra) {
      const votePhase = r.palavra.phase === 'vote';
      base.palavra = { phase:r.palavra.phase, submitted:r.palavra.fake.has(p.id), voted:r.palavra.votes.has(p.id), options:votePhase ? r.palavra.options : [], voteCount:r.palavra.votes.size, playerCount:r.players.size, host:r.host === p.id, results:r.phase === 'reveal' ? r.palavra.results || [] : [] };
      base.q = { t:r.q.t, c:r.q.c };
    } else if (r.game === 'survey' && r.q) {
      base.q = { t:r.q.t, o:r.q.o, c:r.q.c, u:'' };
    } else if (r.q) {
      base.q = { t: r.q.t, o: r.q.o, c: r.q.c, u: r.q.u || '', x: r.q.x || '' };
    }
  }

  return base;
}

function push(r) {
  for (const p of r.players.values()) {
    if (p.on && p.sid) {
      io.to(p.sid).emit('s', buildView(r, p));
    }
  }
}

const partial = (full, g) => g.length >= Math.max(4, Math.ceil(full.length * 0.5)) && full.includes(g);
function checkTextGuessMatch(gameId, q, rawText) {
  const guess = norm(rawText);
  if (!guess) return false;
  if (gameId === 'emoji') {
    return (q.a || []).some(ans => { const x = norm(ans); return guess.includes(x) || partial(x, guess); });
  }
  if (gameId === 'song') {
    const t = norm(q.title);
    const a = norm(q.artist);
    return (t && (guess.includes(t) || partial(t, guess))) || (guess.includes(a) && guess.length > a.length + 2);
  }
  if (gameId === 'film' || gameId === 'pixel') {
    return (q.answers || []).some(ans => { const x = norm(ans); return x && (guess.includes(x) || partial(x, guess)); });
  }
  if (gameId === 'kelimelik') { const x = norm(q._answer); return Boolean(x && guess === x); }
  return false;
}

const srv = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];
  if (urlPath === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('ok');
  }
  if (urlPath === '/pixel-check' || urlPath === '/pixel-stats') {
    if (urlPath === '/pixel-check') media.pixelCheck(pixelPool);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ pool: pixelPool.length, ...media.pixelStats() }));
  }
  if (urlPath === '/media-status') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      ...media.mediaStatus(),
      musicCatalogCount: customCatalog.music.length,
      filmCatalogCount: customCatalog.films.length,
    }));
  }
  if (urlPath === '/catalog') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      musicCategories: customCatalog.musicCategories,
      artistsTr: customCatalog.artistsTr,
      artistsEn: customCatalog.artistsEn,
      musicCount: customCatalog.music.length,
      filmCategories: customCatalog.filmCategories,
      filmSeries: customCatalog.filmSeries,
      filmCount: customCatalog.films.length,
      visualCounts: { logos: visualGames.LOGOS.length, turkishCelebrities: visualGames.PEOPLE_TR.length, foreignCelebrities: visualGames.PEOPLE_WORLD.length, footballers: visualGames.FOOTBALLERS.length, clubLogos: visualGames.CLUBS.length, flags: visualGames.FLAGS.length, universe: visualGames.UNIVERSE.length },
      tmdb: media.hasTmdb(),
      qCats: Object.fromEntries(Object.keys(QCAT_BANK).map(g => [g, [...new Set(gameCats(g))]])),
      pixelCats: [...new Set(pixelPool.map(x => x.c))],
      pixelCount: pixelPool.length,
    }));
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'));
});

const io = new Server(srv, { pingInterval: 10000, pingTimeout: 8000, maxHttpBufferSize: 2e4 });

io.on('connection', s => {
  s.on('create', (name, cb) => {
    if (s.data.code || typeof cb !== 'function') return;
    const code = newCode();
    const r = {
      code,
      host: null,
      players: new Map(),
      seq: 0,
      phase: 'lobby',
      game: 'tf',
      mode: 'solo',
      cfg: {
        difficulty: 'medium',
        rounds: 5,
        time: 20,
        teams: 2,
        imposterCount: 1,
        imposterGuessBonus: true,
        wordLength: 5,
        kelimeCategory: 'Tümü',
        biggerCategory: '',
        musicFilter: sanitizeMusicFilter({}),
        filmFilter: sanitizeFilmFilter({}),
      },
      mix: null,
      teams: [],
      round: 0,
      ans: new Map(),
      usedKeys: new Set(),
      usedSceneUrls: new Set(),
      idle: Date.now()
    };
    rooms.set(code, r);
    const hostPlayer = addPlayer(r, name, s);
    r.host = hostPlayer.id;
    cb({ code: r.code, key: hostPlayer.key });
    push(r);
  });

  s.on('join', (code, name, cb) => {
    if (s.data.code || typeof cb !== 'function') return;
    const r = rooms.get(String(code || '').toUpperCase().trim());
    if (!r) return cb({ err: 'Oda bulunamadı. Kodu kontrol et.' });
    if (r.players.size >= 10) return cb({ err: 'Oda dolu (10/10).' });
    if (r.phase !== 'lobby') return cb({ err: 'Oyun başladı. Bir sonraki oyunu bekle.' });
    const p = addPlayer(r, name, s);
    cb({ code: r.code, key: p.key });
    push(r);
  });

  s.on('rejoin', (code, key, cb) => {
    const r = rooms.get(String(code || '').toUpperCase().trim());
    const p = r && [...r.players.values()].find(x => x.key === key);
    if (!p || typeof cb !== 'function') return typeof cb === 'function' && cb({ err: 1 });
    p.sid = s.id;
    p.on = true;
    p.off = 0;
    s.data.code = r.code;
    s.data.id = p.id;
    cb({ ok: 1 });
    push(r);
  });

  s.on('ready', () => {
    const [r, p] = me(s);
    if (r && r.phase === 'lobby') {
      p.ready = !p.ready;
      push(r);
    }
  });

  s.on('catalog:add', (payload, cb) => {
    const [r, p] = me(s);
    if (!r || r.host !== p.id || !payload || typeof payload !== 'object') {
      return typeof cb === 'function' && cb({ ok: false, err: 'Yetkisiz işlem.' });
    }
    const kind = payload.kind;
    if (kind === 'artist') {
      const n = clean(payload.name, 40);
      if (!n) return typeof cb === 'function' && cb({ ok: false, err: 'Sanatçı adı gerekli.' });
      if (payload.region === 'en') {
        if (!customCatalog.artistsEn.includes(n)) customCatalog.artistsEn.push(n);
      } else {
        if (!customCatalog.artistsTr.includes(n)) customCatalog.artistsTr.push(n);
      }
      return typeof cb === 'function' && cb({ ok: true });
    }
    if (kind === 'series') {
      const n = clean(payload.name, 50);
      if (n && !customCatalog.filmSeries.includes(n)) customCatalog.filmSeries.push(n);
      return typeof cb === 'function' && cb({ ok: true });
    }
    if (kind === 'song') {
      const title = clean(payload.title, 60);
      const artist = clean(payload.artist, 50);
      if (!title || !artist) return typeof cb === 'function' && cb({ ok: false, err: 'Şarkı adı ve sanatçı zorunlu.' });
      const genre = clean(payload.genre, 30) || 'Karışık';
      const year = clamp(payload.year, 1950, 2026, 2020);
      const diff = ['easy', 'medium', 'hard'].includes(payload.difficulty) ? payload.difficulty : 'medium';
      customCatalog.music.push({
        id: 'm_custom_' + Date.now(),
        title,
        artist,
        lang: payload.lang === 'en' ? 'en' : 'tr',
        genres: [genre, 'Karışık'],
        decade: year >= 2020 ? "2020 ve sonrası" : year >= 2010 ? "2010'lar" : "2000'ler",
        year,
        d: diff,
        pop: 'high'
      });
      return typeof cb === 'function' && cb({ ok: true });
    }
    if (kind === 'film') {
      const title = clean(payload.title, 70);
      if (!title) return typeof cb === 'function' && cb({ ok: false, err: 'Film adı zorunlu.' });
      const year = clamp(payload.year, 1920, 2026, 2020);
      const cat = clean(payload.category, 30) || 'Hollywood';
      const diff = ['easy', 'medium', 'hard'].includes(payload.difficulty) ? payload.difficulty : 'medium';
      customCatalog.films.push({
        id: 'f_custom_' + Date.now(),
        title,
        year,
        region: cat === 'Türk Sineması' ? 'tr' : 'hollywood',
        categories: [cat, 'Yeni Filmler'],
        series: clean(payload.series, 50) || '',
        d: diff,
        pop: 'high',
        images: String(payload.images || '').split(/\s+/).filter(u => /^https:\/\/[^\s<>"']{6,300}$/i.test(u)).slice(0, 8),
        answers: [norm(title)]
      });
      return typeof cb === 'function' && cb({ ok: true });
    }
    return typeof cb === 'function' && cb({ ok: false, err: 'Bilinmeyen içerik türü.' });
  });

  s.on('start', c => {
    const [r, p] = me(s);
    if (!r || r.host !== p.id || r.phase !== 'lobby' || !c || typeof c !== 'object') return;

    const difficulty = ['easy', 'medium', 'hard'].includes(c.difficulty) ? c.difficulty : 'medium';
    const rounds = [5, 10, 15, 20, 25, 30, 40, 50, 0].includes(Number(c.rounds)) ? Number(c.rounds) : 5;
    const time = clamp(c.time, 10, 60, 20);
    const teamsCount = clamp(c.teams, 2, 4, 2);
    const imposterCount = clamp(c.imposterCount, 1, 3, 1);
    const wantsFilm = c.game === 'film' || (c.mixMode && Array.isArray(c.mixGames) && c.mixGames.includes('film'));
    if (wantsFilm && !media.hasTmdb()) s.emit('toast', 'Bilgi: TMDB_API_KEY tanımlı değil; Wikimedia Commons sahne yedeği kullanılıyor.');

    r.cfg = {
      difficulty,
      cats: sanitizeCats(c.cats, c.game),
      rounds,
      time,
      teams: teamsCount,
      imposterCount,
      imposterGuessBonus: c.imposterGuessBonus !== false,
      wwNight: clamp(c.wwNight, 10, 90, diffSec(25, difficulty)),
      wwDay: clamp(c.wwDay, 15, 180, 45),
      wwVote: clamp(c.wwVote, 10, 120, 25),
      musicFilter: sanitizeMusicFilter(c.musicFilter),
      filmFilter: sanitizeFilmFilter(c.filmFilter),
      wordLength: clamp(c.wordLength, 4, 7, 5),
      kelimeCategory: ['Tümü','İsim','Şehir','Ülke','Film','Sanatçı','Nesne'].includes(c.kelimeCategory) ? c.kelimeCategory : 'Tümü',
      biggerCategory: ['Coğrafya','Hayvanlar','Bilim','Tarih','Spor','Film','Müzik','Genel kültür'].includes(c.biggerCategory) ? c.biggerCategory : '',
    };

    const ps = [...r.players.values()];
    for (const x of ps) {
      x.score = 0;
      x.team = null;
      x.spymaster = false;
      x.role = null;
      x.alive = true;
      x.isImposter = false;
      x.secretWord = null;
    }
    r.teams = [];
    r.cn = null;
    r.ww = null;
    r.imp = null;
    r.mix = null;

    if (c.mixMode && Array.isArray(c.mixGames)) {
      const validMix = [...new Set(c.mixGames)]
        .filter(gid => MIX_ALLOWED.has(gid) && !MIX_FORBIDDEN.has(gid))
        .slice(0, 8);
      if (validMix.length < 2) return s.emit('toast', 'Karma Mod için en az 2 oyun seçmelisin.');
      if (validMix.length >= 2) {
        const perGame = clamp(c.mixRoundsPerGame, 1, 5, 2);
        r.mix = {
          active: true,
          games: validMix,
          step: 0,
          roundsPerGame: perGame,
          completedRounds: 0
        };
        r.game = validMix[0];
        r.mode = 'solo';
        r.round = 0;
        startRound(r);
        return;
      }
    }

    const reqGame = ALL_GAMES.has(c.game) ? c.game : 'tf';
    r.game = reqGame;

    if (reqGame === 'codenames') {
      r.round = 0;
      startRound(r);
      return;
    }

    if (reqGame === 'werewolf' || reqGame === 'imposter') {
      r.mode = 'solo';
      r.round = 0;
      startRound(r);
      return;
    }

    const n = Math.min(teamsCount, ps.length);
    r.mode = c.mode === 'team' && n >= 2 ? 'team' : 'solo';
    if (r.mode === 'team') {
      r.teams = TEAMS.slice(0, n).map(([name, color]) => ({ name, color, score: 0 }));
      shuffle(ps).forEach((x, i) => {
        x.team = i % n;
      });
    }

    r.round = 0;
    startRound(r);
  });

  s.on('cn:swap_spy', () => {
    const [r, p] = me(s);
    if (!r || r.host !== p.id || r.phase !== 'question' || r.game !== 'codenames' || !r.cn) return;
    [0, 1].forEach(tIdx => {
      const teamPlayers = [...r.players.values()].filter(x => x.team === tIdx);
      if (teamPlayers.length >= 2) {
        const curIdx = teamPlayers.findIndex(x => x.spymaster);
        teamPlayers.forEach(x => { x.spymaster = false; });
        const nextIdx = (curIdx + 1) % teamPlayers.length;
        teamPlayers[nextIdx].spymaster = true;
      }
    });
    r.cn.log.push('Oda sahibi takım liderlerini güncelledi.');
    push(r);
  });

  s.on('cn:clue', payload => {
    const [r, p] = me(s);
    if (!r || r.phase !== 'question' || r.game !== 'codenames' || !r.cn || r.cn.winnerTeam != null) return;
    if (!p.spymaster || p.team !== r.cn.turnTeam || r.cn.clue) return;
    if (!payload || typeof payload !== 'object') return;
    const word = clean(payload.word, 24).toUpperCase();
    const count = clamp(payload.count, 1, 9, 1);
    if (!word) return;
    r.cn.clue = { word, count, by: p.name };
    r.cn.guessesLeft = count + 1;
    r.cn.log.push(`${p.name} (${p.team === 0 ? 'Kırmızı' : 'Mavi'} Lider) ipucu verdi: "${word}" · ${count}`);
    push(r);
  });

  s.on('cn:pick', idx => {
    const [r, p] = me(s);
    if (!r || r.phase !== 'question' || r.game !== 'codenames' || !r.cn || r.cn.winnerTeam != null) return;
    if (p.spymaster || p.team !== r.cn.turnTeam || !r.cn.clue || r.cn.guessesLeft <= 0) return;
    const card = r.cn.cards[+idx];
    if (!card || card.revealed) return;

    card.revealed = true;
    card.byTeam = p.team;
    if (card.type === 'red') r.cn.redLeft = Math.max(0, r.cn.redLeft - 1);
    if (card.type === 'blue') r.cn.blueLeft = Math.max(0, r.cn.blueLeft - 1);

    const mySide = p.team === 0 ? 'red' : 'blue';
    const oppTeam = p.team === 0 ? 1 : 0;

    if (card.type === 'assassin') {
      r.cn.winnerTeam = oppTeam;
      r.cn.reason = `${p.name} SİYAH KART ("${card.word}") seçti! ${oppTeam === 0 ? 'Kırmızı' : 'Mavi'} takım kazandı.`;
      r.cn.log.push(r.cn.reason);
      if (r.teams[oppTeam]) r.teams[oppTeam].score += 150;
      finish(r);
      return;
    }

    if (r.cn.redLeft === 0 || r.cn.blueLeft === 0) {
      const winT = r.cn.redLeft === 0 ? 0 : 1;
      r.cn.winnerTeam = winT;
      r.cn.reason = `Tüm kelimeler bulundu! ${winT === 0 ? 'Kırmızı' : 'Mavi'} takım kazandı.`;
      r.cn.log.push(r.cn.reason);
      if (r.teams[winT]) r.teams[winT].score += 150;
      finish(r);
      return;
    }

    if (card.type === mySide) {
      if (r.teams[p.team]) r.teams[p.team].score += 25;
      r.cn.guessesLeft--;
      r.cn.log.push(`${p.name} doğru kartı buldu: "${card.word}".`);
      if (r.cn.guessesLeft <= 0) {
        r.cn.clue = null;
        r.cn.turnTeam = oppTeam;
        r.cn.log.push(`Tahmin hakkı bitti; sıra ${oppTeam === 0 ? 'Kırmızı' : 'Mavi'} takıma geçti.`);
      }
    } else if (card.type === 'neutral') {
      r.cn.clue = null;
      r.cn.guessesLeft = 0;
      r.cn.turnTeam = oppTeam;
      r.cn.log.push(`${p.name} tarafsız kart ("${card.word}") seçti; sıra karşı takıma geçti.`);
    } else {
      if (r.teams[oppTeam]) r.teams[oppTeam].score += 35;
      r.cn.clue = null;
      r.cn.guessesLeft = 0;
      r.cn.turnTeam = oppTeam;
      r.cn.log.push(`${p.name} rakip kart ("${card.word}") seçti; rakip +35 puan aldı ve sıra geçti.`);
    }
    push(r);
  });

  s.on('cn:end_turn', () => {
    const [r, p] = me(s);
    if (!r || r.phase !== 'question' || r.game !== 'codenames' || !r.cn || r.cn.winnerTeam != null) return;
    if (p.team !== r.cn.turnTeam) return;
    r.cn.clue = null;
    r.cn.guessesLeft = 0;
    r.cn.turnTeam = r.cn.turnTeam === 0 ? 1 : 0;
    r.cn.log.push(`Sıra devredildi → ${r.cn.turnTeam === 0 ? 'Kırmızı' : 'Mavi'} takım.`);
    push(r);
  });

  s.on('ww:night_action', targetId => {
    const [r, p] = me(s);
    if (!r || r.phase !== 'question' || r.game !== 'werewolf' || !r.ww || r.ww.subPhase !== 'night') return;
    if (!p.alive) return;
    const target = r.players.get(String(targetId));
    if (!target || !target.alive) return;

    if (p.role === 'werewolf') {
      r.ww.nightActions.wolfTarget = target.id;
      r.ans.set(p.id, { v: target.id, t: Date.now() });
    } else if (p.role === 'doctor') {
      r.ww.nightActions.doctorSave = target.id;
      r.ans.set(p.id, { v: target.id, t: Date.now() });
    } else if (p.role === 'detective') {
      r.ww.nightActions.detectiveCheck = target.id;
      r.ans.set(p.id, { v: target.id, t: Date.now() });
    }
    push(r);
  });

  s.on('ww:vote', targetId => {
    const [r, p] = me(s);
    if (!r || r.phase !== 'question' || r.game !== 'werewolf' || !r.ww || r.ww.subPhase !== 'day_vote') return;
    if (!p.alive) return;
    const target = r.players.get(String(targetId));
    if (!target || !target.alive) return;
    r.ww.votes.set(p.id, target.id);
    push(r);
  });

  s.on('imp:clue', text => {
    const [r, p] = me(s);
    if (!r || r.phase !== 'question' || r.game !== 'imposter' || !r.imp || r.imp.subPhase !== 'clues') return;
    const t = clean(text, 60);
    if (!t) return;
    if (r.imp.clues.some(x => x.pid === p.id)) return;
    r.imp.clues.push({ pid: p.id, name: p.name, av: p.av, text: t });
    push(r);
  });

  s.on('imp:vote', targetId => {
    const [r, p] = me(s);
    if (!r || r.phase !== 'question' || r.game !== 'imposter' || !r.imp || r.imp.subPhase !== 'vote') return;
    const target = r.players.get(String(targetId));
    if (!target) return;
    r.imp.votes.set(p.id, target.id);
    const activeCount = activePlayers(r).length;
    if (r.imp.votes.size >= activeCount && activeCount > 0) {
      resolveImposterVote(r);
    } else {
      push(r);
    }
  });

  s.on('imp:guess', word => {
    const [r, p] = me(s);
    if (!r || r.phase !== 'question' || r.game !== 'imposter' || !r.imp || r.imp.subPhase !== 'guess_common') return;
    if (!p.isImposter || r.imp.guessAttempted) return;
    r.imp.guessAttempted = true;
    const guessedCorrectly = norm(word) === norm(r.imp.commonWord);
    finalizeImposterResult(r, !guessedCorrectly);
  });

  s.on('wordle:guess', raw => {
    const [r,p] = me(s); if (!r || r.phase !== 'question' || r.game !== 'wordle' || !r.wordle || r.wordle.solved.has(p.id)) return;
    const guess = clean(raw, 12).toLocaleUpperCase('tr-TR');
    const chars = [...guess], target = [...r.wordle.target];
    if (chars.length !== target.length || !/^[A-ZÇĞİÖŞÜ]+$/u.test(guess)) return s.emit('toast','Kelime uzunluğu uygun olmalı; yalnızca Türkçe harf kullan.');
    const list = r.wordle.guesses.get(p.id) || []; if (list.length >= r.wordle.maxAttempts) return;
    if (list.some(x => x.word === guess)) return s.emit('toast','Aynı tahmini tekrar gönderemezsin.');
    const marks = Array(chars.length).fill('absent'); const remaining = {};
    target.forEach((ch,i) => { if(chars[i]===ch) marks[i]='correct'; else remaining[ch]=(remaining[ch]||0)+1; });
    chars.forEach((ch,i) => { if(marks[i]==='correct') return; if(remaining[ch]>0){marks[i]='present';remaining[ch]--;} });
    list.push({word:guess,marks}); r.wordle.guesses.set(p.id,list);
    if (guess === r.wordle.target) r.wordle.solved.set(p.id,{time:Date.now(),attempt:list.length});
    if ([...r.players.values()].every(x => r.wordle.solved.has(x.id) || (r.wordle.guesses.get(x.id)||[]).length >= r.wordle.maxAttempts)) reveal(r); else push(r);
  });

  s.on('palavra:bluff', raw => {
    const [r,p] = me(s); if(!r || r.phase!=='question' || r.game!=='palavra' || !r.palavra || r.palavra.phase!=='bluff' || r.palavra.fake.has(p.id)) return;
    const txt=clean(raw,100); if(!txt || norm(txt)===norm(r.palavra.real)) return s.emit('toast','Gerçek cevabı yazma; inandırıcı bir yanlış cevap oluştur.');
    r.palavra.fake.set(p.id,txt);
    if(r.palavra.fake.size===r.players.size) beginPalavraVote(r);
    else push(r);
  });

  s.on('palavra:vote', idx => {
    const [r,p]=me(s); if(!r || r.phase!=='question' || r.game!=='palavra' || !r.palavra || r.palavra.phase!=='vote' || r.palavra.votes.has(p.id)) return;
    const n=Number(idx); if(!Number.isInteger(n)||n<0||n>=r.palavra.options.length) return;
    r.palavra.votes.set(p.id,n); if(r.palavra.votes.size===r.players.size) reveal(r); else push(r);
  });

  s.on('bag:judge', pid => {
    const [r,p]=me(s); if(!r || r.host!==p.id || r.phase!=='reveal' || r.game!=='bagdastirici' || !r.bag || !r.bag.answers.has(pid)) return;
    if(r.bag.judged.has(pid)) return; r.bag.judged.add(pid);
    const player=r.players.get(pid); if(player) givePoints(r,player,100);
    const row=r.rev && r.rev.rows.find(x=>r.players.get(pid) && x.n===r.players.get(pid).name); if(row) row.pts=100;
    push(r);
  });

  s.on('answer', v => {
    const [r, p] = me(s);
    if (!r || r.phase !== 'question') return;
    if (['codenames', 'werewolf', 'imposter', 'wordle', 'palavra'].includes(r.game)) return;

    const k = akey(r, p);
    if (r.ans.has(k)) return;

    if (r.q && r.q.loading) return;
    if ((r.game === 'song' || r.game === 'film' || r.game === 'pixel') && r.penaltyUntil && (r.penaltyUntil.get(p.id) || 0) > Date.now()) {
      return;
    }

    if (r.game === 'tf' || r.game === 'quiz' || r.game === 'liar' || r.game === 'wyr' || r.game === 'ml' || r.game === 'survey' || r.game === 'bigger' || ['logo','celebrity','celebritytr','celebrityworld','footballer','clublogo','flag','universe'].includes(r.game)) {
      const optLen = (r.q && Array.isArray(r.q.o)) ? r.q.o.length : 0;
      if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v >= optLen) return;
      r.ans.set(k, { v, t: Date.now() });
    } else if (r.game === 'closest') {
      const num = Number(v);
      if (!Number.isFinite(num) || Math.abs(num) > 1e12) return;
      r.ans.set(k, { v: num, t: Date.now() });
    } else if (r.game === 'song') {
      const n = Number(v); if (!Number.isInteger(n) || n < 0 || n >= (r.q.o || []).length) return;
      if (n === r.q.correctIndex) r.ans.set(k, { v: r.q.o[n], ok: true, t: Date.now() });
      else { r.penaltyUntil.set(p.id, Date.now() + 3000); s.emit('toast', 'Yanlış seçenek! 3 sn bekleme cezası.'); push(r); return; }
    } else if (r.game === 'emoji' || r.game === 'film' || r.game === 'pixel' || r.game === 'kelimelik' || r.game === 'bagdastirici') {
      const txt = clean(v, 100);
      if (!txt) return;
      if (r.game === 'bagdastirici') {
        if (!r.bag || r.bag.answers.has(p.id)) return;
        r.bag.answers.set(p.id,{v:txt,t:Date.now()});
        if (r.bag.accepted.some(a => norm(txt) === a || (a.length >= 5 && norm(txt).includes(a)))) r.bag.judged.add(p.id);
        r.ans.set(k,{v:txt,t:Date.now()});
      } else {
        const ok = checkTextGuessMatch(r.game, r.q, txt);
        if (ok) {
          r.ans.set(k, { v: txt, ok: true, t: Date.now(), fi: (r.q && r.q.sceneIndex) || 0 });
          if (r.game === 'kelimelik' && r.kelimelik) r.kelimelik.solved.set(p.id,{time:Date.now(),answer:txt});
        } else {
          if (r.game === 'song' || r.game === 'film' || r.game === 'pixel') {
            r.penaltyUntil.set(p.id, Date.now() + 3000);
            s.emit('toast', 'Yanlış tahmin! 3 sn bekleme cezası.');
            push(r);
            return;
          }
          if (r.game === 'kelimelik') { s.emit('toast','Bu kelime değil, tekrar dene!'); push(r); return; }
          r.ans.set(k, { v: txt, ok: false, t: Date.now() });
        }
      }
    }

    if (allDone(r)) reveal(r);
    else push(r);
  });

  s.on('stop', () => {
    const [r, p] = me(s);
    if (!r || r.host !== p.id) return;
    if (r.phase === 'end') toLobby(r);
    else if (r.phase !== 'lobby') finish(r);
  });

  s.on('reset', () => {
    const [r, p] = me(s);
    if (!r || r.host !== p.id) return;
    for (const x of r.players.values()) {
      x.night = 0;
      x.score = 0;
    }
    push(r);
  });

  s.on('kick', id => {
    const [r, p] = me(s);
    if (!r || r.host !== p.id || id === p.id) return;
    const t = r.players.get(id);
    if (!t) return;
    if (t.sid) io.to(t.sid).emit('kicked');
    leave(r, t);
  });

  s.on('leave', () => {
    const [r, p] = me(s);
    if (r) leave(r, p);
    s.data = {};
  });

  s.on('disconnect', () => {
    const [r, p] = me(s);
    if (!r || p.sid !== s.id) return;
    p.on = false;
    p.off = Date.now();
    if (r.host === p.id) {
      const n = [...r.players.values()].find(x => x.on);
      if (n) r.host = n.id;
    }
    if (r.phase === 'question' && allDone(r)) reveal(r);
    else push(r);
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [c, r] of rooms) {
    if ([...r.players.values()].some(p => p.on)) {
      r.idle = now;
      if (r.phase === 'lobby') {
        for (const p of [...r.players.values()]) {
          if (!p.on && p.off && now - p.off > 120000) leave(r, p);
        }
      }
    } else if (now - r.idle > 300000) {
      clearTimeout(r.timer);
      clearTimeout(r.sceneTimer);
      rooms.delete(c);
    }
  }
}, 30000);

srv.listen(PORT, '0.0.0.0', () => console.log('Parti Odası hazır: http://localhost:' + PORT));
