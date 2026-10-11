import './style.css';
import { MemoryGame, LEVELS } from './game.js';
import { Sounds } from './audio.js';
import { readStorage, saveStorage } from './storage.js';

const prefs = readStorage(), sound = new Sounds(prefs.sound);
let game, screen = 'menu', modalReturn;
const app = document.querySelector('#app');
const time = ms => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2,'0')}`;
app.innerHTML = `<div class="sky" aria-hidden="true"><span class="cloud c1"></span><span class="cloud c2"></span><span class="spark s1">✦</span><span class="spark s2">✧</span><span class="spark s3">✦</span><span class="bubble"></span></div>
  <header class="topbar"><a class="brand" href="#" aria-label="Animal Memory Match home"><span class="brand-icon">✿</span> little wild <span class="brand-tag">PLAY CLUB</span></a><button class="sound icon-button" aria-label="Turn sound off"></button></header>
  <main id="main"></main>
  <div class="developer-credit" aria-label="Developer credit">Made by Aaryan</div>
  <footer>Made for little minds. Big discoveries. <span>✦</span></footer>
  <dialog id="help"><button class="close icon-button" aria-label="Close instructions">×</button><div class="dialog-emoji">🐼</div><h2>Let’s find some friends!</h2><ol><li>Flip a card to meet an animal.</li><li>Find its twin by flipping another.</li><li>Match every pair. You’ve got this!</li></ol><p>Take your time — there’s no time limit.</p><button class="primary" id="got-it">Got it! <span>→</span></button></dialog>
  <div id="announcer" class="sr-only" aria-live="polite"></div>`;
const main = document.querySelector('#main'), help = document.querySelector('#help');
function announce(message) { document.querySelector('#announcer').textContent = message; }
function updateSound() { const button = document.querySelector('.sound'); button.textContent = prefs.sound ? '♫' : '♪'; button.classList.toggle('muted', !prefs.sound); button.setAttribute('aria-label', prefs.sound ? 'Turn sound off' : 'Turn sound on'); button.setAttribute('aria-pressed', String(prefs.sound)); }
document.querySelector('.sound').onclick = () => { prefs.sound = !prefs.sound; sound.enabled = prefs.sound; saveStorage(prefs); updateSound(); sound.play('click'); };
document.querySelector('.brand').onclick = event => { event.preventDefault(); showMenu(); };
function showHelp() { modalReturn = document.activeElement; help.showModal(); }
function closeHelp() { help.close(); prefs.tutorial = true; saveStorage(prefs); modalReturn?.focus(); }
document.querySelector('.close').onclick = closeHelp; document.querySelector('#got-it').onclick = closeHelp;
help.addEventListener('cancel', () => { prefs.tutorial = true; saveStorage(prefs); });
function showMenu() {
  screen = 'menu'; game = null;
  main.innerHTML = `<section class="home"><div class="eyebrow"><span></span> A LITTLE PLAY. A LOT OF DISCOVERY.</div><h1>Animal<br><span>Memory Match</span><i aria-hidden="true">✦</i></h1><p class="intro">Little animals. Big memory adventures.<br>Find the pairs and make some furry friends!</p>
    <div class="animal-parade" aria-hidden="true"><div class="animal-tile tile-frog"><span>🐸</span><small>hoppy to see you!</small></div><div class="animal-tile tile-lion"><span>🦁</span><small>let’s play!</small></div><div class="animal-tile tile-panda"><span>🐼</span><small>find my friend!</small></div><span class="parade-star">✧</span></div>
    <div class="play-panel"><div class="panel-label">CHOOSE YOUR ADVENTURE</div><div class="levels">${Object.entries(LEVELS).map(([key, level],i) => `<button class="level ${prefs.difficulty === key ? 'active' : ''}" data-level="${key}" aria-pressed="${prefs.difficulty === key}"><span class="level-symbol">${['🌱','🌼','🌳'][i]}</span><strong>${level.label}</strong><small>${level.pairs} pairs</small><span class="selected-dot">✓</span></button>`).join('')}</div><button id="play" class="primary">Play Game <span>→</span></button><button id="how" class="text-button">ⓘ &nbsp; How to Play</button></div>
    <div class="best-pill">🏆 <span>Your best <strong id="best">${Number(prefs.best[prefs.difficulty]) || '—'}</strong></span><span class="pill-divider"></span><span id="best-level">${LEVELS[prefs.difficulty].label} adventure</span></div><div class="home-note">A happy little workout for your brain <span>♡</span></div></section>`;
  main.querySelectorAll('[data-level]').forEach(button => button.onclick = () => { prefs.difficulty = button.dataset.level; saveStorage(prefs); sound.play('click'); showMenu(); main.querySelector(`[data-level="${prefs.difficulty}"]`).focus(); });
  document.querySelector('#play').onclick = () => { start(); if (!prefs.tutorial) showHelp(); };
  document.querySelector('#how').onclick = showHelp;
}
function start(level = prefs.difficulty) {
  prefs.difficulty = level; saveStorage(prefs); game = new MemoryGame(level); screen = 'game'; sound.play('click');
  main.innerHTML = `<section class="game-screen"><div class="game-heading"><button id="menu" class="text-button">← <span>Main menu</span></button><span class="difficulty-badge">${LEVELS[level].label} adventure</span><div class="game-actions"><button id="restart" class="icon-button" aria-label="Restart game">↻</button><button id="pause" class="icon-button" aria-label="Pause game">Ⅱ</button></div></div><h2>Find your animal friends<span>!</span></h2><p class="game-subtitle">Two little cards. One perfect pair.</p><div class="stats"><div><small>MOVES</small><strong id="moves">0</strong></div><div><small>TIME</small><strong id="timer">0:00</strong></div><div><small>PAIRS</small><strong id="pairs">0 <em>/ ${game.pairs}</em></strong></div><div><small>SCORE</small><strong id="score">0</strong></div></div><div class="progress" role="progressbar" aria-label="Pairs found" aria-valuemin="0" aria-valuemax="${game.pairs}" aria-valuenow="0"><div></div></div><div class="board-wrap"><div class="board" aria-label="Animal cards">${game.cards.map((card,index) => `<button class="card" data-index="${index}" aria-label="Hidden animal, card ${index + 1}"><span class="card-inner"><span class="card-back" aria-hidden="true"><span>✿</span><small>little wild</small></span><span class="card-front" aria-hidden="true"><span>${card.emoji}</span><small>${card.name}</small><i>✓</i></span></span></button>`).join('')}</div><div class="pause-overlay" hidden><span>☁</span><h2>A little breather</h2><p>Your animal friends will wait.</p><button id="resume" class="primary">Keep playing →</button></div></div><p class="encouragement" aria-live="polite">Flip a card. Your adventure starts here! ✨</p></section>`;
  main.querySelectorAll('.card').forEach(button => button.onclick = () => {
    const result = game.flip(Number(button.dataset.index)); if (!result) return;
    sound.play(result); updateCards(); updateStats();
    if (result === 'match' || result === 'win') { const words = ['Great job!', 'Awesome!', 'Fantastic!', 'What a match!']; document.querySelector('.encouragement').textContent = `${words[Math.floor(Math.random()*words.length)]} ${game.combo > 1 ? `🔥 ${game.combo} in a row!` : 'You found some friends! ✨'}`; }
    if (result === 'miss') document.querySelector('.encouragement').textContent = 'Keep exploring. Remember those little faces! 💛';
    if (result === 'win') victory();
  });
  document.querySelector('#restart').onclick = () => start(); document.querySelector('#menu').onclick = showMenu;
  document.querySelector('#pause').onclick = pause; document.querySelector('#resume').onclick = resume;
}
function updateCards() { main.querySelectorAll('.card').forEach((button,index) => { const card = game.cards[index], revealed = card.matched || game.selected.includes(index); button.classList.toggle('flipped', revealed); button.classList.toggle('matched', card.matched); button.setAttribute('aria-label', revealed ? `${card.name}${card.matched ? ', matched' : ''}` : `Hidden animal, card ${index+1}`); button.setAttribute('aria-disabled', String(card.matched || game.paused)); }); }
function updateStats() {
  if (screen !== 'game') return;
  document.querySelector('#moves').textContent = game.moves; document.querySelector('#timer').textContent = time(game.elapsed); document.querySelector('#pairs').innerHTML = `${game.matched} <em>/ ${game.pairs}</em>`;
  const score = document.querySelector('#score'); if (score.textContent !== String(game.score)) { score.classList.remove('score-pop'); void score.offsetWidth; score.classList.add('score-pop'); } score.textContent = game.score;
  document.querySelector('.progress').setAttribute('aria-valuenow', game.matched); document.querySelector('.progress > div').style.width = `${game.matched/game.pairs*100}%`;
}
function pause() { if (screen !== 'game' || game.paused) return; game.pause(); document.querySelector('.board').inert = true; document.querySelector('.board').style.visibility = 'hidden'; document.querySelector('.pause-overlay').hidden = false; document.querySelector('#resume').focus(); announce('Game paused'); }
function resume() { game.resume(); document.querySelector('.board').inert = false; document.querySelector('.board').style.visibility = ''; document.querySelector('.pause-overlay').hidden = true; document.querySelector('#pause').focus(); }
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !help.open && screen === 'game') game.paused ? resume() : pause(); });
function victory() {
  screen = 'victory'; const record = prefs.best[game.level] === undefined || game.score > prefs.best[game.level];
  if (record) { prefs.best[game.level] = game.score; saveStorage(prefs); }
  const next = { easy: 'medium', medium: 'hard' }[game.level];
  main.innerHTML = `<section class="victory"><div class="confetti" aria-hidden="true">${Array.from({length:30},(_,i) => `<i style="--x:${(i*37)%100}%;--delay:${(i%7)*.15}s;--color:${['#a18ad7','#f4b4be','#efd277','#8bcdc0'][i%4]}"></i>`).join('')}</div><div class="eyebrow">ALL FRIENDS FOUND</div><div class="trophy">🏆</div><div class="stars" aria-label="${game.stars} out of 3 stars">${'★'.repeat(game.stars)}<span>${'★'.repeat(3-game.stars)}</span></div><h1>Amazing!<br><span>You Did It!</span></h1><p class="intro">A big cheer for your brilliant little brain!</p><div class="result-card"><div class="record">${record ? '✦ A new personal best! ✦' : '✨ Another wonderful adventure!'}</div><strong class="final-score">${game.score}<small>POINTS</small></strong><div class="result-details"><span>◷ <strong>${time(game.elapsed)}</strong> time</span><span>↻ <strong>${game.moves}</strong> moves</span></div></div><div class="victory-actions"><button id="again" class="primary">Play Again <span>↻</span></button>${next ? `<button id="next" class="secondary">Try ${LEVELS[next].label} →</button>` : ''}<button id="home" class="text-button">← Main Menu</button></div></section>`;
  document.querySelector('#again').onclick = () => start(); if(next) document.querySelector('#next').onclick = () => start(next); document.querySelector('#home').onclick = showMenu; document.querySelector('#again').focus(); announce(`Amazing! You did it! ${game.score} points and ${game.stars} stars.`);
}
setInterval(() => { if (screen === 'game' && game) { if(game.tick()) updateCards(); updateStats(); } }, 100);
updateSound(); showMenu();
