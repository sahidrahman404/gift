// Keyboard + mouse. Translates raw events into a small intent surface that
// scene/entity modules can poll without coupling to the DOM.

const keys = new Set();
const pressed = new Set();
const mouse = { x: 0, y: 0, down: false };

export function initInput(canvas) {
  window.addEventListener('keydown', (e) => {
    if (!keys.has(e.code)) pressed.add(e.code);
    keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
    mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
  });
  canvas.addEventListener('mousedown', () => { mouse.down = true; });
  canvas.addEventListener('mouseup', () => { mouse.down = false; });
}

export function isDown(code) { return keys.has(code); }
export function anyDown(codes = []) { return codes.some((code) => keys.has(code)); }
export function wasPressed(code) { return pressed.has(code); }
export function anyPressed(codes = []) { return codes.some((code) => pressed.has(code)); }
export function endFrame() { pressed.clear(); }
export function getMouse() { return { x: mouse.x, y: mouse.y, down: mouse.down }; }
