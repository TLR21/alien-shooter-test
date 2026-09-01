// GameEngine - Main game loop coordinator
export class GameEngine {
  constructor(game) {
    this.game = game;
    this.systems = [];
  }

  addSystem(system) {
    this.systems.push(system);
  }

  update(deltaTime) {
    for (const system of this.systems) {
      if (system.update) {
        system.update(deltaTime);
      }
    }
  }
}