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
let wordIdx    = 0;
let order      = [];
let answer     = [];
let checked    = false;

let selectedVoice   = null;
let speechRate      = 0.75;
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
}

// ── Set picker ────────────────────────────────────────────
function renderPick(idx) {
  actIdx = idx;
  const act = activities[idx];
  const en  = getEnabledSets(act.id);
  const visibleSets = act.sets.filter(s => en.has(s.id));

  document.getElementById('pick-title').textContent = act.name;
  const grid = document.getElementById('set-grid');
  grid.innerHTML = '';

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

// ── Start spelling ────────────────────────────────────────
function startSpelling(aIdx, sId) {
  actIdx  = aIdx;
  setId   = (sId === '__all__') ? null : sId;
  wordIdx = 0;
  order   = shuffle(getWords().map((_, i) => i));
  answer  = [];
  checked = false;
  showScreen('spell');
  renderBank();
  renderWord();
}

// ── Word helpers ──────────────────────────────────────────
function getWords() {
  const act = activities[actIdx];
  if (!act.sets) return act.words || [];
  if (setId === null) {
    const en = getEnabledSets(act.id);
    return act.sets.filter(s => en.has(s.id)).flatMap(s => s.words);
  }
  return act.sets.find(s => s.id === setId)?.words || [];
}
function currentWord() { return getWords()[order[wordIdx]]; }

// ── Render word ───────────────────────────────────────────
function renderWord() {
  const w   = currentWord();
  const words = getWords();
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
  document.getElementById('bank').innerHTML =
    LETTERS.map(l => `<button class="tile" data-letter="${l}">${l}</button>`).join('');
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
  }
  renderAnswer();
  document.getElementById('next-btn').hidden = false;
  if (getSetting('feature_write', false)) enableAnswerCanvas();
}

function nextWord() {
  wordIdx++;
  if (wordIdx >= getWords().length) {
    wordIdx = 0;
    order   = shuffle(getWords().map((_, i) => i));
  }
  renderWord();
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

function speakCurrent() { speak(currentWord().word); }

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang  = 'en-GB'; u.rate = speechRate; u.pitch = 1.0;
  if (selectedVoice) u.voice = selectedVoice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
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
  // Draw blue baseline
  answerCtx.strokeStyle = '#64b5f6';
  answerCtx.lineWidth = 2; answerCtx.lineCap = 'square';
  const baseY = rect.height - 3;
  answerCtx.beginPath(); answerCtx.moveTo(0, baseY); answerCtx.lineTo(rect.width, baseY); answerCtx.stroke();
  answerWriteOn = false; answerDrawing = false;
  c.style.cursor = 'default';
}

function enableAnswerCanvas() {
  if (!answerCtx) return;
  answerWriteOn = true;
  answerCtx.strokeStyle = '#1C1C1E';
  answerCtx.lineWidth = 3; answerCtx.lineCap = 'round'; answerCtx.lineJoin = 'round';
  document.getElementById('answer-line').style.cursor = 'crosshair';
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

function renderTeacher() {
  const enabled = getEnabledIds();
  const c = document.getElementById('teacher-content');

  const voiceName = selectedVoice
    ? selectedVoice.name.replace(' (Enhanced)', ' ✦')
    : 'Default';

  c.innerHTML = `
    <div>
      <div class="t-section-title">Activities shown to learners</div>
      <div class="t-card" id="act-toggles"></div>
    </div>
    <div>
      <div class="t-section-title">Filter word sets</div>
      <div id="set-filters"></div>
    </div>
    <div>
      <div class="t-section-title">Learning aids</div>
      <div class="t-card" id="aids-toggles">
        <div class="t-row">
          <div>
            <div class="t-row-label">Elkonin Boxes</div>
            <div class="t-row-desc">Phoneme boxes instead of a flat tile row</div>
          </div>
          <label class="ios-toggle">
            <input type="checkbox" id="toggle-elkonin" ${getSetting('feature_elkonin', false) ? 'checked' : ''}>
            <div class="ios-toggle-track"></div>
            <div class="ios-toggle-thumb"></div>
          </label>
        </div>
        <div class="t-row">
          <div>
            <div class="t-row-label">Write the Word</div>
            <div class="t-row-desc">Drawing canvas after each word is checked</div>
          </div>
          <label class="ios-toggle">
            <input type="checkbox" id="toggle-write" ${getSetting('feature_write', false) ? 'checked' : ''}>
            <div class="ios-toggle-track"></div>
            <div class="ios-toggle-thumb"></div>
          </label>
        </div>
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
    </div>
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

  // Activity toggles
  const toggleWrap = document.getElementById('act-toggles');
  activities.forEach(act => {
    const meta = ACT_META[act.id] || {};
    const row  = document.createElement('div');
    row.className = 't-row';
    const isOn = enabled.has(act.id);
    row.innerHTML = `
      <span class="t-row-label">${meta.icon || ''} ${act.name}</span>
      <label class="ios-toggle">
        <input type="checkbox" data-act-id="${act.id}" ${isOn ? 'checked' : ''}>
        <div class="ios-toggle-track"></div>
        <div class="ios-toggle-thumb"></div>
      </label>`;
    toggleWrap.appendChild(row);
  });

  // Voice select
  const vsel = document.getElementById('t-voice-select');
  populateVoiceSelect(vsel);

  // Rate slider
  document.getElementById('t-rate').addEventListener('input', e => {
    speechRate = parseFloat(e.target.value);
    document.getElementById('t-rate-val').textContent = `${speechRate.toFixed(2)}×`;
    localStorage.setItem('spelling_rate', speechRate);
    syncRateUI();
  });

  document.getElementById('t-test-btn').addEventListener('click', () => {
    speak('Can you spell the word?');
  });

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
      localStorage.removeItem('teacher_pin');
      localStorage.removeItem('spelling_voice');
      localStorage.removeItem('spelling_rate');
      localStorage.removeItem('feature_elkonin');
      localStorage.removeItem('feature_write');
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

  // Learning aids toggle listeners
  document.getElementById('toggle-elkonin').addEventListener('change', e => {
    localStorage.setItem('feature_elkonin', e.target.checked);
  });
  document.getElementById('toggle-write').addEventListener('change', e => {
    localStorage.setItem('feature_write', e.target.checked);
  });

  // Activity toggle listeners
  toggleWrap.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => {
      const ids = [...toggleWrap.querySelectorAll('input:checked')].map(i => i.dataset.actId);
      localStorage.setItem('enabled_activities', JSON.stringify(ids));
      renderHome();
    });
  });

  // Set filter chips
  const sfWrap = document.getElementById('set-filters');
  activities.filter(a => a.sets && enabled.has(a.id)).forEach(act => {
    const card = document.createElement('div');
    card.className = 't-card t-set-card';
    const enabledSets = getEnabledSets(act.id);
    const actMeta = ACT_META[act.id] || {};

    const heading = document.createElement('div');
    heading.className = 't-sub-heading';
    heading.textContent = `${actMeta.icon || ''} ${act.name}`;
    card.appendChild(heading);

    const chipGrid = document.createElement('div');
    chipGrid.className = 'set-chip-grid';

    act.sets.forEach(s => {
      const sMeta = SET_META[s.id] || {};
      const btn = document.createElement('button');
      btn.className = 'set-chip' + (enabledSets.has(s.id) ? ' on' : '');
      btn.dataset.setId = s.id;
      btn.style.setProperty('--chip-color', sMeta.color || '#8E8E93');
      btn.innerHTML = `${sMeta.icon || ''} <strong>${s.id}</strong>`;
      btn.addEventListener('click', () => {
        const cur = getEnabledSets(act.id);
        if (cur.has(s.id)) {
          if (cur.size > 1) cur.delete(s.id);
        } else {
          cur.add(s.id);
        }
        localStorage.setItem(`enabled_sets_${act.id}`, JSON.stringify([...cur]));
        btn.className = 'set-chip' + (cur.has(s.id) ? ' on' : '');
      });
      chipGrid.appendChild(btn);
    });

    card.appendChild(chipGrid);
    sfWrap.appendChild(card);
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
  // Ensure saved IDs still exist in the data
  const all = new Set(activities.map(a => a.id));
  const stored = localStorage.getItem('enabled_activities');
  if (stored) {
    try {
      const ids = JSON.parse(stored).filter(id => all.has(id));
      localStorage.setItem('enabled_activities', JSON.stringify(ids));
    } catch {}
  }
}

// ── Event binding ─────────────────────────────────────────
function bindEvents() {
  // Home: activity card tapped
  document.getElementById('activity-grid').addEventListener('click', e => {
    const card = e.target.closest('.act-card');
    if (!card) return;
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
    const card = e.target.closest('.set-card');
    if (!card) return;
    startSpelling(actIdx, card.dataset.setId);
  });

  // Pick: back
  document.getElementById('pick-back').addEventListener('click', () => showScreen('home'));

  // Spell: back
  document.getElementById('spell-back').addEventListener('click', () => {
    const act = activities[actIdx];
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
