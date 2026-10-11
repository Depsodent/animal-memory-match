import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryGame, shuffle, LEVELS } from '../src/game.js';
import { readStorage, saveStorage } from '../src/storage.js';

for (const [level, { pairs }] of Object.entries(LEVELS)) {
  test(`${level}: correct deck, all pairs playable, victory and score`, () => {
    const game = new MemoryGame(level);
    assert.equal(game.cards.length, pairs * 2);
    for (let pair = 0; pair < pairs; pair++) {
      const indices = game.cards.flatMap((c,i) => c.pair === pair ? [i] : []);
      assert.equal(indices.length,2);
      assert.equal(game.flip(indices[0]), 'flip');
      assert.equal(game.flip(indices[1]), pair === pairs - 1 ? 'win' : 'match');
    }
    assert.equal(game.moves, pairs); assert.equal(game.matched,pairs); assert.equal(game.won,true); assert.equal(game.stars,3); assert.ok(game.score > 0);
    assert.equal(game.flip(0),null);
  });
}
test('shuffle preserves input and produces a known Fisher–Yates permutation', () => { const input = [1,2,3,4]; assert.deepEqual(shuffle(input, () => 0),[2,3,4,1]); assert.deepEqual(input,[1,2,3,4]); });
test('rapid clicks, mismatch lock, 900ms delay, timer and pause', () => {
  let now = 0; const game = new MemoryGame('easy', () => now);
  now = 5000; game.tick(); assert.equal(game.elapsed,0);
  game.flip(0); assert.equal(game.flip(0),null); assert.equal(game.moves,0);
  const other = game.cards.findIndex(c => c.pair !== game.cards[0].pair);
  assert.equal(game.flip(other),'miss'); assert.equal(game.moves,1); assert.equal(game.flip(2),null);
  now += 400; game.pause(); assert.equal(game.elapsed,400);
  now += 5000; game.tick(); assert.equal(game.pending,500); assert.equal(game.elapsed,400); assert.equal(game.flip(3),null);
  game.resume(); now += 499; game.tick(); assert.equal(game.selected.length,2);
  now++; assert.equal(game.tick(),true); assert.equal(game.selected.length,0); assert.equal(game.elapsed,900);
});
test('restart clears a pending mismatch, progress, pause and clock', () => {
  const game = new MemoryGame(); game.flip(0); game.flip(game.cards.findIndex(c => c.pair !== game.cards[0].pair)); game.pause(); game.reset('hard');
  assert.equal(game.pending,null); assert.equal(game.moves,0); assert.equal(game.elapsed,0); assert.equal(game.started,false); assert.equal(game.paused,false); assert.equal(game.cards.length,16);
});
test('victory stops elapsed time and matched cards cannot be selected', () => {
  let now = 0; const game = new MemoryGame('easy', () => now);
  for(let p = 0; p < game.pairs; p++) { game.cards.forEach((c,i) => { if(c.pair === p) game.flip(i); }); assert.equal(game.flip(game.cards.findIndex(c => c.pair === p)), null); }
  now = 10000; game.tick(); assert.equal(game.elapsed,0);
});
test('preferences and separate best scores survive a fresh read; corrupt storage is safe', () => {
  let value = null; globalThis.localStorage = { getItem: () => value, setItem: (_,next) => { value = next; } };
  const data = readStorage(); data.best = {easy:900, medium:1200}; data.sound = false; saveStorage(data);
  assert.equal(readStorage().best.easy,900); assert.equal(readStorage().best.medium,1200); assert.equal(readStorage().sound,false);
  value = '{bad'; assert.deepEqual(readStorage().best,{});
  globalThis.localStorage = { getItem() { throw Error(); }, setItem() { throw Error(); } }; assert.doesNotThrow(() => saveStorage(data)); assert.equal(readStorage().sound,true);
});
