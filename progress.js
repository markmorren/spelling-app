// ── Learner progress (device-local, rule-based) ───────────────
// Records every spelling attempt so the app can tell where a learner is
// going right and wrong, surface a "tricky words" practice round, and show
// the teacher a simple diagnosis. No data leaves the device.
//
// Store shape (localStorage key `spelling_progress_v1`):
//   { v: 1, words: { "<word>": {
//       sound: "ai",      // phonics focus carried from words.json
//       right: 3,         // times spelled correctly, all-time
//       wrong: 1,         // times spelled incorrectly, all-time
//       streak: 2,        // consecutive correct (0 whenever wrong)
//       lastWrong: "rane",// most recent wrong attempt (for the teacher)
//       last: 1733660000  // ms timestamp of the last attempt
//   } } }
//
// A word counts as "tricky" (worth re-practising) when it has been wrong at
// least once and has not yet been spelled correctly MASTERY times in a row.

const PROGRESS_KEY = 'spelling_progress_v1';
const MASTERY = 2;          // consecutive-correct answers to retire a tricky word
const TRICKY_ROUND = 12;    // words in an auto-built tricky round

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { v: 1, words: {} };
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !data.words) return { v: 1, words: {} };
    return data;
  } catch {
    return { v: 1, words: {} };
  }
}

function saveProgress(data) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(data)); } catch {}
}

// Record one attempt. `wordObj` is {word, sound}; `typed` is what the learner
// built; `correct` is whether it matched.
function recordAttempt(wordObj, typed, correct) {
  if (!wordObj || !wordObj.word) return;
  const data = loadProgress();
  const key  = wordObj.word;
  const e = data.words[key] || { sound: '', right: 0, wrong: 0, streak: 0, lastWrong: '', last: 0 };
  e.sound = wordObj.sound || e.sound || '';
  if (correct) {
    e.right  += 1;
    e.streak += 1;
  } else {
    e.wrong      += 1;
    e.streak      = 0;
    e.lastWrong   = typed || '';
  }
  e.last = Date.now();
  data.words[key] = e;
  saveProgress(data);
}

// Words still worth practising, weakest first. Returns playable {word, sound}
// objects so a round can be built straight from the store.
function trickyEntries() {
  const data = loadProgress();
  return Object.entries(data.words)
    .filter(([, e]) => e.wrong > 0 && e.streak < MASTERY)
    .sort((a, b) =>
      a[1].streak - b[1].streak ||   // never-mastered first
      b[1].wrong  - a[1].wrong  ||   // most-missed next
      a[1].last   - b[1].last        // least-recently-seen next
    );
}

function getTrickyWords(limit = TRICKY_ROUND) {
  return trickyEntries()
    .slice(0, limit)
    .map(([word, e]) => ({ word, sound: e.sound || '' }));
}

function trickyCount() {
  return trickyEntries().length;
}

// Per-sound accuracy, weakest first, for the teacher diagnosis panel.
function getSoundStats() {
  const data = loadProgress();
  const by = {};
  Object.values(data.words).forEach(e => {
    const s = e.sound || '(whole word)';
    const agg = by[s] || { sound: s, right: 0, wrong: 0 };
    agg.right += e.right;
    agg.wrong += e.wrong;
    by[s] = agg;
  });
  return Object.values(by)
    .map(a => {
      const total = a.right + a.wrong;
      return { ...a, total, pct: total ? Math.round((a.right / total) * 100) : 0 };
    })
    .filter(a => a.total > 0)
    .sort((a, b) => a.pct - b.pct || b.wrong - a.wrong);
}

// Overall headline numbers for the panel.
function getProgressSummary() {
  const data  = loadProgress();
  const words = Object.values(data.words);
  const right = words.reduce((n, e) => n + e.right, 0);
  const wrong = words.reduce((n, e) => n + e.wrong, 0);
  const total = right + wrong;
  return {
    wordsPractised: words.length,
    attempts: total,
    pct: total ? Math.round((right / total) * 100) : 0,
    tricky: trickyCount(),
  };
}

function clearProgress() {
  try { localStorage.removeItem(PROGRESS_KEY); } catch {}
}
