// Powerup - Power-up entity
import { Entity } from './Entity.js';

export class Powerup extends Entity {
  constructor(x, y, entities, particles) {
    super(x, y);
    this.type = 'powerup';
    this.entities = entities;
    this.particles = particles;

    this.radius = 12;
    this.speed = 80;
    this.velocityY = this.speed;
    this.kind = this.chooseKind();
    this.rotation = 0;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.bobTimer = 0;
  }

  chooseKind() {
    const rand = Math.random();
    if (rand < 0.4) return 'weapon';
    if (rand < 0.7) return 'health';
    if (rand < 0.9) return 'shield';
    return 'bomb';
  }

  update(deltaTime) {
    super.update(deltaTime);

    this.bobTimer += deltaTime;
    this.rotation += deltaTime * 2;
    this.x += Math.sin(this.bobTimer * 3 + this.bobOffset) * 30 * deltaTime;

    // Remove if off screen
    if (this.y > (this.entities.renderer?.height || 600) + this.radius) {
      this.destroy();
    }
  }

  apply(player) {
    switch (this.kind) {
      case 'weapon':
        player.powerUp();
        this.particles.createPowerupEffect(this.x, this.y, '#00ff88');
        break;
      case 'health':
        player.heal(25);
        this.particles.createPowerupEffect(this.x, this.y, '#00ff88');
        break;
      case 'shield':
        player.invulnerable = true;
        player.invulnTimer = 5;
        this.particles.createPowerupEffect(this.x, this.y, '#00ccff');
        break;
      case 'bomb':
        this.particles.createScreenFlash('#ff3366');
        // Damage all enemies
        const enemies = this.entities.getByType('enemy');
        for (const enemy of enemies) {
          enemy.takeDamage(100);
        }
        break;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const colors = {
      weapon: '#00ff88',
      health: '#00ff88',
      shield: '#00ccff',
      bomb: '#ff3366'
    };
    const color = colors[this.kind];

    // Glow
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 2);
    gradient.addColorStop(0, color + '60');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Box
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    const size = this.radius;
    ctx.beginPath();
    ctx.rect(-size / 2, -size / 2, size, size);
    ctx.fill();
    ctx.stroke();

    // Symbol
    ctx.fillStyle = '#0a0a0f';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const symbols = {
      weapon: '↑',
      health: '+',
      shield: '◈',
      bomb: '✦'
    };
    ctx.fillText(symbols[this.kind], 0, 1);

    ctx.restore();
  }
}