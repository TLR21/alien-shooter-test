import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Entity } from '../src/entities/Entity.js';
import { Player } from '../src/entities/Player.js';
import { Enemy } from '../src/entities/Enemy.js';
import { Bullet, EnemyBullet } from '../src/entities/Bullet.js';
import { Powerup } from '../src/entities/Powerup.js';
import { ParticleSystem } from '../src/effects/ParticleSystem.js';
import { Starfield } from '../src/effects/Starfield.js';
import { InputManager } from '../src/engine/InputManager.js';
import { EntityManager } from '../src/engine/EntityManager.js';
import { Renderer } from '../src/engine/Renderer.js';
import { AudioManager } from '../src/engine/AudioManager.js';

describe('Entity', () => {
  it('should create entity with position', () => {
    const entity = new Entity(100, 200);
    expect(entity.x).toBe(100);
    expect(entity.y).toBe(200);
    expect(entity.active).toBe(true);
    expect(entity.radius).toBe(10);
  });

  it('should update position based on velocity', () => {
    const entity = new Entity(0, 0);
    entity.velocityX = 100;
    entity.velocityY = 50;
    entity.update(1);
    expect(entity.x).toBe(100);
    expect(entity.y).toBe(50);
  });

  it('should destroy entity', () => {
    const entity = new Entity(0, 0);
    entity.destroy();
    expect(entity.active).toBe(false);
  });
});

describe('Player', () => {
  let player;
  let mockEntities;
  let mockAudio;
  let mockParticles;

  beforeEach(() => {
    mockEntities = {
      renderer: { width: 800, height: 600 },
      add: vi.fn()
    };
    mockAudio = { play: vi.fn() };
    mockParticles = { createEngineTrail: vi.fn() };
    player = new Player(400, 520, mockEntities, mockAudio, mockParticles);
  });

  it('should create player with default stats', () => {
    expect(player.x).toBe(400);
    expect(player.y).toBe(520);
    expect(player.health).toBe(100);
    expect(player.maxHealth).toBe(100);
    expect(player.type).toBe('player');
    expect(player.powerLevel).toBe(1);
  });

  it('should take damage and reduce health', () => {
    player.takeDamage(30);
    expect(player.health).toBe(70);
    expect(player.invulnerable).toBe(true);
  });

  it('should not take damage when invulnerable', () => {
    player.invulnerable = true;
    player.invulnTimer = 1;
    player.takeDamage(30);
    expect(player.health).toBe(100);
  });

  it('should destroy when health reaches zero', () => {
    player.takeDamage(100);
    expect(player.health).toBe(0);
    expect(player.active).toBe(false);
  });

  it('should heal up to max health', () => {
    player.health = 50;
    player.heal(30);
    expect(player.health).toBe(80);
    player.heal(50);
    expect(player.health).toBe(100);
  });

  it('should power up weapon', () => {
    const initialFireRate = player.fireRate;
    player.powerUp();
    expect(player.powerLevel).toBe(2);
    expect(player.fireRate).toBeLessThan(initialFireRate);
  });

  it('should not exceed max power level', () => {
    for (let i = 0; i < 10; i++) {
      player.powerUp();
    }
    expect(player.powerLevel).toBe(4);
  });
});

describe('Enemy', () => {
  let enemy;
  let mockEntities;
  let mockAudio;
  let mockParticles;

  beforeEach(() => {
    mockEntities = {
      renderer: { width: 800, height: 600 },
      add: vi.fn()
    };
    mockAudio = { play: vi.fn() };
    mockParticles = { createHitEffect: vi.fn(), createExplosion: vi.fn() };
  });

  it('should create basic enemy by default', () => {
    enemy = new Enemy(100, 100, mockEntities, mockAudio, mockParticles, 1);
    expect(enemy.type).toBe('enemy');
    expect(enemy.enemyType).toBe('basic');
    expect(enemy.health).toBeGreaterThan(0);
  });

  it('should take damage', () => {
    enemy = new Enemy(100, 100, mockEntities, mockAudio, mockParticles, 1);
    const initialHealth = enemy.health;
    enemy.takeDamage(10);
    expect(enemy.health).toBe(initialHealth - 10);
    expect(mockParticles.createHitEffect).toHaveBeenCalled();
  });

  it('should destroy when health reaches zero', () => {
    enemy = new Enemy(100, 100, mockEntities, mockAudio, mockParticles, 1);
    enemy.takeDamage(enemy.health);
    expect(enemy.active).toBe(false);
    expect(mockParticles.createExplosion).toHaveBeenCalled();
    expect(mockAudio.play).toHaveBeenCalledWith('explosion');
  });
});

describe('Bullet', () => {
  let bullet;
  let mockEntities;
  let mockAudio;
  let mockParticles;

  beforeEach(() => {
    mockEntities = {
      renderer: { width: 800, height: 600 },
      add: vi.fn()
    };
    mockAudio = { play: vi.fn() };
    mockParticles = {};
    bullet = new Bullet(400, 300, -Math.PI / 2, 600, 20, 'player', mockEntities, mockAudio, mockParticles);
  });

  it('should create bullet with correct properties', () => {
    expect(bullet.x).toBe(400);
    expect(bullet.y).toBe(300);
    expect(bullet.type).toBe('bullet');
    expect(bullet.damage).toBe(20);
    expect(bullet.owner).toBe('player');
  });

  it('should update position based on angle and speed', () => {
    bullet.update(1);
    expect(bullet.y).toBeLessThan(300);
    expect(bullet.x).toBe(400);
  });

  it('should destroy when lifetime expires', () => {
    bullet.lifetime = 0;
    bullet.update(0.1);
    expect(bullet.active).toBe(false);
  });

  it('should destroy when off screen', () => {
    bullet.x = -10;
    bullet.update(0.1);
    expect(bullet.active).toBe(false);
  });
});

describe('EnemyBullet', () => {
  it('should create enemy bullet with correct properties', () => {
    const mockEntities = { renderer: { width: 800, height: 600 }, add: vi.fn() };
    const mockAudio = { play: vi.fn() };
    const mockParticles = {};
    const bullet = new EnemyBullet(400, 300, Math.PI / 2, 300, 10, mockEntities, mockAudio, mockParticles);
    expect(bullet.type).toBe('enemyBullet');
    expect(bullet.color).toBe('#ff3366');
  });
});

describe('Powerup', () => {
  let powerup;
  let mockEntities;
  let mockParticles;

  beforeEach(() => {
    mockEntities = { renderer: { width: 800, height: 600 }, add: vi.fn() };
    mockParticles = { createPowerupEffect: vi.fn(), createScreenFlash: vi.fn() };
  });

  it('should create powerup', () => {
    powerup = new Powerup(400, 300, mockEntities, mockParticles);
    expect(powerup.type).toBe('powerup');
    expect(powerup.kind).toBeDefined();
    expect(['weapon', 'health', 'shield', 'bomb']).toContain(powerup.kind);
  });

  it('should apply weapon powerup to player', () => {
    powerup = new Powerup(400, 300, mockEntities, mockParticles);
    powerup.kind = 'weapon';
    const mockPlayer = { powerUp: vi.fn() };
    powerup.apply(mockPlayer);
    expect(mockPlayer.powerUp).toHaveBeenCalled();
    expect(mockParticles.createPowerupEffect).toHaveBeenCalled();
  });

  it('should apply health powerup to player', () => {
    powerup = new Powerup(400, 300, mockEntities, mockParticles);
    powerup.kind = 'health';
    const mockPlayer = { heal: vi.fn() };
    powerup.apply(mockPlayer);
    expect(mockPlayer.heal).toHaveBeenCalledWith(25);
  });

  it('should apply bomb powerup and damage all enemies', () => {
    powerup = new Powerup(400, 300, mockEntities, mockParticles);
    powerup.kind = 'bomb';
    const mockEnemy1 = { takeDamage: vi.fn() };
    const mockEnemy2 = { takeDamage: vi.fn() };
    mockEntities.getByType = vi.fn().mockReturnValue([mockEnemy1, mockEnemy2]);
    const mockPlayer = {};
    powerup.apply(mockPlayer);
    expect(mockEnemy1.takeDamage).toHaveBeenCalledWith(100);
    expect(mockEnemy2.takeDamage).toHaveBeenCalledWith(100);
    expect(mockParticles.createScreenFlash).toHaveBeenCalled();
  });
});

describe('ParticleSystem', () => {
  let particles;

  beforeEach(() => {
    particles = new ParticleSystem();
  });

  it('should create explosion particles', () => {
    particles.createExplosion(100, 100, '#ff0000', 10);
    expect(particles.particles.length).toBe(10);
  });

  it('should create hit effect particles', () => {
    particles.createHitEffect(100, 100, '#ffffff');
    expect(particles.particles.length).toBe(8);
  });

  it('should update particles and remove expired ones', () => {
    particles.createExplosion(100, 100, '#ff0000', 10);
    const initialCount = particles.particles.length;
    particles.update(10); // Large delta to expire all
    expect(particles.particles.length).toBe(0);
  });

  it('should clear all particles', () => {
    particles.createExplosion(100, 100, '#ff0000', 10);
    particles.clear();
    expect(particles.particles.length).toBe(0);
  });
});

describe('Starfield', () => {
  let starfield;

  beforeEach(() => {
    starfield = new Starfield(800, 600, 3);
  });

  it('should create multiple layers', () => {
    expect(starfield.layers.length).toBe(3);
  });

  it('should update layer offsets', () => {
    const initialOffsets = starfield.layers.map(l => l.offsetY);
    starfield.update(1);
    const newOffsets = starfield.layers.map(l => l.offsetY);
    expect(newOffsets).not.toEqual(initialOffsets);
  });

  it('should wrap offsets at height', () => {
    starfield.layers[0].offsetY = 590;
    starfield.update(1);
    expect(starfield.layers[0].offsetY).toBeLessThan(600);
  });
});

describe('InputManager', () => {
  let input;

  beforeEach(() => {
    input = new InputManager();
  });

  it('should track key presses', () => {
    input.keys.add('KeyW');
    input.update();
    expect(input.isPressed('KeyW')).toBe(true);
    expect(input.isJustPressed('KeyW')).toBe(true);
  });

  it('should track key releases', () => {
    input.keys.add('KeyW');
    input.update();
    input.keys.delete('KeyW');
    input.update();
    expect(input.isJustReleased('KeyW')).toBe(true);
  });

  it('should calculate direction vector', () => {
    input.keys.add('KeyW');
    input.keys.add('KeyD');
    const dir = input.getDirection();
    expect(dir.x).toBeGreaterThan(0);
    expect(dir.y).toBeLessThan(0);
    const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
    expect(len).toBeCloseTo(1, 5);
  });
});

describe('EntityManager', () => {
  let manager;
  let mockEntity;

  beforeEach(() => {
    manager = new EntityManager();
    mockEntity = {
      active: true,
      type: 'test',
      update: vi.fn(),
      render: vi.fn()
    };
  });

  it('should add and update entities', () => {
    manager.add(mockEntity);
    manager.update(0.1, {});
    expect(mockEntity.update).toHaveBeenCalled();
  });

  it('should remove inactive entities', () => {
    manager.add(mockEntity);
    mockEntity.active = false;
    manager.update(0.1, {});
    expect(manager.entities.length).toBe(0);
  });

  it('should filter by type', () => {
    const entity1 = { ...mockEntity, type: 'enemy' };
    const entity2 = { ...mockEntity, type: 'bullet' };
    manager.add(entity1);
    manager.add(entity2);
    const enemies = manager.getByType('enemy');
    expect(enemies.length).toBe(1);
    expect(enemies[0].type).toBe('enemy');
  });

  it('should clear all entities', () => {
    manager.add(mockEntity);
    manager.clear();
    expect(manager.entities.length).toBe(0);
  });
});

describe('Renderer', () => {
  let canvas;
  let ctx;
  let renderer;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    ctx = canvas.getContext('2d');
    renderer = new Renderer(ctx, 800, 600);
  });

  it('should clear canvas', () => {
    renderer.clear();
    const pixel = ctx.getImageData(0, 0, 1, 1).data;
    expect(pixel[0]).toBe(0);
    expect(pixel[1]).toBe(0);
    expect(pixel[2]).toBe(0);
    expect(pixel[3]).toBe(255);
  });

  it('should draw rect', () => {
    renderer.drawRect(100, 100, 50, 50, '#ff0000');
    // Just verify no errors
  });

  it('should draw circle', () => {
    renderer.drawCircle(100, 100, 25, '#00ff00');
    // Just verify no errors
  });
});

describe('AudioManager', () => {
  let audio;

  beforeEach(() => {
    audio = new AudioManager();
  });

  it('should initialize without errors', () => {
    expect(audio).toBeDefined();
    expect(audio.sounds).toBeInstanceOf(Map);
  });

  it('should have sound effects defined', () => {
    expect(audio.sounds.has('shoot')).toBe(true);
    expect(audio.sounds.has('hit')).toBe(true);
    expect(audio.sounds.has('explosion')).toBe(true);
    expect(audio.sounds.has('playerHit')).toBe(true);
    expect(audio.sounds.has('powerup')).toBe(true);
    expect(audio.sounds.has('waveClear')).toBe(true);
  });

  it('should play sounds without errors', () => {
    expect(() => audio.play('shoot')).not.toThrow();
    expect(() => audio.play('hit')).not.toThrow();
    expect(() => audio.play('explosion')).not.toThrow();
  });

  it('should set volume', () => {
    audio.setVolume(0.5);
    expect(audio.masterGain.gain.value).toBe(0.5);
  });

  it('should clamp volume', () => {
    audio.setVolume(1.5);
    expect(audio.masterGain.gain.value).toBe(1);
    audio.setVolume(-0.5);
    expect(audio.masterGain.gain.value).toBe(0);
  });
});