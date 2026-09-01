// Player - Player ship entity
import { Entity } from './Entity.js';

export class Player extends Entity {
  constructor(x, y, entities, audio, particles) {
    super(x, y);
    this.type = 'player';
    this.entities = entities;
    this.audio = audio;
    this.particles = particles;

    this.width = 40;
    this.height = 30;
    this.radius = 18;
    this.speed = 350;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.fireRate = 0.15;
    this.fireTimer = 0;
    this.color = '#00ff88';
    this.glowColor = '#00ff88';

    this.powerLevel = 1;
    this.invulnerable = false;
    this.invulnTimer = 0;
  }

  update(deltaTime, input) {
    // Movement
    const dir = input.getDirection();
    this.x += dir.x * this.speed * deltaTime;
    this.y += dir.y * this.speed * deltaTime;

    // Clamp to screen
    this.x = Math.max(this.radius, Math.min(this.entities.renderer?.width || 800 - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(this.entities.renderer?.height || 600 - this.radius, this.y));

    // Firing
    this.fireTimer -= deltaTime;
    if ((input.isPressed('Space') || input.isMouseDown()) && this.fireTimer <= 0) {
      this.fire();
      this.fireTimer = this.fireRate;
    }

    // Invulnerability
    if (this.invulnerable) {
      this.invulnTimer -= deltaTime;
      if (this.invulnTimer <= 0) {
        this.invulnerable = false;
      }
    }

    // Engine particles
    if (Math.random() < 0.3) {
      this.particles.createEngineTrail(this.x, this.y + this.height / 2);
    }
  }

  fire() {
    const bulletCount = this.powerLevel;
    const spread = bulletCount > 1 ? 0.3 : 0;

    for (let i = 0; i < bulletCount; i++) {
      let angle = -Math.PI / 2;
      if (bulletCount > 1) {
        angle += (i - (bulletCount - 1) / 2) * spread;
      }

      const bullet = new Bullet(
        this.x,
        this.y - this.height / 2,
        angle,
        600,
        20 + this.powerLevel * 5,
        'player',
        this.entities,
        this.audio,
        this.particles
      );
      this.entities.add(bullet);
    }

    this.audio.play('shoot');
  }

  takeDamage(amount) {
    if (this.invulnerable) return;

    this.health -= amount;
    this.invulnerable = true;
    this.invulnTimer = 1.5;

    if (this.health <= 0) {
      this.destroy();
      this.particles.createExplosion(this.x, this.y, this.color);
      this.audio.play('explosion');
    }
  }

  powerUp() {
    this.powerLevel = Math.min(this.powerLevel + 1, 4);
    this.fireRate = Math.max(0.08, this.fireRate - 0.02);
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Invulnerability flash
    if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Glow
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 1.5);
    gradient.addColorStop(0, this.glowColor + '40');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Ship body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.lineTo(this.width / 2, this.height / 2);
    ctx.lineTo(this.width / 4, this.height / 3);
    ctx.lineTo(-this.width / 4, this.height / 3);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -this.height / 6, this.width / 6, this.height / 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Engine glow
    const engineGradient = ctx.createLinearGradient(0, this.height / 3, 0, this.height / 2 + 10);
    engineGradient.addColorStop(0, '#00ff88');
    engineGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = engineGradient;
    ctx.beginPath();
    ctx.moveTo(-this.width / 4, this.height / 3);
    ctx.lineTo(0, this.height / 2 + Math.sin(Date.now() / 50) * 5);
    ctx.lineTo(this.width / 4, this.height / 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Health bar above player
    const barWidth = 40;
    const barHeight = 4;
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 12, barWidth, barHeight);
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff88' : healthPercent > 0.25 ? '#ffaa00' : '#ff3366';
    ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 12, barWidth * healthPercent, barHeight);
  }
}