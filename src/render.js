// Renderer + camera. World coords ↔ screen coords go through sx/sy. All
// drawing primitives live here; scene/entity modules call them with raw
// world-space numbers. (Initial setup: 1:1, no camera transform.)

let canvas = null;
let ctx = null;
const camera = { x: 0, y: 0, scale: 1 };

export function initRenderer(c, x) { canvas = c; ctx = x; }

export function fitCanvas(level) {
  const m = level.mapSize ?? { width: 1280, height: 720 };
  if (canvas.width !== m.width) canvas.width = m.width;
  if (canvas.height !== m.height) canvas.height = m.height;
}

export function setCamera(x, y, scale = 1) { camera.x = x; camera.y = y; camera.scale = scale; }
export function sx(x) { return (x - camera.x) * camera.scale; }
export function sy(y) { return (y - camera.y) * camera.scale; }

export function drawBackground(image) {
  if (image) {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
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

  const margin = 44;
  const boxH = 150;
  const x = margin;
  const y = canvas.height - boxH - margin;
  const w = canvas.width - margin * 2;

  ctx.save();
  ctx.fillStyle = 'rgba(31, 21, 24, 0.92)';
  ctx.fillRect(x, y, w, boxH);
  ctx.strokeStyle = '#e7b36b';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, boxH);

  ctx.fillStyle = '#ffd89a';
  ctx.font = '700 22px system-ui, sans-serif';
  ctx.fillText(dialogue.title, x + 26, y + 38);

  ctx.fillStyle = '#fff4df';
  ctx.font = '22px system-ui, sans-serif';
  wrapText(dialogue.line, x + 26, y + 78, w - 52, 30);

  ctx.fillStyle = '#d7b891';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('Press Space or Enter', x + w - 190, y + boxH - 22);
  ctx.restore();
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
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
