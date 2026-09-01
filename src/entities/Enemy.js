// Enemy - Alien enemy entity
import { Entity } from './Entity.js';

export class Enemy extends Entity {
  constructor(x, y, entities, audio, particles, wave = 1) {
    super(x, y);
    this.type = 'enemy';
    this.entities = entities;
    this.audio = audio;
    this.particles = particles;

    this.wave = wave;
    this.enemyType = this.chooseType();
    this.setupType();

    this.moveTimer = 0;
    this.moveDirection = Math.random() > 0.5 ? 1 : -1;
    this.fireTimer = Math.random() * 2;
    this.baseFireRate = this.getFireRate();
    this.oscillationOffset = Math.random() * Math.PI * 2;
  }

  chooseType() {
    const rand = Math.random();
    if (this.wave >= 5 && rand < 0.15) return 'boss';
    if (this.wave >= 3 && rand < 0.3) return 'heavy';
    if (rand < 0.4) return 'fast';
    return 'basic';
  }

  setupType() {
    switch (this.enemyType) {
      case 'basic':
        this.width = 32;
        this.height = 28;
        this.radius = 16;
        this.speed = 50;
        this.health = 30 + this.wave * 5;
        this.maxHealth = this.health;
        this.scoreValue = 100;
        this.color = '#ff6b35';
        this.glowColor = '#ff6b35';
        this.fireRate = 2.5;
        this.bulletSpeed = 200;
        break;
      case 'fast':
        this.width = 24;
        this.height = 24;
        this.radius = 12;
        this.speed = 120;
        this.health = 15 + this.wave * 3;
        this.maxHealth = this.health;
        this.scoreValue = 150;
        this.color = '#00ccff';
        this.glowColor = '#00ccff';
        this.fireRate = 1.5;
        this.bulletSpeed = 300;
        break;
      case 'heavy':
        this.width = 48;
        this.height = 40;
        this.radius = 24;
        this.speed = 30;
        this.health = 80 + this.wave * 10;
        this.maxHealth = this.health;
        this.scoreValue = 300;
        this.color = '#ff3366';
        this.glowColor = '#ff3366';
        this.fireRate = 3.5;
        this.bulletSpeed = 150;
        break;
      case 'boss':
        this.width = 80;
        this.height = 60;
        this.radius = 40;
        this.speed = 20;
        this.health = 500 + this.wave * 50;
        this.maxHealth = this.health;
        this.scoreValue = 1000;
        this.color = '#aa00ff';
        this.glowColor = '#aa00ff';
        this.fireRate = 1.0;
        this.bulletSpeed = 250;
        break;
    }
  }

  getFireRate() {
    return this.fireRate;
  }

  update(deltaTime, input) {
    // Movement pattern
    this.moveTimer += deltaTime;

    switch (this.enemyType) {
      case 'basic':
        this.y += this.speed * deltaTime * 0.3;
        this.x += Math.sin(this.moveTimer * 2 + this.oscillationOffset) * 30 * deltaTime;
        break;
      case 'fast':
        this.y += this.speed * deltaTime * 0.5;
        this.x += Math.sin(this.moveTimer * 4 + this.oscillationOffset) * 80 * deltaTime;
        break;
      case 'heavy':
        this.y += this.speed * deltaTime * 0.2;
        this.x += Math.sin(this.moveTimer * 1.5 + this.oscillationOffset) * 20 * deltaTime;
        break;
      case 'boss':
        this.y += this.speed * deltaTime * 0.1;
        this.x += Math.sin(this.moveTimer * 1 + this.oscillationOffset) * 100 * deltaTime;
        break;
    }

    // Clamp X
    this.x = Math.max(this.radius, Math.min((this.entities.renderer?.width || 800) - this.radius, this.x));

    // Fire
    this.fireTimer -= deltaTime;
    if (this.fireTimer <= 0 && this.y > 0 && this.y < (this.entities.renderer?.height || 600)) {
      this.fire();
      this.fireTimer = this.baseFireRate + Math.random() * 0.5;
    }

    // Remove if off screen bottom
    if (this.y > (this.entities.renderer?.height || 600) + this.radius) {
      this.destroy();
    }
  }

  fire() {
    if (this.enemyType === 'boss') {
      // Boss fires in 3 directions
      for (let i = -1; i <= 1; i++) {
        const angle = Math.PI / 2 + i * 0.3;
        this.createBullet(angle);
      }
    } else {
      this.createBullet(Math.PI / 2);
    }
  }

  createBullet(angle) {
    const bullet = new EnemyBullet(
      this.x,
      this.y + this.height / 2,
      angle,
      this.bulletSpeed,
      10 + this.wave * 2,
      this.entities,
      this.audio,
      this.particles
    );
    this.entities.add(bullet);
  }

  takeDamage(amount) {
    this.health -= amount;
    this.particles.createHitEffect(this.x, this.y);

    if (this.health <= 0) {
      this.destroy();
      this.particles.createExplosion(this.x, this.y, this.color);
      this.audio.play('explosion');

      // Chance to drop powerup
      if (Math.random() < 0.15) {
        this.dropPowerup();
      }
    }
  }

  dropPowerup() {
    const powerup = new Powerup(this.x, this.y, this.entities, this.particles);
    this.entities.add(powerup);
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Glow
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 1.3);
    gradient.addColorStop(0, this.glowColor + '40');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Body based on type
    ctx.fillStyle = this.color;

    switch (this.enemyType) {
      case 'basic':
        this.drawBasic(ctx);
        break;
      case 'fast':
        this.drawFast(ctx);
        break;
      case 'heavy':
        this.drawHeavy(ctx);
        break;
      case 'boss':
        this.drawBoss(ctx);
        break;
    }

    // Health bar
    if (this.health < this.maxHealth) {
      const barWidth = this.width;
      const barHeight = 3;
      const healthPercent = this.health / this.maxHealth;
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(-barWidth / 2, -this.height / 2 - 8, barWidth, barHeight);
      ctx.fillStyle = healthPercent > 0.5 ? '#00ff88' : healthPercent > 0.25 ? '#ffaa00' : '#ff3366';
      ctx.fillRect(-barWidth / 2, -this.height / 2 - 8, barWidth * healthPercent, barHeight);
    }

    ctx.restore();
  }

  drawBasic(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.bezierCurveTo(
      this.width / 2, -this.height / 4,
      this.width / 2, this.height / 4,
      0, this.height / 2
    );
    ctx.bezierCurveTo(
      -this.width / 2, this.height / 4,
      -this.width / 2, -this.height / 4,
      0, -this.height / 2
    );
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-this.width / 5, -this.height / 6, 3, 0, Math.PI * 2);
    ctx.arc(this.width / 5, -this.height / 6, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawFast(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.lineTo(this.width / 2, 0);
    ctx.lineTo(0, this.height / 2);
    ctx.lineTo(-this.width / 2, 0);
    ctx.closePath();
    ctx.fill();

    // Trail lines
    ctx.strokeStyle = this.glowColor + '80';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-this.width / 3, this.height / 4);
    ctx.lineTo(-this.width / 2 - 5, this.height / 2);
    ctx.moveTo(this.width / 3, this.height / 4);
    ctx.lineTo(this.width / 2 + 5, this.height / 2);
    ctx.stroke();
  }

  drawHeavy(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.lineTo(this.width / 2, -this.height / 4);
    ctx.lineTo(this.width / 2, this.height / 4);
    ctx.lineTo(0, this.height / 2);
    ctx.lineTo(-this.width / 2, this.height / 4);
    ctx.lineTo(-this.width / 2, -this.height / 4);
    ctx.closePath();
    ctx.fill();

    // Armor plates
    ctx.fillStyle = this.lightenColor(this.color, 30);
    ctx.fillRect(-this.width / 3, -this.height / 4, this.width * 2 / 3, this.height / 2);
  }

  drawBoss(ctx) {
    // Main body
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.bezierCurveTo(
      this.width / 2, -this.height / 3,
      this.width / 2, this.height / 3,
      0, this.height / 2
    );
    ctx.bezierCurveTo(
      -this.width / 2, this.height / 3,
      -this.width / 2, -this.height / 3,
      0, -this.height / 2
    );
    ctx.fill();

    // Core
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 3);
    coreGradient.addColorStop(0, '#ff00ff');
    coreGradient.addColorStop(1, '#aa00ff');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 3, 0, Math.PI * 2);
    ctx.fill();

    // Side pods
    ctx.fillStyle = this.color;
    [-1, 1].forEach(side => {
      ctx.beginPath();
      ctx.ellipse(side * this.width / 2.5, 0, this.width / 5, this.height / 3, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
  }
}