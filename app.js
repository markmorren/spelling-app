'use strict';

// ── Design metadata (icons / colours live here, not in words.json) ──────────
const ACT_META = {
  'alphabet':           { icon: '🔤', color: '#007AFF', desc: '26 letters to build words' },
  'consonant-digraphs': { icon: '💬', color: '#5856D6', desc: 'sh · ch · th · wh · ng · ck · ph · gh · wr · kn' },
  'vowel-digraphs':     { icon: '🎵', color: '#FF9F0A', desc: 'ai · ee · oa · oo · ur · ow · aw · ie · oi' },
  'trigraphs':          { icon: '✨', color: '#32ADE6', desc: 'igh · tch · ear · air · ere · dge · eer · oul · ore · are' },
  'common-words':       { icon: '⭐', color: '#FF2D55', desc: 'Fry high-frequency words' },
};

const SET_META = {
  'sh':       { icon: '🐚', color: '#5856D6' },
  'ch':       { icon: '🍟', color: '#FF6B35' },
  'th':       { icon: '💭', color: '#32ADE6' },
  'wh':       { icon: '🌬️', color: '#34C759' },
  'ng':       { icon: '💍', color: '#AF52DE' },
  'ck':       { icon: '🦆', color: '#FF9500' },
  'ai':       { icon: '🌧️', color: '#007AFF' },
  'ee':       { icon: '🐝', color: '#34C759' },
  'oa':       { icon: '⛵', color: '#32ADE6' },
  'oo':       { icon: '🌙', color: '#5856D6' },
  'igh':      { icon: '💡', color: '#FF9F0A' },
  'tch':      { icon: '🔥', color: '#FF3B30' },
  'ear':      { icon: '👂', color: '#AF52DE' },
  'air':      { icon: '💨', color: '#32ADE6' },
  'ph':       { icon: '🐘', color: '#007AFF' },
  'gh':       { icon: '😂', color: '#34C759' },
  'wr':       { icon: '✍️', color: '#5856D6' },
  'kn':       { icon: '🔪', color: '#FF3B30' },
  'ur':       { icon: '🔥', color: '#FF6B35' },
  'ow':       { icon: '🐮', color: '#8E8E93' },
  'aw':       { icon: '🦅', color: '#FF9500' },
  'ie':       { icon: '🥧', color: '#FF2D55' },
  'oi':       { icon: '🪙', color: '#FFD60A' },
  'ere':      { icon: '📍', color: '#32ADE6' },
  'dge':      { icon: '🌉', color: '#5856D6' },
  'eer':      { icon: '🦌', color: '#34C759' },
  'oul':      { icon: '🤔', color: '#8E8E93' },
  'ore':      { icon: '🏪', color: '#007AFF' },
  'are':      { icon: '🌸', color: '#FF2D55' },
  'seedling': { icon: '🌱', color: '#34C759', desc: 'First 50 words' },
  'sprout':   { icon: '🌿', color: '#30B0C7', desc: 'Words 51–100' },
  'bloom':    { icon: '🌻', color: '#FF9F0A', desc: 'Words 101–150' },
  'star':     { icon: '⭐', color: '#007AFF', desc: 'Words 151–200' },
  'champion': { icon: '🏆', color: '#AF52DE', desc: 'Words 201–250' },
};

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const QWERTY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map(r => r.split(''));
const DEFAULT_PIN = '1234';

// ARASAAC — educational symbol library (CC BY-NC-SA 4.0, arasaac.org)
const ARASAAC_SEARCH = w =>
  `https://api.arasaac.org/v1/pictograms/en/search/${encodeURIComponent(w)}`;
const ARASAAC_IMG = id =>
  `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;

const EMOJI = {
  cat:'🐱',dog:'🐶',sun:'☀️',hat:'🎩',bed:'🛏️',pig:'🐷',cup:'🍵',
  fox:'🦊',van:'🚐',web:'🕸️',zip:'🤐',jet:'✈️',run:'🏃',hop:'🐸',
  log:'🪵',bun:'🍞',top:'🎯',red:'🔴',hot:'🌡️',wet:'💧',cut:'✂️',
  bag:'👜',pot:'🍲',map:'🗺️',fun:'🎉',fit:'💪',big:'⬆️',dig:'⛏️',
  net:'🎣',lid:'🫙',
  chip:'🍟',chat:'💬',ship:'🚢',shop:'🛒',fish:'🐟',dish:'🍽️',
  shell:'🐚',ring:'💍',sing:'🎤',song:'🎵',king:'👑',wing:'🪶',
  back:'⬅️',duck:'🦆',lock:'🔒',sock:'🧦',stick:'🥢',black:'🖤',
  rain:'🌧️',tail:'🐱',sail:'⛵',snail:'🐌',train:'🚂',tree:'🌳',
  boat:'⛵',coat:'🧥',road:'🛣️',moon:'🌙',pool:'🏊',spoon:'🥄',
  book:'📚',cook:'👨‍🍳',food:'🍱',bee:'🐝',feet:'👣',
  light:'💡',night:'🌙',right:'✅',fight:'🥊',bright:'✨',tight:'🪢',
  catch:'🫙',match:'🔥',witch:'🧙',chair:'🪑',hair:'💇',fair:'🎡',
  stair:'🪜',ear:'👂',hear:'👂',near:'📍',fear:'😨',year:'📅',
  clear:'🔍',pair:'👯',wheel:'🎡',
};

// ── App state ─────────────────────────────────────────────
let activities = [];
let actIdx     = 0;
let setId      = null;   // null = play all
let mixSetIds  = null;   // non-null = custom mix over these set ids (within one activity)
let mixLimit   = null;   // max words in a mix round (null = no cap)
let globalMix  = null;   // non-null = home mix: { actIds: [...], limit }
let mixMode    = 'activity'; // which builder the mix overlay is currently showing
let teacherOpen = new Set(); // expanded teacher-settings accordion sections
let pickTier   = 'all';      // selected tier on a tiered (CEC) picker
let setFilterOpen = new Set(); // expanded per-activity cards in Word sets
let wordIdx    = 0;
let order      = [];
let answer     = [];
let checked    = false;
let roundWords = [];   // words in the current round (full set, or just the missed ones)
let missed     = [];   // words spelled incorrectly this round

let selectedVoice   = null;
let speechRate      = 0.75;
let currentAudio    = null;   // currently-playing pre-recorded word clip
let lastCheckResult = false;
let answerCtx       = null;
let answerDrawing   = false;
let answerWriteOn   = false;
let answerPrevX     = 0;
let answerPrevY     = 0;

const PREFERRED_VOICES = [
  'Daniel (Enhanced)','Serena (Enhanced)','Kate (Enhanced)',
  'Daniel','Serena','Kate','Oliver','Arthur',
  'Microsoft Hazel','Microsoft George','Microsoft Susan',
  'Google UK English Female','Google UK English Male',
];

// ── Settings helpers ──────────────────────────────────────
function getSetting(key, def) {
  const v = localStorage.getItem(key);
  return v === null ? def : v === 'true';
}

// ── Elkonin helpers ───────────────────────────────────────
function getBoxCount(word, sound) {
  if (!sound) return word.length;
  return word.length - sound.length + 1;
}

function letterIdxToBox(i, word, sound) {
  if (!sound) return i;
  const pos = word.indexOf(sound);
  if (i < pos) return i;
  if (i < pos + sound.length) return pos;
  return i - sound.length + 1;
}

// ── Bootstrap ─────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch('words.json');
    if (!res.ok) throw new Error();
    const data = await res.json();
    activities = data.activities;
  } catch {
    document.getElementById('feedback').textContent = 'Could not load words.json';
    return;
  }
  applyEnabledActivities();
  initVoices();
  bindEvents();
  initAnswerCanvas();
  showScreen('home');
  renderHome();
  registerSW();
}

// ── Screen management ─────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${id}`).classList.add('active');
}

// ── Home screen ───────────────────────────────────────────
function renderHome() {
  const enabled = getEnabledIds();
  const grid = document.getElementById('activity-grid');
  grid.innerHTML = '';
  activities.filter(a => enabled.has(a.id)).forEach((act, i) => {
    const meta = ACT_META[act.id] || { icon: '📝', color: '#8E8E93', desc: '' };
    const card = document.createElement('div');
    card.className = 'act-card';
    card.dataset.actIdx = activities.indexOf(act);
    card.innerHTML = `
      <div class="act-card-hero" style="background:${meta.color}20">
        <span>${meta.icon}</span>
      </div>
      <div class="act-card-body">
        <h3>${act.name}</h3>
        <p>${meta.desc}</p>
      </div>`;
    grid.appendChild(card);
  });

  // Home mix - a cross-activity challenge, unlocked by the teacher.
  if (getSetting('feature_homemix', false)) {
    const mix = document.createElement('div');
    mix.className = 'act-card home-mix-card';
    mix.dataset.homeMix = '1';
    mix.innerHTML = `
      <div class="act-card-hero" style="background:#5856D620"><span>🎲</span></div>
      <div class="act-card-body">
        <h3>Mix</h3>
        <p>A bit of everything</p>
      </div>`;
    grid.appendChild(mix);
  }
}

// ── Set picker ────────────────────────────────────────────
function renderPick(idx) {
  actIdx = idx;
  const act = activities[idx];
  document.getElementById('pick-title').textContent = act.name;
  const grid = document.getElementById('set-grid');
  grid.innerHTML = '';

  if (isTieredActivity(act)) { renderPickTiered(act, grid); return; }

  const en  = getEnabledSets(act.id);
  const visibleSets = act.sets.filter(s => en.has(s.id));

  if (visibleSets.length > 1) {
    const totalWords = visibleSets.reduce((n, s) => n + s.words.length, 0);
    const allCard = document.createElement('div');
    allCard.className = 'set-card play-all';
    allCard.dataset.setId = '__all__';
    const actMeta = ACT_META[act.id] || {};
    allCard.innerHTML = `
      <div class="set-card-hero" style="background:${(actMeta.color || '#888')}20">
        <span>🎯</span>
      </div>
      <div class="set-card-body">
        <h3>Play All</h3>
        <p>${totalWords} words</p>
      </div>`;
    grid.appendChild(allCard);

    const mixCard = document.createElement('div');
    mixCard.className = 'set-card mix-card';
    mixCard.dataset.setId = '__mix__';
    mixCard.innerHTML = `
      <div class="set-card-hero" style="background:${(actMeta.color || '#888')}20">
        <span>🎲</span>
      </div>
      <div class="set-card-body">
        <h3>Mix…</h3>
        <p>Choose sets &amp; length</p>
      </div>`;
    grid.appendChild(mixCard);
  }

  visibleSets.forEach(s => {
    const meta = SET_META[s.id] || { icon: '📝', color: '#8E8E93' };
    const card = document.createElement('div');
    card.className = 'set-card';
    card.dataset.setId = s.id;
    const label = s.id.length <= 3
      ? `"${s.id}" words`
      : s.name;
    card.innerHTML = `
      <div class="set-card-hero" style="background:${meta.color}20">
        <span>${meta.icon}</span>
      </div>
      <div class="set-card-body">
        <h3>${label}</h3>
        <p>${s.words.length} words${meta.desc ? ' · ' + meta.desc : ''}</p>
      </div>`;
    grid.appendChild(card);
  });
}

// ── Tiered picker (CEC levels: pattern × Core/Extension/Challenge) ──
const TIER_ORDER = [['core', 'Core'], ['ext', 'Extension'], ['chal', 'Challenge'], ['all', 'All']];

function isTieredActivity(act) {
  return !!act.sets && act.sets.length > 0 &&
    act.sets.every(s => /: (Core|Extension|Challenge)$/.test(s.name));
}
function tierKeyOf(setName) {
  const t = setName.split(': ')[1];
  return t === 'Core' ? 'core' : t === 'Extension' ? 'ext' : 'chal';
}

function renderPickTiered(act, grid) {
  const en   = getEnabledSets(act.id);
  const sets = act.sets.filter(s => en.has(s.id));

  // Group enabled sets by pattern (the bit before the colon), keeping order.
  const order = [];
  const byPattern = {};
  sets.forEach(s => {
    const p = s.name.split(': ')[0];
    if (!byPattern[p]) { byPattern[p] = {}; order.push(p); }
    byPattern[p][tierKeyOf(s.name)] = s;
  });

  // Tier filter bar.
  const bar = document.createElement('div');
  bar.className = 'tier-bar';
  bar.innerHTML = TIER_ORDER.map(([k, label]) =>
    `<button class="tier-btn${pickTier === k ? ' active' : ''}" data-tier="${k}">${label}</button>`
  ).join('');
  grid.appendChild(bar);

  // Mix… card (custom cross-pattern mix).
  const actMeta = ACT_META[act.id] || {};
  const mixCard = document.createElement('div');
  mixCard.className = 'set-card mix-card';
  mixCard.dataset.setId = '__mix__';
  mixCard.innerHTML = `
    <div class="set-card-hero" style="background:${(actMeta.color || '#888')}20"><span>🎲</span></div>
    <div class="set-card-body"><h3>Mix…</h3><p>Choose sets &amp; length</p></div>`;
  grid.appendChild(mixCard);

  // One card per pattern, resolved against the selected tier.
  order.forEach(p => {
    const tiers = byPattern[p];
    const card = document.createElement('div');
    card.className = 'set-card';
    let count;
    if (pickTier === 'all') {
      const tierSets = Object.values(tiers);
      count = tierSets.reduce((n, s) => n + s.words.length, 0);
      card.dataset.mixIds = tierSets.map(s => s.id).join(',');
    } else {
      const s = tiers[pickTier];
      if (!s) return; // this pattern has no words at the selected tier
      count = s.words.length;
      card.dataset.setId = s.id;
    }
    card.innerHTML = `
      <div class="set-card-hero" style="background:${(actMeta.color || '#888')}20"><span>🔤</span></div>
      <div class="set-card-body"><h3>${p}</h3><p>${count} words</p></div>`;
    grid.appendChild(card);
  });
}

// ── Mix builder ───────────────────────────────────────────
const MIX_LIMITS = [10, 20, 30, 50, 0]; // 0 = All

function renderMixRows(rows) {
  document.getElementById('mix-sets').innerHTML = rows.map(r => `
    <label class="mix-set-row">
      <input type="checkbox" value="${r.id}" checked>
      <span class="mix-set-name">${r.name}</span>
      <span class="mix-set-count">${r.count}</span>
    </label>`).join('');
  document.getElementById('mix-limits').innerHTML = MIX_LIMITS.map((n, i) => `
    <button type="button" class="mix-chip${i === 1 ? ' active' : ''}" data-limit="${n}">
      ${n === 0 ? 'All' : n}
    </button>`).join('');
  document.getElementById('mix-overlay').hidden = false;
}

// Per-activity mix: choose which sets within the current activity.
function openMix() {
  mixMode = 'activity';
  const act = activities[actIdx];
  const en  = getEnabledSets(act.id);
  document.getElementById('mix-include-label').textContent = 'Sets to include';
  renderMixRows((act.sets || []).filter(s => en.has(s.id))
    .map(s => ({ id: s.id, name: s.name, count: s.words.length })));
}

// Home mix: choose which whole activities to draw from.
function openGlobalMix() {
  mixMode = 'global';
  const enabled = getEnabledIds();
  document.getElementById('mix-include-label').textContent = 'Activities to include';
  renderMixRows(activities.filter(a => enabled.has(a.id))
    .map(a => ({ id: a.id, name: a.name, count: activityWords(a).length })));
}

function beginMixFromOverlay() {
  const ids = [...document.querySelectorAll('#mix-sets input:checked')].map(i => i.value);
  if (!ids.length) return; // nothing selected
  const chip = document.querySelector('#mix-limits .mix-chip.active');
  const limit = chip ? +chip.dataset.limit : 0;
  document.getElementById('mix-overlay').hidden = true;
  if (mixMode === 'global') startGlobalMix(ids, limit);
  else startMix(actIdx, ids, limit);
}

// ── Start spelling ────────────────────────────────────────
function startSpelling(aIdx, sId) {
  actIdx    = aIdx;
  mixSetIds = null;
  globalMix = null;
  setId     = (sId === '__all__') ? null : sId;
  startRound(getWords());
  showScreen('spell');
  renderBank();
  renderWord();
}

// Start a custom mix over the chosen set ids, capped at `limit` words (0 = all).
function startMix(aIdx, setIds, limit) {
  actIdx    = aIdx;
  setId     = null;
  globalMix = null;
  mixSetIds = setIds;
  mixLimit  = limit || null;
  startRound(getWords());
  showScreen('spell');
  renderBank();
  renderWord();
}

// Start a home mix that spans whole activities, capped at `limit` words (0 = all).
function startGlobalMix(actIds, limit) {
  mixSetIds = null;
  globalMix = { actIds, limit: limit || null };
  startRound(getWords());
  showScreen('spell');
  renderBank();
  renderWord();
}

// Begin a round over the given list of words (the full set, or a practice list).
function startRound(words) {
  roundWords = words.slice();
  missed     = [];
  wordIdx    = 0;
  order      = shuffle(roundWords.map((_, i) => i));
  answer     = [];
  checked    = false;
}

// ── Word helpers ──────────────────────────────────────────
// Pool the enabled words of one activity (direct words, or its enabled sets).
function activityWords(a) {
  if (!a.sets) return a.words || [];
  const en = getEnabledSets(a.id);
  return a.sets.filter(s => en.has(s.id)).flatMap(s => s.words);
}

function getWords() {
  if (globalMix) {
    const ids = new Set(globalMix.actIds);
    let pool = activities.filter(a => ids.has(a.id)).flatMap(activityWords);
    pool = shuffle(pool);
    if (globalMix.limit && globalMix.limit < pool.length) pool = pool.slice(0, globalMix.limit);
    return pool;
  }
  const act = activities[actIdx];
  if (mixSetIds) {
    const ids = new Set(mixSetIds);
    let pool = (act.sets || []).filter(s => ids.has(s.id)).flatMap(s => s.words);
    pool = shuffle(pool);
    if (mixLimit && mixLimit < pool.length) pool = pool.slice(0, mixLimit);
    return pool;
  }
  if (!act.sets) return act.words || [];
  if (setId === null) {
    const en = getEnabledSets(act.id);
    return act.sets.filter(s => en.has(s.id)).flatMap(s => s.words);
  }
  return act.sets.find(s => s.id === setId)?.words || [];
}
function currentWord() { return roundWords[order[wordIdx]]; }

// ── Render word ───────────────────────────────────────────
function renderWord() {
  const w   = currentWord();
  const words = roundWords;
  answer  = [];
  checked = false;

  document.getElementById('sound-badge').textContent = w.sound || '';
  document.getElementById('progress-text').textContent =
    `${wordIdx + 1} / ${words.length}`;
  document.getElementById('progress-bar').style.width =
    `${((wordIdx + 1) / words.length) * 100}%`;
  document.getElementById('next-btn').hidden = true;
  requestAnimationFrame(resetAnswerCanvas);
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = '';
  document.getElementById('answer-tiles').className = '';

  renderAnswer();
  loadWordImage(w.word);
  setTimeout(speakCurrent, 320);
}

function renderBank() {
  const bank = document.getElementById('bank');
  const tile = l => `<button class="tile" data-letter="${l}">${l}</button>`;
  if (getSetting('feature_qwerty', false)) {
    bank.classList.add('qwerty');
    bank.innerHTML = QWERTY_ROWS
      .map(row => `<div class="bank-row">${row.map(tile).join('')}</div>`)
      .join('');
  } else {
    bank.classList.remove('qwerty');
    bank.innerHTML = LETTERS.map(tile).join('');
  }
}

function renderAnswer() {
  if (getSetting('feature_elkonin', false)) { renderElkoninBoxes(); return; }
  const w     = currentWord();
  const sound = w.sound || '';
  const pos   = sound ? w.word.indexOf(sound) : -1;
  const len   = sound.length;
  document.getElementById('answer-tiles').innerHTML = answer.map((l, i) => {
    const hl = checked && pos >= 0 && i >= pos && i < pos + len ? ' highlight' : '';
    return `<button class="tile answer-tile${hl}" data-idx="${i}">${l}</button>`;
  }).join('');
}

function renderElkoninBoxes() {
  const w        = currentWord();
  const sound    = w.sound || '';
  const word     = w.word;
  const nBoxes   = getBoxCount(word, sound);
  const soundBox = sound ? word.indexOf(sound) : -1;

  const boxes = Array.from({ length: nBoxes }, () => []);
  answer.forEach((letter, i) => {
    boxes[letterIdxToBox(i, word, sound)].push(letter);
  });

  const activeBox = answer.length < word.length
    ? letterIdxToBox(answer.length, word, sound)
    : -1;

  const container = document.getElementById('answer-tiles');
  const row = document.createElement('div');
  row.className = 'elkonin-row';

  boxes.forEach((letters, bi) => {
    const box = document.createElement('div');
    let cls = 'elkonin-box';
    if (bi === soundBox) cls += ' sound-box';
    if (letters.length > 0) cls += ' filled';
    if (bi === activeBox) cls += ' active';
    if (checked && bi === soundBox && soundBox >= 0) {
      cls += lastCheckResult ? ' correct' : ' incorrect';
    }
    box.className = cls;
    box.dataset.boxIdx = bi;
    const inner = document.createElement('span');
    inner.className = 'elkonin-letters';
    inner.textContent = letters.join('');
    box.appendChild(inner);
    row.appendChild(box);
  });

  container.innerHTML = '';
  container.appendChild(row);
}

// ── ARASAAC images ────────────────────────────────────────
async function loadWordImage(word) {
  const img = document.getElementById('word-image');
  const fb  = document.getElementById('symbol-fallback');
  img.src = ''; img.style.display = 'block';
  fb.className = ''; fb.textContent = '';

  const key    = `arasaac_id_${word}`;
  const cached = localStorage.getItem(key);
  if (cached === 'none') { showFallback(word); return; }
  if (cached)            { img.src = ARASAAC_IMG(cached); return; }

  try {
    const res  = await fetch(ARASAAC_SEARCH(word));
    if (!res.ok) throw 0;
    const data = await res.json();
    if (!data?.length) throw 0;
    const id = data[0]._id;
    localStorage.setItem(key, id);
    img.src = ARASAAC_IMG(id);
  } catch {
    localStorage.setItem(key, 'none');
    showFallback(word);
  }
}
function showFallback(word) {
  const img = document.getElementById('word-image');
  const fb  = document.getElementById('symbol-fallback');
  img.style.display = 'none';
  fb.className   = 'visible';
  fb.textContent = EMOJI[word] || word[0].toUpperCase();
}

// ── Interaction ───────────────────────────────────────────
function addLetter(letter) {
  if (checked) return;
  if (getSetting('feature_elkonin', false) && answer.length >= currentWord().word.length) return;
  answer.push(letter);
  renderAnswer();
}
function removeLetter(idx) {
  if (checked) return;
  answer.splice(idx, 1);
  renderAnswer();
}

function removeFromBox(boxIdx) {
  if (checked) return;
  const w = currentWord();
  const firstIdx = answer.findIndex((_, i) => letterIdxToBox(i, w.word, w.sound || '') >= boxIdx);
  if (firstIdx === -1) return;
  answer.splice(firstIdx);
  renderAnswer();
}
function clearAnswer() {
  if (checked) return;
  answer = [];
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = '';
  renderAnswer();
}

function checkAnswer() {
  if (checked) return;
  checked = true;
  const w     = currentWord();
  const typed = answer.join('');
  const fb    = document.getElementById('feedback');
  const tiles = document.getElementById('answer-tiles');

  lastCheckResult = (typed === w.word);

  if (lastCheckResult) {
    fb.className   = 'correct';
    fb.textContent = '✓  Correct!';
    tiles.classList.add('celebrate');
  } else {
    fb.className   = 'incorrect';
    answer = w.word.split('');
    fb.textContent = `✗  The word is: ${w.word}`;
    renderAnswer();
    tiles.classList.add('celebrating');
    if (!missed.includes(w)) missed.push(w);
  }
  renderAnswer();
  document.getElementById('next-btn').hidden = false;
  if (getSetting('feature_write', false)) enableAnswerCanvas();
}

function nextWord() {
  wordIdx++;
  if (wordIdx >= roundWords.length) {
    showResults();
    return;
  }
  renderWord();
}

// Leave the spell screen, returning to the set picker (if the activity has
// more than one enabled set) or home.
function exitSpelling() {
  const act = activities[actIdx];
  if (globalMix) { globalMix = null; renderHome(); showScreen('home'); return; }
  if (mixSetIds) { mixSetIds = null; renderPick(actIdx); showScreen('pick'); return; }
  if (act.sets) {
    const en = getEnabledSets(act.id);
    if (act.sets.filter(s => en.has(s.id)).length <= 1) {
      showScreen('home');
    } else {
      renderPick(actIdx);
      showScreen('pick');
    }
  } else {
    showScreen('home');
  }
}

// ── Round results ─────────────────────────────────────────
function showResults() {
  const total   = roundWords.length;
  const wrong   = missed.length;
  const correct = total - wrong;
  const allRight = wrong === 0;

  document.getElementById('results-emoji').textContent = allRight ? '🌟' : '👍';
  document.getElementById('results-title').textContent =
    allRight ? 'All correct!' : 'Well done!';
  document.getElementById('results-score').textContent =
    `You spelled ${correct} of ${total}.`;

  const missedWrap = document.getElementById('results-missed');
  if (allRight) {
    missedWrap.hidden = true;
  } else {
    missedWrap.hidden = false;
    document.getElementById('results-missed-words').innerHTML =
      missed.map(w => `<span class="missed-chip">${w.word}</span>`).join('');
  }

  document.getElementById('results-practice').hidden = allRight;
  document.getElementById('results-again').hidden    = !allRight;

  document.getElementById('results-overlay').hidden = false;
  if (allRight) { launchConfetti(); playCelebrationSound(); }
}

function hideResults() {
  document.getElementById('results-overlay').hidden = true;
  stopConfetti();
}

function practiceMissed() {
  const words = missed.slice();
  hideResults();
  startRound(words);
  renderWord();
}

function playAgain() {
  hideResults();
  startRound(getWords());
  renderWord();
}

// ── Celebration sound ─────────────────────────────────────
let audioCtx = null;
function playCelebrationSound() {
  if (!getSetting('feature_sound', true)) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    // A bright rising arpeggio: C5 E5 G5 C6.
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const now = audioCtx.currentTime;
    notes.forEach((freq, i) => {
      const t = now + i * 0.12;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  } catch {}
}

// ── Confetti ──────────────────────────────────────────────
let confettiRAF = null;
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth, H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colours = ['#007AFF','#34C759','#FF9F0A','#AF52DE','#FF2D55','#32ADE6'];
  const parts = Array.from({ length: 140 }, () => ({
    x: Math.random() * W,
    y: -20 - Math.random() * H * 0.4,
    r: 5 + Math.random() * 6,
    vx: -1.5 + Math.random() * 3,
    vy: 2 + Math.random() * 3.5,
    rot: Math.random() * Math.PI,
    vr: -0.2 + Math.random() * 0.4,
    c: colours[(Math.random() * colours.length) | 0],
  }));

  const start = performance.now();
  function frame(now) {
    ctx.clearRect(0, 0, W, H);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      ctx.restore();
    });
    if (now - start < 3500) {
      confettiRAF = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, W, H);
      confettiRAF = null;
    }
  }
  stopConfetti();
  confettiRAF = requestAnimationFrame(frame);
}
function stopConfetti() {
  if (confettiRAF) { cancelAnimationFrame(confettiRAF); confettiRAF = null; }
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ── Speech ────────────────────────────────────────────────
function initVoices() {
  const apply = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;
    const saved = localStorage.getItem('spelling_voice');
    if (saved) {
      const v = voices.find(v => v.name === saved);
      if (v) { selectedVoice = v; return; }
    }
    for (const name of PREFERRED_VOICES) {
      const v = voices.find(v => v.name === name);
      if (v) { selectedVoice = v; return; }
    }
    selectedVoice =
      voices.find(v => v.lang === 'en-GB') ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0];
  };
  apply();
  window.speechSynthesis.addEventListener('voiceschanged', apply);
  const saved = parseFloat(localStorage.getItem('spelling_rate') || '');
  if (!isNaN(saved)) speechRate = saved;
}

function audioSlug(word) {
  return word.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function stopSpeech() {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function speakCurrent() {
  speak(currentWord().word, getSetting('feature_saytwice', true));
}

// Play the pre-recorded clip for a word (rendered by build_audio.py - no
// clipping). Falls back to live speech for sentences or any word without a clip.
function speak(text, repeat = false) {
  const word = text.trim();
  stopSpeech();
  if (/\s/.test(word)) { speakLive(text, repeat); return; }

  const audio = new Audio(`audio/${audioSlug(word)}.m4a`);
  currentAudio = audio;
  let plays = 1;
  audio.addEventListener('ended', () => {
    if (currentAudio === audio && repeat && plays < 2) {
      plays++; audio.currentTime = 0; audio.play().catch(() => {});
    }
  });
  audio.addEventListener('error', () => {
    if (currentAudio === audio) { currentAudio = null; speakLive(text, repeat); }
  });
  audio.play().catch(() => {});
}

// Live browser speech - the fallback. Web Speech clips the first and last sounds
// of an utterance, so we lead with a comma (run-up) and speak one extra throwaway
// copy that absorbs the end-clip while every intended copy stays mid-utterance.
function speakLive(text, repeat = false) {
  if (!('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  const word = text.trim();
  let phrase;
  if (/\s/.test(word)) {
    phrase = ', ' + word;
  } else {
    const cleanCount = repeat ? 2 : 1;
    phrase = ', ' + Array(cleanCount + 1).fill(word).join(', ') + '.';
  }
  const u = new SpeechSynthesisUtterance(phrase);
  u.lang = 'en-GB'; u.rate = speechRate; u.pitch = 1.0;
  if (selectedVoice) u.voice = selectedVoice;
  synth.cancel();
  setTimeout(() => synth.speak(u), 90);
}

// ── Answer-line canvas ────────────────────────────────────
function initAnswerCanvas() {
  const c = document.getElementById('answer-line');

  c.addEventListener('touchstart', e => {
    if (!answerWriteOn) return;
    e.preventDefault();
    const t = e.changedTouches[0], r = c.getBoundingClientRect();
    answerDrawing = true;
    answerPrevX = t.clientX - r.left; answerPrevY = t.clientY - r.top;
  }, { passive: false });

  c.addEventListener('touchmove', e => {
    if (!answerWriteOn || !answerDrawing || !answerCtx) return;
    e.preventDefault();
    const t = e.changedTouches[0], r = c.getBoundingClientRect();
    const x = t.clientX - r.left, y = t.clientY - r.top;
    answerCtx.beginPath(); answerCtx.moveTo(answerPrevX, answerPrevY);
    answerCtx.lineTo(x, y); answerCtx.stroke();
    answerPrevX = x; answerPrevY = y;
  }, { passive: false });

  c.addEventListener('touchend',   e => { if (answerWriteOn) { e.preventDefault(); answerDrawing = false; } }, { passive: false });
  c.addEventListener('mousedown',  e => {
    if (!answerWriteOn) return;
    const r = c.getBoundingClientRect();
    answerDrawing = true; answerPrevX = e.clientX - r.left; answerPrevY = e.clientY - r.top;
  });
  c.addEventListener('mousemove',  e => {
    if (!answerWriteOn || !answerDrawing || !answerCtx) return;
    const r = c.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    answerCtx.beginPath(); answerCtx.moveTo(answerPrevX, answerPrevY);
    answerCtx.lineTo(x, y); answerCtx.stroke();
    answerPrevX = x; answerPrevY = y;
  });
  c.addEventListener('mouseup',    () => { answerDrawing = false; });
  c.addEventListener('mouseleave', () => { answerDrawing = false; });
}

function resetAnswerCanvas() {
  const c = document.getElementById('answer-line');
  const dpr = window.devicePixelRatio || 1;
  const rect = c.getBoundingClientRect();
  if (!rect.width) return;
  c.width = rect.width * dpr; c.height = rect.height * dpr;
  answerCtx = c.getContext('2d');
  answerCtx.scale(dpr, dpr);
  // Draw blue baseline at 65% from top — room for ascenders above, descenders below
  answerCtx.strokeStyle = '#64b5f6';
  answerCtx.lineWidth = 2.5; answerCtx.lineCap = 'square';
  const baseY = Math.round(rect.height * 0.65);
  answerCtx.beginPath(); answerCtx.moveTo(0, baseY); answerCtx.lineTo(rect.width, baseY); answerCtx.stroke();
  answerWriteOn = false; answerDrawing = false;
  c.style.cursor = 'default';
  document.getElementById('write-prompt').style.opacity = '0';
}

function enableAnswerCanvas() {
  if (!answerCtx) return;
  answerWriteOn = true;
  answerCtx.strokeStyle = '#1C1C1E';
  answerCtx.lineWidth = 3; answerCtx.lineCap = 'round'; answerCtx.lineJoin = 'round';
  document.getElementById('answer-line').style.cursor = 'crosshair';
  document.getElementById('write-prompt').style.opacity = '1';
}

// ── Teacher / PIN ─────────────────────────────────────────
function openTeacher() {
  const overlay = document.getElementById('pin-overlay');
  const input   = document.getElementById('pin-input');
  const error   = document.getElementById('pin-error');
  input.value = '';
  error.hidden = true;
  overlay.hidden = false;
  setTimeout(() => input.focus(), 100);
}

function verifyPin() {
  const pin    = document.getElementById('pin-input').value;
  const stored = localStorage.getItem('teacher_pin') || DEFAULT_PIN;
  if (pin === stored) {
    document.getElementById('pin-overlay').hidden = true;
    teacherOpen.clear(); // always start with all sections collapsed
    renderTeacher();
    showScreen('teacher');
  } else {
    const err = document.getElementById('pin-error');
    err.hidden = false;
    document.getElementById('pin-input').value = '';
    document.getElementById('pin-input').focus();
    // Subtle shake on the panel
    const panel = document.getElementById('pin-panel');
    panel.style.animation = 'none';
    requestAnimationFrame(() => {
      panel.style.animation = '';
    });
  }
}

// Reusable markup for a toggle row backed by a localStorage flag.
function toggleRowHTML(id, key, def, label, desc) {
  return `
    <div class="t-row">
      <div>
        <div class="t-row-label">${label}</div>
        <div class="t-row-desc">${desc}</div>
      </div>
      <label class="ios-toggle">
        <input type="checkbox" id="${id}" ${getSetting(key, def) ? 'checked' : ''}>
        <div class="ios-toggle-track"></div>
        <div class="ios-toggle-thumb"></div>
      </label>
    </div>`;
}
function bindToggle(id, key, after) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('change', e => {
    localStorage.setItem(key, e.target.checked);
    if (after) after();
  });
}

// Accordion sections: id, icon, name, body-builder, body-binder.
const TEACHER_SECTIONS = [
  ['activities', '📚', 'Activities',     () => teacherActivitiesHTML(), () => bindTeacherActivities()],
  ['sets',       '🔤', 'Word sets',      () => teacherSetsHTML(),       () => bindTeacherSets()],
  ['aids',       '🎯', 'Learning aids',  () => teacherAidsHTML(),       () => bindTeacherAids()],
  ['sound',      '🔊', 'Sound & speech', () => teacherSoundHTML(),      () => bindTeacherSound()],
  ['admin',      '🔒', 'Admin',          () => teacherAdminHTML(),      () => bindTeacherAdmin()],
];

function renderTeacher() {
  const c = document.getElementById('teacher-content');
  c.innerHTML = TEACHER_SECTIONS.map(([id, icon, name, html]) => {
    const open = teacherOpen.has(id);
    return `
      <div class="t-acc${open ? ' open' : ''}" data-acc="${id}">
        <button class="t-acc-head" data-acc-toggle="${id}">
          <span class="t-menu-icon">${icon}</span>
          <span class="t-acc-name">${name}</span>
          <span class="t-acc-chevron">⌄</span>
        </button>
        <div class="t-acc-body"${open ? '' : ' hidden'}>${html()}</div>
      </div>`;
  }).join('');

  // Bind each section's controls (elements exist even while collapsed).
  TEACHER_SECTIONS.forEach(([, , , , bind]) => bind());

  // Accordion expand/collapse - only one section open at a time.
  c.querySelectorAll('.t-acc-head').forEach(head => {
    head.addEventListener('click', () => {
      const willOpen = !teacherOpen.has(head.dataset.accToggle);
      teacherOpen.clear();
      if (willOpen) teacherOpen.add(head.dataset.accToggle);
      c.querySelectorAll('.t-acc').forEach(acc => {
        const open = teacherOpen.has(acc.dataset.acc);
        acc.classList.toggle('open', open);
        acc.querySelector('.t-acc-body').hidden = !open;
      });
    });
  });
}

// ── Teacher: activities ───────────────────────────────────
function teacherActivitiesHTML() {
  return `
    <div>
      <div class="t-section-title">Activities shown to learners</div>
      <div class="t-card" id="act-toggles"></div>
    </div>
    <div>
      <div class="t-section-title">Challenge</div>
      <div class="t-card">
        ${toggleRowHTML('toggle-homemix', 'feature_homemix', false,
          'Mix on Home Screen', 'Unlock a cross-activity mix card for confident learners')}
      </div>
    </div>`;
}
function bindTeacherActivities() {
  const enabled = getEnabledIds();
  const wrap = document.getElementById('act-toggles');
  activities.forEach(act => {
    const meta = ACT_META[act.id] || {};
    const row  = document.createElement('div');
    row.className = 't-row';
    row.innerHTML = `
      <span class="t-row-label">${meta.icon || ''} ${act.name}</span>
      <label class="ios-toggle">
        <input type="checkbox" data-act-id="${act.id}" ${enabled.has(act.id) ? 'checked' : ''}>
        <div class="ios-toggle-track"></div>
        <div class="ios-toggle-thumb"></div>
      </label>`;
    wrap.appendChild(row);
  });
  wrap.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => {
      const ids = [...wrap.querySelectorAll('input:checked')].map(i => i.dataset.actId);
      localStorage.setItem('enabled_activities', JSON.stringify(ids));
      renderHome();
    });
  });
  bindToggle('toggle-homemix', 'feature_homemix', renderHome);
}

// ── Teacher: word sets ────────────────────────────────────
function teacherSetsHTML() {
  return `<div>
      <div class="t-section-title">Filter word sets</div>
      <div id="set-filters"></div>
    </div>`;
}
// Each activity becomes its own collapsible sub-section (lazy-built on first
// open) so the page stays short however many levels are added.
function bindTeacherSets() {
  const enabled = getEnabledIds();
  const sfWrap = document.getElementById('set-filters');
  const acts = activities.filter(a => a.sets && enabled.has(a.id));

  acts.forEach(act => {
    const open = setFilterOpen.has(act.id);
    const meta = ACT_META[act.id] || {};
    const wrap = document.createElement('div');
    wrap.className = 't-subacc' + (open ? ' open' : '');
    wrap.innerHTML = `
      <button class="t-subacc-head">
        <span class="t-subacc-name">${meta.icon || ''} ${act.name}</span>
        <span class="t-subacc-count">${act.sets.length}</span>
        <span class="t-subacc-chevron">⌄</span>
      </button>
      <div class="t-subacc-body"${open ? '' : ' hidden'}></div>`;
    const body = wrap.querySelector('.t-subacc-body');

    const build = () => {
      if (body.dataset.built) return;
      body.dataset.built = '1';
      if (isTieredActivity(act)) buildTieredMatrix(act, body);
      else buildPlainChips(act, body);
    };
    if (open) build();

    wrap.querySelector('.t-subacc-head').addEventListener('click', () => {
      const willOpen = !setFilterOpen.has(act.id);
      if (willOpen) { setFilterOpen.add(act.id); build(); }
      else setFilterOpen.delete(act.id);
      wrap.classList.toggle('open', willOpen);
      body.hidden = !willOpen;
    });
    sfWrap.appendChild(wrap);
  });

  if (!acts.length) {
    sfWrap.innerHTML = `<div class="t-card"><div class="t-empty">No multi-set activities are enabled.</div></div>`;
  }
}

function setEnabledSets(actId, ids) {
  localStorage.setItem(`enabled_sets_${actId}`, JSON.stringify([...ids]));
}

// Categorise a CEC pattern label so the matrix can group rows.
function patternCategory(label) {
  const l = label.toLowerCase().trim();
  if (/plural/.test(l)) return 'Inflections';
  if (['-ing', '-ed', '-d', '-s', '-es', '-ies', '-lling/ -lled'].includes(l)) return 'Inflections';
  if (l.endsWith('-') || ['un', 'a-', 'al-'].includes(l)) return 'Prefixes';
  if (l.startsWith('-')) return 'Suffixes & endings';
  return 'Spelling patterns';
}
const CATEGORY_ORDER = ['Spelling patterns', 'Prefixes', 'Suffixes & endings', 'Inflections'];

// Flat chip grid for ordinary multi-set activities.
function buildPlainChips(act, body) {
  const enabledSets = getEnabledSets(act.id);
  const chipGrid = document.createElement('div');
  chipGrid.className = 'set-chip-grid';
  act.sets.forEach(s => {
    const sMeta = SET_META[s.id] || {};
    const btn = document.createElement('button');
    btn.className = 'set-chip' + (enabledSets.has(s.id) ? ' on' : '');
    btn.style.setProperty('--chip-color', sMeta.color || '#8E8E93');
    btn.innerHTML = `${sMeta.icon || ''} <strong>${s.id}</strong>`;
    btn.addEventListener('click', () => {
      const cur = getEnabledSets(act.id);
      if (cur.has(s.id)) { if (cur.size > 1) cur.delete(s.id); }
      else cur.add(s.id);
      setEnabledSets(act.id, cur);
      btn.className = 'set-chip' + (cur.has(s.id) ? ' on' : '');
    });
    chipGrid.appendChild(btn);
  });
  body.appendChild(chipGrid);
}

// Pattern × tier matrix (grouped by category) for tiered CEC activities.
function buildTieredMatrix(act, body) {
  const order = [];
  const byPattern = {};
  act.sets.forEach(s => {
    const p = s.name.split(': ')[0];
    if (!byPattern[p]) { byPattern[p] = {}; order.push(p); }
    byPattern[p][tierKeyOf(s.name)] = s.id;
  });

  // Group patterns by category, preserving original order within each.
  const groups = CATEGORY_ORDER
    .map(cat => [cat, order.filter(p => patternCategory(p) === cat)])
    .filter(([, ps]) => ps.length);
  const showCats = groups.length > 1;

  const rowHTML = p => `
    <div class="tm-row">
      <span class="tm-pattern">${p}</span>
      ${['core', 'ext', 'chal'].map(t => byPattern[p][t]
        ? `<button class="tm-cell" data-set-id="${byPattern[p][t]}"></button>`
        : `<span class="tm-cell tm-empty"></span>`).join('')}
    </div>`;

  body.innerHTML = `
    <div class="tm-bulk"><button data-bulk="all">All</button><button data-bulk="none">None</button></div>
    <div class="tier-matrix">
      <div class="tm-row tm-head">
        <span class="tm-pattern"></span>
        <button class="tm-col" data-col="core">Core</button>
        <button class="tm-col" data-col="ext">Ext</button>
        <button class="tm-col" data-col="chal">Chal</button>
      </div>
      ${groups.map(([cat, ps]) =>
        (showCats ? `<div class="tm-cat">${cat}</div>` : '') + ps.map(rowHTML).join('')
      ).join('')}
    </div>`;

  const matrix = body.querySelector('.tier-matrix');
  const refresh = () => {
    const cur = getEnabledSets(act.id);
    matrix.querySelectorAll('.tm-cell[data-set-id]').forEach(c =>
      c.classList.toggle('on', cur.has(c.dataset.setId)));
  };
  refresh();

  matrix.addEventListener('click', e => {
    const cur = getEnabledSets(act.id);
    const cell = e.target.closest('.tm-cell[data-set-id]');
    if (cell) {
      const id = cell.dataset.setId;
      if (cur.has(id)) cur.delete(id); else cur.add(id);
      setEnabledSets(act.id, cur); refresh(); return;
    }
    const col = e.target.closest('.tm-col');
    if (col) {
      const ids = order.map(p => byPattern[p][col.dataset.col]).filter(Boolean);
      const allOn = ids.every(id => cur.has(id));
      ids.forEach(id => allOn ? cur.delete(id) : cur.add(id));
      setEnabledSets(act.id, cur); refresh();
    }
  });

  body.querySelector('[data-bulk="all"]').addEventListener('click', () => {
    setEnabledSets(act.id, act.sets.map(s => s.id)); refresh();
  });
  body.querySelector('[data-bulk="none"]').addEventListener('click', () => {
    setEnabledSets(act.id, []); refresh();
  });
}

// ── Teacher: learning aids (display & input) ──────────────
function teacherAidsHTML() {
  return `
    <div>
      <div class="t-section-title">Display &amp; input</div>
      <div class="t-card">
        ${toggleRowHTML('toggle-elkonin', 'feature_elkonin', false,
          'Elkonin Boxes', 'Phoneme boxes instead of a flat tile row')}
        ${toggleRowHTML('toggle-write', 'feature_write', false,
          'Write the Word', 'Drawing canvas after each word is checked')}
        ${toggleRowHTML('toggle-qwerty', 'feature_qwerty', false,
          'QWERTY Keyboard', 'Tiles in keyboard order instead of A-Z')}
      </div>
    </div>`;
}
function bindTeacherAids() {
  bindToggle('toggle-elkonin', 'feature_elkonin');
  bindToggle('toggle-write', 'feature_write');
  bindToggle('toggle-qwerty', 'feature_qwerty');
}

// ── Teacher: sound & speech ───────────────────────────────
function teacherSoundHTML() {
  return `
    <div>
      <div class="t-section-title">Sound</div>
      <div class="t-card">
        ${toggleRowHTML('toggle-sound', 'feature_sound', true,
          'Celebration Sound', 'Play a chime when a round is all correct')}
        ${toggleRowHTML('toggle-saytwice', 'feature_saytwice', true,
          'Say Each Word Twice', 'Reads the word, pauses, then repeats it')}
      </div>
    </div>
    <div>
      <div class="t-section-title">Voice</div>
      <div class="t-card">
        <div class="t-row">
          <span class="t-row-label">Voice</span>
          <select class="t-voice-select" id="t-voice-select"></select>
        </div>
        <div class="t-rate-wrap">
          <label class="t-row-label">Speed</label>
          <input type="range" id="t-rate" min="0.5" max="1.1" step="0.05" value="${speechRate}">
          <span class="t-rate-value" id="t-rate-val">${speechRate.toFixed(2)}×</span>
        </div>
        <div class="t-row">
          <span class="t-row-label">Test voice</span>
          <button class="t-btn-row" id="t-test-btn" style="background:var(--blue);color:#fff;border-radius:8px;padding:7px 14px;font-weight:700;font-size:14px;border:none;">▶ Play</button>
        </div>
      </div>
    </div>`;
}
function bindTeacherSound() {
  bindToggle('toggle-sound', 'feature_sound');
  bindToggle('toggle-saytwice', 'feature_saytwice');

  const vsel = document.getElementById('t-voice-select');
  populateVoiceSelect(vsel);
  vsel.addEventListener('change', e => {
    const v = window.speechSynthesis.getVoices().find(v => v.name === e.target.value);
    if (v) { selectedVoice = v; localStorage.setItem('spelling_voice', v.name); }
  });

  document.getElementById('t-rate').addEventListener('input', e => {
    speechRate = parseFloat(e.target.value);
    document.getElementById('t-rate-val').textContent = `${speechRate.toFixed(2)}×`;
    localStorage.setItem('spelling_rate', speechRate);
    syncRateUI();
  });
  document.getElementById('t-test-btn').addEventListener('click', () => {
    speak('Can you spell the word?');
  });
}

// ── Teacher: admin ────────────────────────────────────────
function teacherAdminHTML() {
  return `
    <div>
      <div class="t-section-title">Security</div>
      <div class="t-card">
        <div class="t-btn-row" id="change-pin-row">
          <span>Change PIN (current: ${localStorage.getItem('teacher_pin') || DEFAULT_PIN})</span>
          <span class="t-arrow">›</span>
        </div>
      </div>
    </div>
    <div>
      <div class="t-section-title">Data</div>
      <div class="t-card">
        <div class="t-btn-row" id="reset-row">
          <span class="t-danger">Reset all settings to defaults</span>
        </div>
      </div>
    </div>`;
}
function bindTeacherAdmin() {
  document.getElementById('change-pin-row').addEventListener('click', () => {
    const np = prompt('Enter new 4-digit PIN (numbers only):');
    if (np && /^\d{4}$/.test(np)) {
      localStorage.setItem('teacher_pin', np);
      renderTeacher();
    } else if (np !== null) {
      alert('PIN must be exactly 4 digits.');
    }
  });

  document.getElementById('reset-row').addEventListener('click', () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      localStorage.removeItem('enabled_activities');
      localStorage.removeItem('known_activities');
      localStorage.removeItem('teacher_pin');
      localStorage.removeItem('spelling_voice');
      localStorage.removeItem('spelling_rate');
      localStorage.removeItem('feature_elkonin');
      localStorage.removeItem('feature_write');
      localStorage.removeItem('feature_qwerty');
      localStorage.removeItem('feature_sound');
      localStorage.removeItem('feature_saytwice');
      localStorage.removeItem('feature_homemix');
      activities.filter(a => a.sets).forEach(a => {
        localStorage.removeItem(`enabled_sets_${a.id}`);
      });
      speechRate = 0.75;
      selectedVoice = null;
      initVoices();
      renderTeacher();
      renderHome();
    }
  });
}

// ── Voice settings (spell screen overlay) ─────────────────
function openVoiceSettings() {
  populateVoiceSelect(document.getElementById('voice-select'));
  syncRateUI();
  document.getElementById('settings-overlay').hidden = false;
}

function populateVoiceSelect(sel) {
  const voices  = window.speechSynthesis.getVoices();
  const gb      = voices.filter(v => v.lang === 'en-GB');
  const enOther = voices.filter(v => v.lang.startsWith('en') && v.lang !== 'en-GB');
  const makeOpt = v => {
    const o = document.createElement('option');
    o.value = v.name;
    o.textContent = v.name.replace(' (Enhanced)', ' ✦');
    if (selectedVoice && v.name === selectedVoice.name) o.selected = true;
    return o;
  };
  sel.innerHTML = '';
  if (gb.length) {
    const g = document.createElement('optgroup'); g.label = 'English (UK)';
    gb.forEach(v => g.appendChild(makeOpt(v))); sel.appendChild(g);
  }
  if (enOther.length) {
    const g = document.createElement('optgroup'); g.label = 'English (other)';
    enOther.forEach(v => g.appendChild(makeOpt(v))); sel.appendChild(g);
  }
}

function syncRateUI() {
  const ri = document.getElementById('rate-range');
  const rl = document.getElementById('rate-label');
  if (ri) { ri.value = speechRate; rl.textContent = `${speechRate.toFixed(2)}×`; }
}

// ── Enabled activities ────────────────────────────────────
function getEnabledIds() {
  const stored = localStorage.getItem('enabled_activities');
  if (stored) {
    try { return new Set(JSON.parse(stored)); } catch {}
  }
  return new Set(activities.map(a => a.id));
}
function getEnabledSets(actId) {
  const stored = localStorage.getItem(`enabled_sets_${actId}`);
  if (stored) {
    try { return new Set(JSON.parse(stored)); } catch {}
  }
  const act = activities.find(a => a.id === actId);
  return new Set((act?.sets || []).map(s => s.id));
}

function applyEnabledActivities() {
  const all = activities.map(a => a.id);
  const stored = localStorage.getItem('enabled_activities');
  if (!stored) return; // no saved prefs => everything on by default

  let saved;
  try { saved = JSON.parse(stored); } catch { return; }
  const savedSet = new Set(saved);

  // `known_activities` records every activity the teacher has already had a
  // chance to toggle. Anything in `activities` but not in `known` is brand new
  // (e.g. a freshly-added CEC level) and should default to ON, while a
  // deliberately-disabled activity stays off because it IS known.
  let known;
  try { known = new Set(JSON.parse(localStorage.getItem('known_activities'))); }
  catch { known = null; }
  if (!known) known = new Set(saved); // migrate: treat current enabled as known

  const ids = all.filter(id => savedSet.has(id) || !known.has(id));
  localStorage.setItem('enabled_activities', JSON.stringify(ids));
  localStorage.setItem('known_activities', JSON.stringify(all));
}

// ── Event binding ─────────────────────────────────────────
function bindEvents() {
  // Home: activity card tapped
  document.getElementById('activity-grid').addEventListener('click', e => {
    const card = e.target.closest('.act-card');
    if (!card) return;
    if (card.dataset.homeMix) { openGlobalMix(); return; }
    const idx = +card.dataset.actIdx;
    const act = activities[idx];
    if (act.sets) {
      const en = getEnabledSets(act.id);
      const vis = act.sets.filter(s => en.has(s.id));
      if (vis.length === 1) {
        startSpelling(idx, vis[0].id);
      } else {
        renderPick(idx);
        showScreen('pick');
      }
    } else {
      startSpelling(idx, null);
    }
  });

  // Home: teacher link
  document.getElementById('teacher-link').addEventListener('click', openTeacher);

  // Pick: set card tapped
  document.getElementById('set-grid').addEventListener('click', e => {
    const tierBtn = e.target.closest('.tier-btn');
    if (tierBtn) { pickTier = tierBtn.dataset.tier; renderPick(actIdx); return; }
    const card = e.target.closest('.set-card');
    if (!card) return;
    if (card.dataset.setId === '__mix__') { openMix(); return; }
    if (card.dataset.mixIds) { startMix(actIdx, card.dataset.mixIds.split(','), 0); return; }
    startSpelling(actIdx, card.dataset.setId);
  });

  // Mix overlay
  document.getElementById('mix-start').addEventListener('click', beginMixFromOverlay);
  document.getElementById('mix-cancel').addEventListener('click', () => {
    document.getElementById('mix-overlay').hidden = true;
  });
  document.getElementById('mix-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.hidden = true;
  });
  document.getElementById('mix-all').addEventListener('click', () => {
    document.querySelectorAll('#mix-sets input').forEach(i => { i.checked = true; });
  });
  document.getElementById('mix-none').addEventListener('click', () => {
    document.querySelectorAll('#mix-sets input').forEach(i => { i.checked = false; });
  });
  document.getElementById('mix-limits').addEventListener('click', e => {
    const chip = e.target.closest('.mix-chip');
    if (!chip) return;
    document.querySelectorAll('#mix-limits .mix-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });

  // Pick: back
  document.getElementById('pick-back').addEventListener('click', () => showScreen('home'));

  // Spell: back
  document.getElementById('spell-back').addEventListener('click', exitSpelling);

  // Results overlay
  document.getElementById('results-practice').addEventListener('click', practiceMissed);
  document.getElementById('results-again').addEventListener('click', playAgain);
  document.getElementById('results-finish').addEventListener('click', () => {
    hideResults();
    exitSpelling();
  });

  // Letter bank
  document.getElementById('bank').addEventListener('click', e => {
    const btn = e.target.closest('.tile');
    if (btn) addLetter(btn.dataset.letter);
  });

  // Answer tiles / Elkonin boxes
  document.getElementById('answer-tiles').addEventListener('click', e => {
    const tile = e.target.closest('.answer-tile');
    if (tile) { removeLetter(+tile.dataset.idx); return; }
    const box = e.target.closest('.elkonin-box');
    if (box) removeFromBox(+box.dataset.boxIdx);
  });

  // Symbol card
  const card = document.getElementById('symbol-card');
  card.addEventListener('click', speakCurrent);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') speakCurrent();
  });

  // Spell controls
  document.getElementById('clear-btn').addEventListener('click', clearAnswer);
  document.getElementById('check-btn').addEventListener('click', checkAnswer);
  document.getElementById('next-btn').addEventListener('click',  nextWord);

  // Settings (spell screen)
  document.getElementById('settings-btn').addEventListener('click', openVoiceSettings);
  document.getElementById('settings-close-btn').addEventListener('click', () => {
    document.getElementById('settings-overlay').hidden = true;
  });
  document.getElementById('settings-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget)
      document.getElementById('settings-overlay').hidden = true;
  });
  document.getElementById('test-voice-btn').addEventListener('click', () => {
    speak('Can you spell the word?');
  });
  document.getElementById('voice-select').addEventListener('change', e => {
    const v = window.speechSynthesis.getVoices().find(v => v.name === e.target.value);
    if (v) {
      selectedVoice = v;
      localStorage.setItem('spelling_voice', v.name);
    }
  });
  document.getElementById('rate-range').addEventListener('input', e => {
    speechRate = parseFloat(e.target.value);
    document.getElementById('rate-label').textContent = `${speechRate.toFixed(2)}×`;
    localStorage.setItem('spelling_rate', speechRate);
  });

  // Teacher: back
  document.getElementById('teacher-back').addEventListener('click', () => showScreen('home'));

  // PIN overlay
  document.getElementById('pin-submit').addEventListener('click', verifyPin);
  document.getElementById('pin-cancel').addEventListener('click', () => {
    document.getElementById('pin-overlay').hidden = true;
  });
  document.getElementById('pin-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') verifyPin();
  });

  // Escape closes overlays
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    document.getElementById('settings-overlay').hidden = true;
    document.getElementById('pin-overlay').hidden = true;
  });
}

// ── Utilities ─────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function registerSW() {
  if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ── Go ─────────────────────────────────────────────────────
init();
