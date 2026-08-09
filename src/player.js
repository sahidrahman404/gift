import { anyDown } from './input.js';

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function createPlayer(level) {
  const cfg = level.player;
  if (!cfg) return null;

  return {
    characterId: cfg.characterId,
    x: cfg.position?.x ?? level.spawn?.x ?? 0,
    y: cfg.position?.y ?? level.spawn?.y ?? 0,
    speed: cfg.speed,
    scale: cfg.drawScale,
    facing: cfg.facing ?? 'right',
    controls: cfg.controls ?? {},
    bounds: cfg.movementBounds ?? { x: 0, y: 0, w: level.mapSize?.width ?? 0, h: level.mapSize?.height ?? 0 },
    state: 'idle',
  };
}

export function updatePlayer(player, dt) {
  if (!player) return;

  const left = anyDown(player.controls.left);
  const right = anyDown(player.controls.right);
  const dir = right && !left ? 1 : left && !right ? -1 : 0;

  if (dir !== 0) {
    player.x += dir * player.speed * dt;
    player.facing = dir > 0 ? 'right' : 'left';
    player.state = 'walk';
  } else {
    player.state = 'idle';
  }

  const b = player.bounds;
  player.x = clamp(player.x, b.x, b.x + b.w);
  player.y = clamp(player.y, b.y, b.y + b.h);
}

export function getPlayerSprite(player, character) {
  if (!player || !character) return null;

  const animKey = player.state === 'walk' ? 'walk_side' : 'idle_side';
  const animation = character.animations?.[animKey];
  if (!animation) return null;

  return {
    x: player.x,
    y: player.y,
    scale: player.scale ?? character.recommendedScale ?? 1,
    flipX: player.facing === 'left',
    animation,
  };
}
