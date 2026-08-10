// Renderer + camera. World coords ↔ screen coords go through sx/sy. All
// drawing primitives live here; scene/entity modules call them with raw
// world-space numbers. (Initial setup: 1:1, no camera transform.)

let canvas = null;
let ctx = null;
const camera = { x: 0, y: 0, scale: 1 };

export function initRenderer(c, x) { canvas = c; ctx = x; }

export function fitCanvas(level) {
  const m = level.viewport ?? { width: 720, height: 720 };
  if (canvas.width !== m.width) canvas.width = m.width;
  if (canvas.height !== m.height) canvas.height = m.height;
}

export function setCamera(x, y, scale = 1) { camera.x = x; camera.y = y; camera.scale = scale; }
export function sx(x) { return (x - camera.x) * camera.scale; }
export function sy(y) { return (y - camera.y) * camera.scale; }

export function drawBackground(image, previousImage = null, fade = 1, worldX = 0, previousWorldX = 0) {
  if (!image && !previousImage) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  ctx.save();
  if (previousImage && previousImage !== image && fade < 1) {
    ctx.globalAlpha = 1;
    drawWorldImage(previousImage, previousWorldX);
    ctx.globalAlpha = fade;
    if (image) drawWorldImage(image, worldX);
  } else if (image) {
    drawWorldImage(image, worldX);
  }
  ctx.restore();
}

function drawWorldImage(image, worldX) {
  ctx.drawImage(image, Math.round(sx(worldX)), Math.round(sy(0)), image.naturalWidth, image.naturalHeight);
}

export function drawSprite(sprite, image, elapsedSec) {
  if (!sprite || !image) return;

  const anim = sprite.anim ?? {};
  const frameW = anim.frameW ?? 64;
  const frameH = anim.frameH ?? 64;
  const cols = anim.cols ?? 1;
  const frames = Math.max(1, anim.frames ?? 1);
  const fps = anim.fps ?? 6;
  const frame = Math.floor(elapsedSec * fps) % frames;
  const col = frame % cols;
  const row = Math.floor(frame / cols);
  const scale = sprite.scale ?? 1;
  const drawW = frameW * scale * camera.scale;
  const drawH = frameH * scale * camera.scale;
  const dx = sx(sprite.x) - drawW / 2;
  const dy = sy(sprite.y) - drawH;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (sprite.flipX) {
    ctx.translate(dx + drawW, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(image, col * frameW, row * frameH, frameW, frameH, 0, 0, drawW, drawH);
  } else {
    ctx.drawImage(image, col * frameW, row * frameH, frameW, frameH, dx, dy, drawW, drawH);
  }
  ctx.restore();
}

export function drawDialogue(dialogue) {
  if (!dialogue) return;

  const margin = 24;
  const boxH = 178;
  const x = margin;
  const y = margin;
  const w = canvas.width - margin * 2;

  ctx.save();
  ctx.fillStyle = 'rgba(31, 21, 24, 0.92)';
  ctx.fillRect(x, y, w, boxH);
  ctx.strokeStyle = '#e7b36b';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, boxH);

  ctx.fillStyle = '#ffd89a';
  ctx.font = '700 20px system-ui, sans-serif';
  ctx.fillText(dialogue.title, x + 22, y + 34);

  ctx.fillStyle = '#fff4df';
  ctx.font = '18px system-ui, sans-serif';
  wrapText(dialogue.line, x + 22, y + 70, w - 44, 25, y + boxH - 44);

  ctx.fillStyle = '#d7b891';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('Press Space or Enter', x + w - 184, y + boxH - 20);
  ctx.restore();
}

function wrapText(text, x, y, maxWidth, lineHeight, maxY = Infinity) {
  const words = String(text).split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
      if (y > maxY) return;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
}

/** props: array of { id, image, x, y, w, h, sortY? } — bottom-center anchor. */
export function drawProps(props, lookup) {
  const sorted = props.slice().sort((a, b) => (a.sortY ?? a.y) - (b.sortY ?? b.y));
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (const p of sorted) {
    const img = lookup(p.image);
    if (!img) continue;
    ctx.drawImage(img, sx(p.x) - p.w / 2, sy(p.y) - p.h, p.w * camera.scale, p.h * camera.scale);
  }
  ctx.restore();
}

export function errorScreen(message) {
  if (!ctx) return;
  ctx.fillStyle = '#400';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fcc';
  ctx.font = '16px system-ui';
  ctx.fillText(message, 20, 30);
}
