// Entity - Base class for all game entities
export class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.type = 'entity';
    this.active = true;
    this.radius = 10;
    this.velocityX = 0;
    this.velocityY = 0;
  }

  update(deltaTime, input) {
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
  }

  render(ctx) {
    // Override in subclasses
  }

  destroy() {
    this.active = false;
  }

  takeDamage(amount) {
    // Override in subclasses
  }
}