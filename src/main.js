// Alien Shooter - Core Game Engine
// OpenCode Integration Test

import { GameEngine } from './engine/GameEngine.js';
import { InputManager } from './engine/InputManager.js';
import { EntityManager } from './engine/EntityManager.js';
import { Renderer } from './engine/Renderer.js';
import { AudioManager } from './engine/AudioManager.js';
import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { Bullet } from './entities/Bullet.js';
import { ParticleSystem } from './effects/ParticleSystem.js';
import { Starfield } from './effects/Starfield.js';

class AlienShooter {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.engine = null;
    this.input = null;
    this.entities = null;
    this.renderer = null;
    this.audio = null;
    this.particles = null;
    this.starfield = null;
    this.player = null;

    this.score = 0;
    this.wave = 1;
    this.gameState = 'menu'; // menu, playing, paused, gameover, victory
    this.lastTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.fpsUpdateTime = 0;

    this.init();
  }

  init() {
    this.input = new InputManager();
    this.input.setCanvas(this.canvas);
    this.entities = new EntityManager();
    this.entities.renderer = this.renderer; // Pass renderer reference for screen bounds
    this.renderer = new Renderer(this.ctx, this.canvas.width, this.canvas.height);
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();
    this.starfield = new Starfield(this.canvas.width, this.canvas.height);
    this.engine = new GameEngine(this);

    this.setupEventListeners();
    this.gameLoop(0);
  }

  setupEventListeners() {
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('screen-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget && this.gameState === 'menu') {
        this.startGame();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyP' && this.gameState === 'playing') {
        this.togglePause();
      }
      if (e.code === 'Enter' && (this.gameState === 'gameover' || this.gameState === 'victory')) {
        this.restart();
      }
    });
  }

  startGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.wave = 1;
    document.getElementById('screen-overlay').classList.add('hidden');
    this.spawnPlayer();
    this.spawnWave();
    this.updateHUD();
  }

  spawnPlayer() {
    this.player = new Player(
      this.canvas.width / 2,
      this.canvas.height - 80,
      this.entities,
      this.audio,
      this.particles
    );
    this.entities.add(this.player);
  }

  spawnWave() {
    const enemyCount = Math.min(5 + this.wave * 2, 25);
    const rows = Math.ceil(Math.sqrt(enemyCount));
    const cols = Math.ceil(enemyCount / rows);
    const spacingX = this.canvas.width / (cols + 1);
    const spacingY = 80;

    for (let i = 0; i < enemyCount; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = spacingX * (col + 1);
      const y = spacingY * (row + 1) + 50;

      const enemy = new Enemy(x, y, this.entities, this.audio, this.particles, this.wave);
      this.entities.add(enemy);
    }
  }

  togglePause() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.showOverlay('PAUSED', 'Press P to resume');
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.hideOverlay();
    }
  }

  showOverlay(title, subtitle) {
    const overlay = document.getElementById('screen-overlay');
    overlay.querySelector('.screen-title').textContent = title;
    overlay.querySelector('.screen-subtitle').textContent = subtitle;
    overlay.querySelector('#start-btn').textContent = this.gameState === 'paused' ? 'Resume' : 'Restart';
    overlay.classList.remove('hidden');
  }

  hideOverlay() {
    document.getElementById('screen-overlay').classList.add('hidden');
  }

  gameOver(victory = false) {
    this.gameState = victory ? 'victory' : 'gameover';
    this.showOverlay(
      victory ? 'VICTORY!' : 'GAME OVER',
      victory ? `Final Score: ${this.score}` : `Final Score: ${this.score} — Press Enter to restart`
    );
  }

  restart() {
    this.entities.clear();
    this.particles.clear();
    this.startGame();
  }

  addScore(points) {
    this.score += points;
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('score-display').textContent = this.score.toLocaleString();
    document.getElementById('wave-display').textContent = this.wave;
    if (this.player) {
      const healthPercent = (this.player.health / this.player.maxHealth) * 100;
      document.getElementById('health-bar').style.width = `${healthPercent}%`;
    }
  }

  checkWaveComplete() {
    const enemies = this.entities.getByType('enemy');
    if (enemies.length === 0 && this.gameState === 'playing') {
      this.wave++;
      if (this.wave > 10) {
        this.gameOver(true);
      } else {
        this.spawnWave();
        this.updateHUD();
        this.particles.createWaveClearEffect(this.canvas.width / 2, this.canvas.height / 2);
      }
    }
  }

  gameLoop(timestamp) {
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.updateFPS(timestamp);

    if (this.gameState === 'playing') {
      this.update(deltaTime);
    }

    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(deltaTime) {
    this.input.update();
    this.starfield.update(deltaTime);
    this.entities.update(deltaTime, this.input);
    this.particles.update(deltaTime);
    this.checkCollisions();
    this.checkWaveComplete();
    this.checkGameOver();
  }

  checkCollisions() {
    const bullets = this.entities.getByType('bullet');
    const enemies = this.entities.getByType('enemy');
    const enemyBullets = this.entities.getByType('enemyBullet');

    // Player bullets vs Enemies
    for (const bullet of bullets) {
      for (const enemy of enemies) {
        if (this.collide(bullet, enemy)) {
          bullet.destroy();
          enemy.takeDamage(bullet.damage);
          this.particles.createHitEffect(bullet.x, bullet.y);
          this.audio.play('hit');
          if (enemy.health <= 0) {
            this.addScore(enemy.scoreValue);
            this.particles.createExplosion(enemy.x, enemy.y, enemy.color);
            this.audio.play('explosion');
          }
        }
      }
    }

    // Enemy bullets vs Player
    if (this.player && this.player.active) {
      for (const bullet of enemyBullets) {
        if (this.collide(bullet, this.player)) {
          bullet.destroy();
          this.player.takeDamage(bullet.damage);
          this.particles.createHitEffect(this.player.x, this.player.y);
          this.audio.play('playerHit');
          this.updateHUD();
        }
      }

      // Enemies vs Player (collision damage)
      for (const enemy of enemies) {
        if (this.collide(enemy, this.player)) {
          this.player.takeDamage(10);
          enemy.takeDamage(50);
          this.particles.createExplosion(enemy.x, enemy.y, enemy.color);
          this.audio.play('explosion');
          this.updateHUD();
        }
      }
    }
  }

  collide(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
  }

  checkGameOver() {
    if (this.player && this.player.health <= 0) {
      this.gameOver(false);
    }
  }

  render() {
    this.renderer.clear();
    this.starfield.render(this.ctx);
    this.entities.render(this.ctx);
    this.particles.render(this.ctx);
    this.renderer.renderUI(this.ctx, this);
  }

  updateFPS(timestamp) {
    this.frameCount++;
    if (timestamp - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = timestamp;
      document.getElementById('fps-counter').textContent = `FPS: ${this.fps}`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AlienShooter();
});

export { AlienShooter };