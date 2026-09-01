// Bullet - Projectile entity
import { Entity } from './Entity.js';

export class Bullet extends Entity {
  constructor(x, y, angle, speed, damage, owner, entities, audio, particles) {
    super(x, y);
    this.type = owner === 'player' ? 'bullet' : 'enemyBullet';
    this.entities = entities;
    this.audio = audio;
    this.particles = particles;

    this.angle = angle;
    this.speed = speed;
    this.damage = damage;
    this.owner = owner;
    this.radius = 4;
    this.lifetime = 3;
    this.color = owner === 'player' ? '#00ff88' : '#ff3366';
    this.trail = [];
    this.maxTrailLength = 8;
  }

  update(deltaTime) {
    super.update(deltaTime);

    this.velocityX = Math.cos(this.angle) * this.speed;
    this.velocityY = Math.sin(this.angle) * this.speed;

    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.pop();
    }

    this.lifetime -= deltaTime;

    // Remove if off screen
    const width = this.entities.renderer?.width || 800;
    const height = this.entities.renderer?.height || 600;
    if (this.x < -this.radius || this.x > width + this.radius ||
        this.y < -this.radius || this.y > height + this.radius ||
        this.lifetime <= 0) {
      this.destroy();
    }
  }

  render(ctx) {
    // Trail
    if (this.trail.length > 1) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.trail[this.trail.length - 1].x, this.trail[this.trail.length - 1].y);
      for (let i = this.trail.length - 2; i >= 0; i--) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.stroke();
    }

    // Bullet
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.PI / 2);

    // Glow
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 3);
    gradient.addColorStop(0, this.color + '80');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -this.radius * 3);
    ctx.lineTo(this.radius, this.radius * 2);
    ctx.lineTo(-this.radius, this.radius * 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

export class EnemyBullet extends Bullet {
  constructor(x, y, angle, speed, damage, entities, audio, particles) {
    super(x, y, angle, speed, damage, 'enemy', entities, audio, particles);
    this.color = '#ff3366';
    this.radius = 5;
  }
}