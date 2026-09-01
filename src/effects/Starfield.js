// Starfield - Parallax scrolling star background
export class Starfield {
  constructor(width, height, layers = 3) {
    this.width = width;
    this.height = height;
    this.layers = [];
    this.time = 0;

    for (let i = 0; i < layers; i++) {
      const density = (layers - i) * 30;
      const speed = (i + 1) * 20;
      const size = 0.5 + i * 0.5;
      const colorAlpha = 0.3 + i * 0.2;

      const stars = [];
      for (let j = 0; j < density; j++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: size * (0.5 + Math.random() * 0.5),
          alpha: colorAlpha * (0.3 + Math.random() * 0.7),
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.5 + Math.random() * 2
        });
      }

      this.layers.push({ stars, speed, offsetY: 0 });
    }
  }

  update(deltaTime) {
    this.time += deltaTime;

    for (const layer of this.layers) {
      layer.offsetY += layer.speed * deltaTime;
      if (layer.offsetY >= this.height) {
        layer.offsetY -= this.height;
      }
    }
  }

  render(ctx) {
    for (const layer of this.layers) {
      for (const star of layer.stars) {
        const y = (star.y + layer.offsetY) % this.height;
        const alpha = star.alpha * (0.5 + Math.sin(this.time * star.twinkleSpeed + star.twinkle) * 0.5);

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }
}