const KEY = 'animal-memory-match-v1';
export function readStorage() {
  try { const data = JSON.parse(localStorage.getItem(KEY)) || {}; return { sound: data.sound !== false, difficulty: ['easy','medium','hard'].includes(data.difficulty) ? data.difficulty : 'easy', tutorial: data.tutorial === true, best: data.best && typeof data.best === 'object' ? data.best : {} }; }
  catch { return { sound: true, difficulty: 'easy', tutorial: false, best: {} }; }
}
export function saveStorage(data) { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* Play remains available when storage is blocked. */ } }
