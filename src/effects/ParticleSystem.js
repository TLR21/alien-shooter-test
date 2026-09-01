// ParticleSystem - Handles all particle effects
export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  createExplosion(x, y, color = '#ff6b35', count = 30) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 50 + Math.random() * 150;
      const size = 2 + Math.random() * 4;
      const life = 0.5 + Math.random() * 1.0;

      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        life,
        maxLife: life,
        color,
        type: 'explosion'
      });
    }
  }

  createHitEffect(x, y, color = '#ffffff') {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 80;

      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 2,
        life: 0.2 + Math.random() * 0.3,
        maxLife: 0.5,
        color,
        type: 'hit'
      });
    }
  }

  createEngineTrail(x, y) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 5,
      vx: (Math.random() - 0.5) * 20,
      vy: 50 + Math.random() * 50,
      size: 1 + Math.random() * 2,
      life: 0.1 + Math.random() * 0.2,
      maxLife: 0.3,
      color: '#00ff88',
      type: 'trail'
    });
  }

  createPowerupEffect(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * 100,
        vy: Math.sin(angle) * 100,
        size: 3,
        life: 0.8,
        maxLife: 0.8,
        color,
        type: 'powerup'
      });
    }
  }

  createWaveClearEffect(x, y) {
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50;
      const speed = 200;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4,
        life: 1.5,
        maxLife: 1.5,
        color: i % 2 === 0 ? '#00ff88' : '#00ccff',
        type: 'waveclear'
      });
    }
  }

  createScreenFlash(color) {
    this.particles.push({
      x: 0, y: 0,
      vx: 0, vy: 0,
      size: 1,
      life: 0.15,
      maxLife: 0.15,
      color,
      type: 'screenflash'
    });
  }

  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.vy += 200 * deltaTime; // gravity
      p.life -= deltaTime;
      p.size *= 0.98;

      if (p.life <= 0 || p.size < 0.2) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;

      switch (p.type) {
        case 'screenflash':
          ctx.fillStyle = p.color;
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          break;
        default:
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.particles = [];
  }
}