'use strict';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

// ARASAAC — free educational symbol library (CC BY-NC-SA 4.0, arasaac.org)
// Image IDs are cached in localStorage so the search API is only called once per word.
const ARASAAC_SEARCH = w =>
  `https://api.arasaac.org/v1/pictograms/en/search/${encodeURIComponent(w)}`;
const ARASAAC_IMG = id =>
  `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;

let activities = [];
let actIdx  = 0;
let wordIdx = 0;
let order   = [];
let answer  = [];
let checked = false;

// ── Bootstrap ────────────────────────────────────────────

async function init() {
  try {
    const res = await fetch('words.json');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    activities = data.activities;
  } catch {
    // Fallback: app still loads, just no words
    document.getElementById('feedback').textContent = 'Could not load words.json';
    return;
  }

  initVoices();
  bindEvents();
  loadActivity(0);
  registerSW();
}

// ── Activity ─────────────────────────────────────────────

function loadActivity(idx) {
  actIdx  = idx;
  order   = shuffle(activities[idx].words.map((_, i) => i));
  wordIdx = 0;
  answer  = [];
  checked = false;
  renderTabs();
  renderBank();
  renderWord();
}

function currentActivity() { return activities[actIdx]; }
function currentWord()     { return currentActivity().words[order[wordIdx]]; }

// ── Render ────────────────────────────────────────────────

function renderTabs() {
  const nav = document.getElementById('tabs');
  nav.innerHTML = activities.map((a, i) => {
    const active = i === actIdx ? ' active' : '';
    return `<button class="tab${active}" role="tab" aria-selected="${i === actIdx}" data-act="${i}">${a.name}</button>`;
  }).join('');
}

function renderBank() {
  const bank = document.getElementById('bank');
  bank.innerHTML = LETTERS.map(l =>
    `<button class="tile" data-letter="${l}">${l}</button>`
  ).join('');
}

function renderWord() {
  const w   = currentWord();
  const act = currentActivity();
  answer  = [];
  checked = false;

  document.getElementById('sound-badge').textContent = w.sound || '';
  document.getElementById('progress').textContent =
    `${wordIdx + 1} / ${act.words.length}`;
  document.getElementById('next-btn').hidden = true;
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = '';

  renderAnswer();
  loadWordImage(w.word);
  setTimeout(speakCurrent, 350);
}

// ── ARASAAC image loading ─────────────────────────────────

async function loadWordImage(word) {
  const img      = document.getElementById('word-image');
  const fallback = document.getElementById('symbol-fallback');

  img.src = '';
  img.style.display = 'block';
  fallback.className = '';
  fallback.textContent = '';

  // Use cached ID if available
  const cacheKey = `arasaac_id_${word}`;
  const cached   = localStorage.getItem(cacheKey);

  if (cached === 'none') {
    showFallback(word);
    return;
  }

  if (cached) {
    img.src = ARASAAC_IMG(cached);
    return;
  }

  try {
    const res  = await fetch(ARASAAC_SEARCH(word));
    if (!res.ok) throw new Error('no results');
    const data = await res.json();
    if (!data || data.length === 0) throw new Error('empty');
    const id = data[0]._id;
    localStorage.setItem(cacheKey, id);
    img.src = ARASAAC_IMG(id);
  } catch {
    localStorage.setItem(cacheKey, 'none');
    showFallback(word);
  }
}

function showFallback(word) {
  const img      = document.getElementById('word-image');
  const fallback = document.getElementById('symbol-fallback');
  img.style.display = 'none';
  fallback.className   = 'visible';
  // Use emoji if available, otherwise first letter
  fallback.textContent = EMOJI[word] || word[0].toUpperCase();
}

// Emoji fallbacks for words that may not return a clear ARASAAC symbol
const EMOJI = {
  cat:'🐱', dog:'🐶', sun:'☀️', hat:'🎩', bed:'🛏️', pig:'🐷', cup:'🍵',
  fox:'🦊', van:'🚐', web:'🕸️', zip:'🤐', jet:'✈️', run:'🏃', hop:'🐸',
  log:'🪵', bun:'🍞', top:'🎯', red:'🔴', hot:'🌡️', wet:'💧', cut:'✂️',
  bag:'👜', pot:'🍲', map:'🗺️', gun:'🔫', fit:'💪', big:'⬆️', dig:'⛏️',
  net:'🎣', lid:'🫙',
  chip:'🍟', chat:'💬', ship:'🚢', shop:'🛒', fish:'🐟', dish:'🍽️',
  shell:'🐚', ring:'💍', sing:'🎤', song:'🎵', king:'👑', wing:'🪶',
  back:'⬅️', duck:'🦆', lock:'🔒', sock:'🧦',
  rain:'🌧️', tail:'🐱', sail:'⛵', snail:'🐌', train:'🚂', tree:'🌳',
  boat:'⛵', coat:'🧥', road:'🛣️', moon:'🌙', pool:'🏊', spoon:'🥄',
  book:'📚', cook:'👨‍🍳', food:'🍱',
  light:'💡', night:'🌙', right:'✅', fight:'🥊', bright:'✨', tight:'🪢',
  catch:'🫙', match:'🔥', witch:'🧙', chair:'🪑', hair:'💇', fair:'🎡',
  stair:'🪜', ear:'👂', hear:'👂', near:'📍', fear:'😨', year:'📅',
  clear:'🔍', pair:'👯'
};

function renderAnswer() {
  const w = currentWord();
  const sound = w.sound || '';
  const pos   = sound ? w.word.indexOf(sound) : -1;
  const len   = sound.length;

  document.getElementById('answer-tiles').innerHTML = answer.map((l, i) => {
    const hl = checked && pos >= 0 && i >= pos && i < pos + len ? ' highlight' : '';
    return `<button class="tile answer-tile${hl}" data-idx="${i}">${l}</button>`;
  }).join('');
}

// ── Interaction ───────────────────────────────────────────

function addLetter(letter) {
  if (checked) return;
  answer.push(letter);
  renderAnswer();
}

function removeLetter(idx) {
  if (checked) return;
  answer.splice(idx, 1);
  renderAnswer();
}

function clearAnswer() {
  if (checked) return;
  answer  = [];
  checked = false;
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = '';
  renderAnswer();
}

function checkAnswer() {
  if (checked) return;
  const w      = currentWord();
  const typed  = answer.join('');
  const fb     = document.getElementById('feedback');
  checked = true;

  if (typed === w.word) {
    fb.className   = 'correct';
    fb.textContent = '✓  Correct!';
  } else {
    fb.className   = 'incorrect';
    // Show the correct answer as tiles
    answer = w.word.split('');
    fb.textContent = `✗  The word is: ${w.word}`;
  }

  renderAnswer();
  document.getElementById('next-btn').hidden = false;
}

function nextWord() {
  wordIdx++;
  if (wordIdx >= currentActivity().words.length) {
    wordIdx = 0;
    order   = shuffle(currentActivity().words.map((_, i) => i));
  }
  renderWord();
}

// ── Speech ────────────────────────────────────────────────

let selectedVoice = null;
let speechRate    = 0.75;

// Preferred voices in quality order — Apple enhanced voices are best for children
const PREFERRED_VOICES = [
  'Daniel (Enhanced)', 'Serena (Enhanced)', 'Kate (Enhanced)',
  'Daniel', 'Serena', 'Kate', 'Oliver', 'Arthur',
  'Microsoft Hazel', 'Microsoft George', 'Microsoft Susan',
  'Google UK English Female', 'Google UK English Male',
];

function initVoices() {
  const apply = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;

    // Restore saved preference
    const saved = localStorage.getItem('spelling_voice');
    if (saved) {
      const v = voices.find(v => v.name === saved);
      if (v) { selectedVoice = v; syncSettingsUI(); return; }
    }

    // Auto-pick best available
    for (const name of PREFERRED_VOICES) {
      const v = voices.find(v => v.name === name);
      if (v) { selectedVoice = v; syncSettingsUI(); return; }
    }
    // Fall back to any en-GB, then any English
    selectedVoice =
      voices.find(v => v.lang === 'en-GB') ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0];
    syncSettingsUI();
  };

  apply();
  window.speechSynthesis.addEventListener('voiceschanged', apply);

  // Restore saved speed
  const savedRate = parseFloat(localStorage.getItem('spelling_rate') || '');
  if (!isNaN(savedRate)) speechRate = savedRate;
}

function populateVoiceSelect() {
  const sel    = document.getElementById('voice-select');
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;

  // Show en-GB first, then other English, grouped
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
    const g = document.createElement('optgroup');
    g.label = 'English (UK)';
    gb.forEach(v => g.appendChild(makeOpt(v)));
    sel.appendChild(g);
  }
  if (enOther.length) {
    const g = document.createElement('optgroup');
    g.label = 'English (other)';
    enOther.forEach(v => g.appendChild(makeOpt(v)));
    sel.appendChild(g);
  }
}

function syncSettingsUI() {
  const rateInput = document.getElementById('rate-range');
  const rateLabel = document.getElementById('rate-label');
  if (rateInput) {
    rateInput.value    = speechRate;
    rateLabel.textContent = `${speechRate.toFixed(2)}×`;
  }
}

function speakCurrent() {
  speak(currentWord().word);
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const u   = new SpeechSynthesisUtterance(text);
  u.lang    = 'en-GB';
  u.rate    = speechRate;
  u.pitch   = 1.0;
  if (selectedVoice) u.voice = selectedVoice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// ── Events (delegation) ───────────────────────────────────

function bindEvents() {
  document.getElementById('tabs').addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (btn) loadActivity(+btn.dataset.act);
  });

  document.getElementById('bank').addEventListener('click', e => {
    const btn = e.target.closest('.tile');
    if (btn) addLetter(btn.dataset.letter);
  });

  document.getElementById('answer-tiles').addEventListener('click', e => {
    const btn = e.target.closest('.answer-tile');
    if (btn) removeLetter(+btn.dataset.idx);
  });

  const card = document.getElementById('symbol-card');
  card.addEventListener('click', speakCurrent);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') speakCurrent(); });

  document.getElementById('clear-btn').addEventListener('click', clearAnswer);
  document.getElementById('check-btn').addEventListener('click', checkAnswer);
  document.getElementById('next-btn').addEventListener('click',  nextWord);

  // Settings panel
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('settings-close-btn').addEventListener('click', closeSettings);
  document.getElementById('settings-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeSettings();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSettings();
  });

  document.getElementById('voice-select').addEventListener('change', e => {
    const voices = window.speechSynthesis.getVoices();
    selectedVoice = voices.find(v => v.name === e.target.value) || selectedVoice;
    localStorage.setItem('spelling_voice', selectedVoice.name);
  });

  document.getElementById('rate-range').addEventListener('input', e => {
    speechRate = parseFloat(e.target.value);
    document.getElementById('rate-label').textContent = `${speechRate.toFixed(2)}×`;
    localStorage.setItem('spelling_rate', speechRate);
  });

  document.getElementById('test-voice-btn').addEventListener('click', () => {
    speak('Can you spell the word?');
  });
}

function openSettings() {
  populateVoiceSelect();
  syncSettingsUI();
  document.getElementById('settings-overlay').hidden = false;
}

function closeSettings() {
  document.getElementById('settings-overlay').hidden = true;
}

// ── Utils ─────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Service Worker ────────────────────────────────────────

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

// ── Go ────────────────────────────────────────────────────

init();
