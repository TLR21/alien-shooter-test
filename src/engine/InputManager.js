// InputManager - Handles keyboard and mouse input
export class InputManager {
  constructor() {
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, down: false };
    this.lastKeys = new Set();

    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));

    window.addEventListener('mousemove', (e) => {
      const rect = this.gameCanvas?.getBoundingClientRect() || { left: 0, top: 0 };
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mousedown', () => this.mouse.down = true);
    window.addEventListener('mouseup', () => this.mouse.down = false);

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const rect = this.gameCanvas?.getBoundingClientRect() || { left: 0, top: 0 };
        this.mouse.x = e.touches[0].clientX - rect.left;
        this.mouse.y = e.touches[0].clientY - rect.top;
        this.mouse.down = true;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = this.gameCanvas?.getBoundingClientRect() || { left: 0, top: 0 };
        this.mouse.x = e.touches[0].clientX - rect.left;
        this.mouse.y = e.touches[0].clientY - rect.top;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => this.mouse.down = false);
  }

  setCanvas(canvas) {
    this.gameCanvas = canvas;
  }

  update() {
    this.lastKeys = new Set(this.keys);
  }

  isPressed(code) {
    return this.keys.has(code);
  }

  isJustPressed(code) {
    return this.keys.has(code) && !this.lastKeys.has(code);
  }

  isJustReleased(code) {
    return !this.keys.has(code) && this.lastKeys.has(code);
  }

  getMousePosition() {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  isMouseDown() {
    return this.mouse.down;
  }

  getDirection() {
    let x = 0, y = 0;
    if (this.isPressed('KeyW') || this.isPressed('ArrowUp')) y -= 1;
    if (this.isPressed('KeyS') || this.isPressed('ArrowDown')) y += 1;
    if (this.isPressed('KeyA') || this.isPressed('ArrowLeft')) x -= 1;
    if (this.isPressed('KeyD') || this.isPressed('ArrowRight')) x += 1;

    const len = Math.sqrt(x * x + y * y);
    if (len > 0) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }
}