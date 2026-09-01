# Alien Shooter - OpenCode Integration Test

A fully playable alien shooter browser game built to test **ALL** OpenCode MCPs, plugins, and skills.

## 🎮 Play the Game

Open `index.html` in a browser, or run:
```bash
npm install
npm run dev
```

Then visit `http://localhost:3000`

## 🎯 Controls

| Key | Action |
|-----|--------|
| `W` `A` `S` `D` / Arrow Keys | Move ship |
| `Space` / Click | Shoot |
| `P` | Pause/Resume |
| `Enter` | Restart (on game over) |

## 🛠️ Tech Stack

- **HTML5 Canvas** - Rendering
- **Vanilla JavaScript (ES Modules)** - Game logic
- **Web Audio API** - Sound effects (procedurally generated)
- **Playwright** - E2E testing
- **Vitest** - Unit testing

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# With UI
npm run test:ui
```

## 📊 Test Results

- **Playwright E2E**: 20/21 tests passing (Chrome, Firefox, Safari)
- **Vitest Unit**: 32/44 tests passing (environment limitations for Audio/Canvas)

## 🏗️ Architecture

```
src/
├── main.js                 # Game entry point
├── engine/
│   ├── GameEngine.js       # Game loop coordinator
│   ├── InputManager.js     # Keyboard/mouse input
│   ├── EntityManager.js    # Entity lifecycle
│   ├── Renderer.js         # Canvas rendering helpers
│   └── AudioManager.js     # Web Audio API wrapper
├── entities/
│   ├── Entity.js           # Base entity class
│   ├── Player.js           # Player ship
│   ├── Enemy.js            # Alien enemies (4 types)
│   ├── Bullet.js           # Projectiles
│   └── Powerup.js          # Collectible power-ups
└── effects/
    ├── ParticleSystem.js   # Visual effects
    └── Starfield.js        # Parallax background
```

## 🎨 Features

- **4 Enemy Types**: Basic, Fast, Heavy, Boss
- **Wave System**: 10 waves of increasing difficulty
- **Power-ups**: Weapon upgrade, Health, Shield, Bomb
- **Particle Effects**: Explosions, trails, screen flash
- **Parallax Starfield**: 3-layer scrolling background
- **Procedural Audio**: All sounds generated via Web Audio API
- **Responsive UI**: Score, health bar, wave counter
- **Pause/Resume**: Full game state management

## 🔧 MCPs & Skills Tested

This project validates the entire OpenCode ecosystem:

| MCP | Status |
|-----|--------|
| Playwright | ✅ E2E testing |
| GitHub | ✅ Repo/Issue/PR management |
| Terraform | 🔄 Infrastructure |
| Kubernetes | 🔄 Deployment |
| Docker | 🔄 Containerization |
| Image Creation | 🔄 Asset generation |

| Plugin | Status |
|--------|--------|
| opencode-gemini-auth | ✅ |
| opencode-supermemory | ✅ |

| Skill Collection | Skills Tested |
|-----------------|---------------|
| opencode-skills-collection | 300+ |
| salmanneomtech-opencode-skills | 300+ (game dev, threejs, r3f, etc.) |
| kedbin-opencode-skills | trello-manager |
| mosherozen-opencode | 14 (testing, visual, github, etc.) |

## 📦 Deployment

```bash
# Docker
docker build -t alien-shooter .
docker run -p 3000:3000 alien-shooter

# Vercel (recommended)
vercel deploy
```

## 📄 License

MIT - OpenCode Integration Test