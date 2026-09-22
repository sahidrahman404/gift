// Scene loader and draw dispatcher. Reads level JSON from data/, pre-loads
// every referenced sprite, hands the rendered scene to render.js. Add new
// state per-scene (entities, timers) as your game grows; keep IO + data
// shaping here.

import { loadJSON, loadImage } from './assets.js';
import { fitCanvas, setCamera, drawBackground, drawDialogue, drawProps, drawSprite } from './render.js';
import { anyPressed } from './input.js';
import { createPlayer, updatePlayer, getPlayerSprite, setPlayerMode } from './player.js';

let levelsManifest = null;
let charactersCatalog = null;
let dialogueCatalog = null;
let movementModes = null;
const cache = {};      // { sceneId: levelData }
const images = {};     // { 'assets/.../x.png': HTMLImageElement }
const metas = {};      // { 'assets/.../pipeline-meta.json': metadata }
let current = null;
let bg = null;
let previousBg = null;
let bgX = 0;
let previousBgX = 0;
let bgFade = 1;
let bgKey = null;
let player = null;
let activeDialogue = null;
let sceneSwitching = false;
const completedTriggers = new Set();

export async function loadLevels() {
  levelsManifest = await loadJSON('data/levels.json');
  charactersCatalog = await loadJSON('data/characters.json');
  dialogueCatalog = await loadJSON('data/dialogue.json');
  movementModes = (await loadJSON('data/movement-modes.json')).modes ?? {};
  return levelsManifest;
}

export async function switchScene(id) {
  const entry = levelsManifest?.levels?.find((l) => l.id === id);
  if (!entry) throw new Error('unknown scene id: ' + id);
  if (!cache[id]) cache[id] = await loadJSON(entry.file);
  current = structuredClone(cache[id]);

  fitCanvas(current);
  player = createPlayer(current, movementModes);
  activeDialogue = null;
  previousBg = null;
  bgX = 0;
  previousBgX = 0;
  bgFade = 1;
  bgKey = null;

  // Pre-load this scene's backgrounds + every prop sprite.
  bg = current.background ? await safeImage(current.background) : null;
  bgKey = current.background;
  await Promise.all(
    [
      ...(current.props ?? []).map((p) => p.image),
      ...(current.backgroundZones ?? []).map((z) => z.image),
    ].filter(Boolean).map(async (src) => {
      if (!images[src]) images[src] = await safeImage(src);
    }),
  );
  await preloadCharacterAnimations();
  updateBackground(1);
  applyModeZones();
}

async function safeImage(src) {
  try { return await loadImage(src); } catch (e) { console.warn(e); return null; }
}

export function getCurrentScene() { return current; }
export function getImage(src) { return images[src]; }

export function drawCurrent(nowSec, dt) {
  if (!current) return;
  if (!activeDialogue) updatePlayer(player, dt);
  updateBackground(dt);
  if (!activeDialogue) applyModeZones();
  updateCamera();
  updateNpcFollowers();
  updateMemoryTriggers();
  updateSceneExits();
  updateDialogue();

  drawBackground(bg, previousBg, bgFade, bgX, previousBgX);
  drawProps(current.props ?? [], (src) => images[src]);

  const sprites = [];
  for (const npc of current.npcs ?? []) {
    if (npc.visible === false) continue;
    const character = characterById(npc.characterId);
    const animation = character?.animations?.[npc.animation ?? 'idle_side'];
    if (animation) {
      sprites.push({
        x: npc.position?.x ?? 0,
        y: npc.position?.y ?? 0,
        scale: npc.drawScale ?? modeScale(player?.mode) ?? character.recommendedScale ?? 1,
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
  const needed = charactersCatalog;

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

    applySceneState(trigger.startState);
    player.state = 'idle';
    activeDialogue = {
      triggerId: trigger.id,
      dialogueId: trigger.dialogueId,
      trigger,
      index: 0,
      appliedLineEvents: new Set(),
    };
    applyDialogueLineEvents();
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
  applyDialogueLineEvents();
  if (activeDialogue.index >= lines.length) {
    completedTriggers.add(activeDialogue.triggerId);
    applySceneState(activeDialogue.trigger?.completeState);
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

function applyModeZones() {
  if (!player) return;
  const zone = (current.modeZones ?? []).find((z) => pointInRect(player.x, player.y, z.shape));
  if (!zone) return;

  applySceneState({
    playerMode: zone.playerMode,
    npcStates: (current.npcs ?? []).map((npc) => ({
      id: npc.id,
      visible: zone.companion !== 'hidden' && npc.modeVisibility?.includes(zone.playerMode),
      position: zone.playerMode === 'on_foot' && npc.marugamePosition ? npc.marugamePosition : undefined,
      drawScale: zone.drawScale,
      facing: zone.facing,
    })),
  });
}

function applyDialogueLineEvents() {
  if (!activeDialogue) return;
  for (const event of activeDialogue.trigger?.lineEvents ?? []) {
    if (activeDialogue.index < event.lineIndex) continue;
    if (activeDialogue.appliedLineEvents.has(event.lineIndex)) continue;
    applySceneState(event);
    player.state = 'idle';
    activeDialogue.appliedLineEvents.add(event.lineIndex);
  }
}

function applySceneState(state) {
  if (!state) return;
  const nextScale = state.drawScale ?? modeScale(state.playerMode);
  if (state.playerMode) setPlayerMode(player, state.playerMode, state.playerPosition, nextScale);
  else if (state.playerPosition && player) {
    if (Number.isFinite(state.playerPosition.x)) player.x = state.playerPosition.x;
    if (Number.isFinite(state.playerPosition.y)) player.y = state.playerPosition.y;
  }
  if (state.playerFacing && player) player.facing = state.playerFacing;

  for (const npcState of state.npcStates ?? []) {
    const npc = current.npcs?.find((n) => n.id === npcState.id);
    if (!npc) continue;
    if (typeof npcState.visible === 'boolean') npc.visible = npcState.visible;
    if (npcState.position) npc.position = { ...npc.position, ...npcState.position };
    if (Number.isFinite(npcState.drawScale)) npc.drawScale = npcState.drawScale;
    else if (state.playerMode && npc.modeVisibility?.includes(state.playerMode)) npc.drawScale = nextScale;
    if (npcState.animation) npc.animation = npcState.animation;
    if (npcState.facing) npc.facing = npcState.facing;
  }
}

function modeScale(mode) {
  return movementModes?.[mode]?.drawScale;
}

function updateBackground(dt) {
  if (!player) return;
  const zone = (current.backgroundZones ?? []).find((z) => pointInRect(player.x, player.y, z.shape));
  const nextKey = zone?.image ?? current.background;
  const nextX = zone?.shape?.x ?? 0;
  if (!nextKey || nextKey === bgKey) {
    bgFade = Math.min(1, bgFade + dt / (current.backgroundFadeSeconds ?? 0.45));
    return;
  }

  previousBg = bg;
  previousBgX = bgX;
  bg = images[nextKey] ?? bg;
  bgX = nextX;
  bgKey = nextKey;
  bgFade = 0;
}

function updateCamera() {
  if (!player) return;
  const viewport = current.viewport ?? { width: 720, height: 720 };
  const map = current.mapSize ?? viewport;
  const targetX = clamp(player.x - viewport.width / 2, 0, Math.max(0, map.width - viewport.width));
  setCamera(targetX, 0, 1);
}

function updateNpcFollowers() {
  if (!player) return;
  for (const npc of current.npcs ?? []) {
    if (!npc.visible || !npc.followPlayer?.enabled || player.mode !== 'on_foot' || activeDialogue) continue;
    const follow = npc.followPlayer;
    npc.position = {
      ...npc.position,
      x: clamp(player.x + (follow.offsetX ?? 72), follow.minX ?? -Infinity, follow.maxX ?? Infinity),
      y: player.y,
    };
    npc.facing = follow.facing ?? (player.facing === 'right' ? 'left' : 'right');
    npc.animation = player.state === 'walk' ? 'walk_side' : 'idle_side';
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
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
