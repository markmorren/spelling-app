'use strict';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

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
  // Slight delay so the UI settles before speaking
  setTimeout(speakCurrent, 350);
}

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

function speakCurrent() {
  speak(currentWord().word);
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const u  = new SpeechSynthesisUtterance(text);
  u.lang   = 'en-GB';
  u.rate   = 0.82;
  u.pitch  = 1.05;
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

  document.getElementById('speak-btn').addEventListener('click', speakCurrent);
  document.getElementById('clear-btn').addEventListener('click', clearAnswer);
  document.getElementById('check-btn').addEventListener('click', checkAnswer);
  document.getElementById('next-btn').addEventListener('click',  nextWord);
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
