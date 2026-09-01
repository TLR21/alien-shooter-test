// EntityManager - Manages all game entities
export class EntityManager {
  constructor() {
    this.entities = [];
    this.toAdd = [];
    this.toRemove = [];
  }

  add(entity) {
    this.toAdd.push(entity);
  }

  remove(entity) {
    this.toRemove.push(entity);
  }

  clear() {
    this.entities = [];
    this.toAdd = [];
    this.toRemove = [];
  }

  update(deltaTime, input) {
    // Process additions
    this.entities.push(...this.toAdd);
    this.toAdd = [];

    // Update all entities
    for (const entity of this.entities) {
      if (entity.active) {
        entity.update(deltaTime, input);
      }
    }

    // Process removals
    for (const entity of this.toRemove) {
      const index = this.entities.indexOf(entity);
      if (index !== -1) {
        this.entities.splice(index, 1);
      }
    }
    this.toRemove = [];

    // Remove inactive entities
    this.entities = this.entities.filter(e => e.active);
  }

  render(ctx) {
    for (const entity of this.entities) {
      if (entity.active && entity.render) {
        entity.render(ctx);
      }
    }
  }

  getByType(type) {
    return this.entities.filter(e => e.type === type && e.active);
  }

  getAll() {
    return this.entities.filter(e => e.active);
  }
}