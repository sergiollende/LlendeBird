import { currentSkinColor } from './bird.js';

export const particles = [];

export function addParticles(x, y, colorOverride = null) {
  for (let i = 0; i < 10; i++) {
    particles.push(new Particle(x, y, colorOverride));
  }
}

export function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (!particles[i].isAlive()) {
      particles.splice(i, 1);
    }
  }
}

export function drawParticles(ctx) {
  particles.forEach(p => p.draw(ctx));
}

export function resetParticles() {
  particles.length = 0;
}


export function createExplosion(x, y) {
  for (let i = 0; i < 20; i++) {
    const p = new Particle(x, y); 
    particles.push(p);
  }
}

class Particle {
  constructor(x, y, forcedColor = null) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 4 + 2;

    const colorMap = {
      yellow: 'gold',
      red: '#ff4d4d',
      blue: '#4da6ff'
    };
    this.color = forcedColor || colorMap[currentSkinColor] || 'white';

    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 1.5) * 4;
    this.life = 40;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05; // gravedad
    this.life--;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  isAlive() {
    return this.life > 0;
  }
}

export class TrailParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 2 + 1;
    this.vx = -1.5 + Math.random(); // leve hacia atrás
    this.vy = (Math.random() - 0.5) * 0.5;
    this.color = color;
    this.life = 30;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.life / 30;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  isAlive() {
    return this.life > 0;
  }
}
