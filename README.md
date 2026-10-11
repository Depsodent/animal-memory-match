# Animal Memory Match

A cheerful, responsive memory game for ages 6–8. Built with HTML, CSS, vanilla JavaScript and Vite. Animal artwork uses local emoji; sounds are synthesized with Web Audio. No backend, accounts, fonts, image downloads or external APIs.

Developer credit: Made by Aaryan.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev -- --host 127.0.0.1
```

Open the URL printed by Vite (normally http://127.0.0.1:5173). If npm is unavailable, `pnpm install` and `pnpm dev -- --host 127.0.0.1` also work.

```sh
npm test
npm run build
npm run preview
```

## Play

Choose Easy (4 pairs), Medium (6 pairs), or Hard (8 pairs). Flip two cards with a mouse, touch, or Tab and Enter/Space. Matches stay visible. A mismatch hides after 900 milliseconds of active play. Escape pauses or resumes; switching tabs automatically pauses. Restart creates a fresh shuffled deck.

The timer starts on the first card. Score = 200 per matched pair, plus 40 × (streak length − 1) per consecutive match, minus 25 per unsuccessful attempt and 2 per active second, with a minimum of zero. Three stars require at most 1.5 × the pair count in moves; two stars require at most 2.5 ×. There is no time limit. Best scores are saved separately per difficulty, alongside sound, tutorial and difficulty preferences. Storage or audio failures do not prevent play.

## Files

- `src/game.js`: independent game state, Fisher–Yates shuffle, timing, scoring and pause logic.
- `src/main.js`: screens, accessible controls and UI updates.
- `src/audio.js`: gentle sound synthesis, initialized after interaction.
- `src/storage.js`: guarded local preferences and records.
- `src/style.css`: responsive design, card flips, confetti and reduced-motion support.
- `test/game.test.js`: game and persistence regression tests using Node's built-in test runner.

No external assets are required. Emoji appearance varies by operating system. Clearing browser storage resets records. A production build is output to `dist/`.

## Credits

Made by Aaryan
