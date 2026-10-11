export const ANIMALS = [['🐶','Dog'],['🐱','Cat'],['🐼','Panda'],['🦁','Lion'],['🐵','Monkey'],['🐸','Frog'],['🐰','Rabbit'],['🐯','Tiger'],['🐻','Bear'],['🐨','Koala'],['🦊','Fox'],['🐮','Cow']];
export const LEVELS = { easy: { label: 'Easy', pairs: 4 }, medium: { label: 'Medium', pairs: 6 }, hard: { label: 'Hard', pairs: 8 } };
export function shuffle(items, random = Math.random) { const result = [...items]; for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; }
export class MemoryGame {
  constructor(level = 'easy', now = () => performance.now()) { this.now = now; this.reset(level); }
  reset(level = this.level) {
    this.level = LEVELS[level] ? level : 'easy'; this.pairs = LEVELS[this.level].pairs;
    this.cards = shuffle(shuffle(ANIMALS).slice(0, this.pairs).flatMap(([emoji,name], pair) => [0,1].map(copy => ({ id: `${pair}-${copy}`, pair, emoji, name, matched: false }))));
    this.selected = []; this.moves = 0; this.matched = 0; this.combo = 0; this.bonus = 0; this.started = false; this.paused = false; this.won = false; this.elapsed = 0; this.last = this.now(); this.pending = null;
  }
  tick() {
    const current = this.now(), delta = Math.max(0, current - this.last); this.last = current;
    if (!this.started || this.paused || this.won) return false;
    this.elapsed += delta;
    if (this.pending !== null) { this.pending -= delta; if (this.pending <= 0) { this.pending = null; this.selected = []; return true; } }
    return false;
  }
  flip(index) {
    this.tick(); const card = this.cards[index];
    if (!card || this.paused || this.won || this.pending !== null || card.matched || this.selected.includes(index)) return null;
    this.started = true; this.selected.push(index);
    if (this.selected.length < 2) return 'flip';
    this.moves++;
    const [a,b] = this.selected.map(i => this.cards[i]);
    if (a.pair === b.pair) { a.matched = b.matched = true; this.matched++; this.combo++; this.bonus += Math.max(0, this.combo - 1) * 40; this.selected = []; if (this.matched === this.pairs) { this.won = true; return 'win'; } return 'match'; }
    this.combo = 0; this.pending = 900; return 'miss';
  }
  pause() { this.tick(); if (!this.won) this.paused = true; }
  resume() { this.last = this.now(); this.paused = false; }
  get score() { return Math.max(0, this.matched * 200 + this.bonus - Math.max(0,this.moves - this.matched) * 25 - Math.floor(this.elapsed / 1000) * 2); }
  get stars() { return this.moves <= this.pairs * 1.5 ? 3 : this.moves <= this.pairs * 2.5 ? 2 : 1; }
}
