// Entry point. Boots the renderer + scene + input, then runs the frame loop.
// See .ogf/conventions.md for why this file is small (and what each module does).

import { initRenderer, errorScreen } from './render.js';
import { loadLevels, switchScene, drawCurrent } from './scene.js';
import { endFrame, initInput } from './input.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

async function start() {
  initRenderer(canvas, ctx);
  initInput(canvas);

  const levels = await loadLevels();
  const first = levels.levels?.[0]?.id ?? 'level1';
  await switchScene(first);

  let lastNow = 0;
  function frame(now) {
    const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0;
    lastNow = now;
    drawCurrent(now / 1000, dt);
    endFrame();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

start().catch((err) => {
  console.error(err);
  errorScreen('start() failed: ' + (err?.message ?? err));
});
