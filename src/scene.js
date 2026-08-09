// Scene loader and draw dispatcher. Reads level JSON from data/, pre-loads
// every referenced sprite, hands the rendered scene to render.js. Add new
// state per-scene (entities, timers) as your game grows; keep IO + data
// shaping here.

import { loadJSON, loadImage } from './assets.js';
import { fitCanvas, drawBackground, drawDialogue, drawProps, drawSprite } from './render.js';
import { anyPressed } from './input.js';
import { createPlayer, updatePlayer, getPlayerSprite } from './player.js';

let levelsManifest = null;
let charactersCatalog = null;
let dialogueCatalog = null;
const cache = {};      // { sceneId: levelData }
const images = {};     // { 'assets/.../x.png': HTMLImageElement }
const metas = {};      // { 'assets/.../pipeline-meta.json': metadata }
let current = null;
let bg = null;
let player = null;
let activeDialogue = null;
let sceneSwitching = false;
const completedTriggers = new Set();

export async function loadLevels() {
  levelsManifest = await loadJSON('data/levels.json');
  charactersCatalog = await loadJSON('data/characters.json');
  dialogueCatalog = await loadJSON('data/dialogue.json');
  return levelsManifest;
}

export async function switchScene(id) {
  const entry = levelsManifest?.levels?.find((l) => l.id === id);
  if (!entry) throw new Error('unknown scene id: ' + id);
  if (!cache[id]) cache[id] = await loadJSON(entry.file);
  current = cache[id];

  fitCanvas(current);
  player = createPlayer(current);
  activeDialogue = null;

  // Pre-load this scene's background + every prop sprite.
  bg = current.background ? await safeImage(current.background) : null;
  await Promise.all(
    (current.props ?? []).map(async (p) => {
      if (p.image && !images[p.image]) images[p.image] = await safeImage(p.image);
    }),
  );
  await preloadCharacterAnimations();
}

async function safeImage(src) {
  try { return await loadImage(src); } catch (e) { console.warn(e); return null; }
}

export function getCurrentScene() { return current; }
export function getImage(src) { return images[src]; }

export function drawCurrent(nowSec, dt) {
  if (!current) return;
  if (!activeDialogue) updatePlayer(player, dt);
  updateMemoryTriggers();
  updateSceneExits();
  updateDialogue();

  drawBackground(bg);
  drawProps(current.props ?? [], (src) => images[src]);

  const sprites = [];
  for (const npc of current.npcs ?? []) {
    const character = characterById(npc.characterId);
    const animation = character?.animations?.[npc.animation ?? 'idle_side'];
    if (animation) {
      sprites.push({
        x: npc.position?.x ?? 0,
        y: npc.position?.y ?? 0,
        scale: npc.drawScale ?? character.recommendedScale ?? 1,
        flipX: npc.facing === 'left',
        animation,
      });
    }
  }

  const character = characterById(player?.characterId);
  const playerSprite = getPlayerSprite(player, character);
  if (playerSprite) sprites.push(playerSprite);

  sprites.sort((a, b) => a.y - b.y);
  for (const sprite of sprites) {
    const image = images[sprite.animation.sheet];
    const meta = metas[sprite.animation.meta];
    drawSprite({ ...sprite, anim: animFromMeta(meta) }, image, nowSec);
  }

  drawDialogue(dialogueView());
}

async function preloadCharacterAnimations() {
  const ids = new Set([current.player?.characterId, ...(current.npcs ?? []).map((npc) => npc.characterId)]);
  const needed = charactersCatalog.filter((c) => ids.has(c.id));

  await Promise.all(
    needed.flatMap((character) => Object.values(character.animations ?? {}).map(async (anim) => {
      if (anim.sheet && !images[anim.sheet]) images[anim.sheet] = await safeImage(anim.sheet);
      if (anim.meta && !metas[anim.meta]) metas[anim.meta] = await safeJSON(anim.meta);
    })),
  );
}

function characterById(id) {
  return charactersCatalog.find((c) => c.id === id);
}

function updateMemoryTriggers() {
  if (!player || activeDialogue || sceneSwitching) return;

  for (const trigger of current.memoryTriggers ?? []) {
    if (trigger.once && completedTriggers.has(trigger.id)) continue;
    if (!pointInRect(player.x, player.y, trigger.shape)) continue;

    activeDialogue = { triggerId: trigger.id, dialogueId: trigger.dialogueId, index: 0 };
    return;
  }
}

function updateSceneExits() {
  if (!player || activeDialogue || sceneSwitching) return;

  for (const exit of current.sceneExits ?? []) {
    if (!exit.targetLevel || !pointInRect(player.x, player.y, exit.shape)) continue;
    sceneSwitching = true;
    void switchScene(exit.targetLevel).finally(() => {
      sceneSwitching = false;
    });
    return;
  }
}

function updateDialogue() {
  if (!activeDialogue) return;
  if (!anyPressed(['Space', 'Enter'])) return;

  const dialogue = dialogueCatalog.memories?.[activeDialogue.dialogueId];
  const lines = dialogue?.lines ?? [];
  activeDialogue.index += 1;
  if (activeDialogue.index >= lines.length) {
    completedTriggers.add(activeDialogue.triggerId);
    activeDialogue = null;
  }
}

function dialogueView() {
  if (!activeDialogue) return null;
  const dialogue = dialogueCatalog.memories?.[activeDialogue.dialogueId];
  if (!dialogue) return null;
  return {
    title: dialogue.title,
    line: dialogue.lines?.[activeDialogue.index] ?? '',
  };
}

function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

async function safeJSON(src) {
  try { return await loadJSON(src); } catch (e) { console.warn(e); return null; }
}

function animFromMeta(meta) {
  if (!meta) return { frameW: 64, frameH: 64, cols: 1, frames: 1, fps: 1 };
  const durationMs = meta.duration ?? 140;
  return {
    frameW: meta.cell_size ?? 64,
    frameH: meta.cell_size ?? 64,
    cols: meta.cols ?? 1,
    frames: meta.frame_labels?.length ?? ((meta.rows ?? 1) * (meta.cols ?? 1)),
    fps: 1000 / durationMs,
  };
}
