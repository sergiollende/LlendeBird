import { getPipeSpeed, setPipeSpeed, activateGapBonus } from './pipes.js';
import { grantShield } from './bird.js';

export const powerUps = [];
let powerUpActive = null;
let powerUpSpawnRate = 50;
const activePowerUps = {};

export function maybeSpawnPowerUp(x, y) {
  if (Math.random() < powerUpSpawnRate / 100) {
    const types = ['shield', 'slow', 'gap'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUps.push(new PowerUp(x, y, type));
  }
}

export function setPowerUpSpawnRate(rate) {
  powerUpSpawnRate = rate;
}

export function updatePowerUps() {
  powerUps.forEach((p, i) => {
    p.update();

    if (p.x + p.size < 0 || !p.active) {
      powerUps.splice(i, 1);
    }
  });
}

export function drawPowerUps(ctx) {
  powerUps.forEach(p => p.draw(ctx));
}

export function checkPowerUpCollision(bird) {
  powerUps.forEach((p, i) => {
    if (p.checkCollision(bird)) {
      activatePowerUp(p.type, bird);
      p.active = false; 
    }
  });
}

export function activatePowerUp(type, bird) {
  switch (type) {
    case 'shield':
      grantShield();
      showPowerUpBar('shield', 180);
      break;

    case 'slow':
      if (powerUpActive === 'slow') return;
      powerUpActive = 'slow';
      const originalSpeed = getPipeSpeed();
      setPipeSpeed(originalSpeed / 2);
      setTimeout(() => {
        setPipeSpeed(originalSpeed);
        powerUpActive = null;
      }, 5000);
      showPowerUpBar('slow', 240);
      break;

    case 'gap':
      activateGapBonus();
      showPowerUpBar('gap', 300);
      break;
  }
}

export function showPowerUpBar(type, durationFrames) {
  const container = document.getElementById('powerUpBarsContainer');
  if (!container) return;

  if (activePowerUps[type]) {
    const p = activePowerUps[type];
    if (p.timer < durationFrames) {
      p.timer = durationFrames;
      p.duration = durationFrames;
    }
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.classList.add('powerup-bar');

  const icon = document.createElement('img');
  icon.classList.add('powerup-icon');
  icon.src = `assets/${type}.png`;
  icon.alt = type;

  const fill = document.createElement('div');
  fill.classList.add('powerup-fill');
  fill.style.width = '100%';

  wrapper.appendChild(icon);
  wrapper.appendChild(fill);
  container.appendChild(wrapper);

  activePowerUps[type] = {
    duration: durationFrames,
    timer: durationFrames,
    fill,
    element: wrapper
  };
}


export function updatePowerUpBars() {
  for (const type in activePowerUps) {
    const powerUp = activePowerUps[type];

    powerUp.timer--;
    if (powerUp.timer < 0) powerUp.timer = 0;

    const percent = (powerUp.timer / powerUp.duration) * 100;
    powerUp.fill.style.width = `${percent}%`;
    
    if (powerUp.timer <= 0) {
      powerUp.element.remove();
      delete activePowerUps[type];
    }
  }
}


export function resetPowerUps() {
  powerUps.length = 0;
  powerUpActive = null;
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.size = 32;
    this.type = type;
    this.img = new Image();
    this.img.src = `/assets/${type}.png`;
    this.active = true;
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.drawImage(this.img, this.x, this.y, this.size, this.size);
  }

  update() {
    if (!this.active) return;
    this.x -= getPipeSpeed();
  }

  checkCollision(bird) {
    if (!this.active) return false;
  
    const hit =
      bird.x < this.x + this.size &&
      bird.x + bird.width > this.x &&
      bird.y < this.y + this.size &&
      bird.y + bird.height > this.y;
  
    if (hit) {
      this.active = false; // <- ¡ESTO ES CLAVE!
    }
  
    return hit;
  }
}
