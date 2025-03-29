import { ctx, canvas, endGame } from './main.js';
import { flapSound } from './utils.js';

// Variables internas
let birdFrame = 0;
let frameCounter = 0;
const flapSpeed = 10;
let isInvulnerable = false;
let invulnerableTimer = 0;
let shieldTimer = 0;
let shieldVisible = true;
let hasShield = false;
let isRecovering = false;
let recoveryTimer = 0;
let isVisible = true;

export let currentSkinColor = 'yellow';

const birdSprites = [new Image(), new Image(), new Image()];

export const bird = {
  x: 0,
  y: 0,
  width: 40,
  height: 30,
  gravity: 0.6,
  velocity: 0,
  jump: -10,

  draw(ctx) {
    if (!isVisible) return; // parpadeo
    if (!isVisible) return;

    if (hasShield) {
      // Dibujar aura de escudo
      ctx.save();
      ctx.shadowColor = 'aqua';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
    
    ctx.drawImage(birdSprites[birdFrame], this.x, this.y, this.width, this.height);
  },    
  
  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
  
    if ((this.y + this.height > canvas.height || this.y < 0) && !isRecovering) {
      endGame();
    }
  
    // Animación de aleteo
    frameCounter++;
    if (frameCounter % flapSpeed === 0) {
      birdFrame = (birdFrame + 1) % 3;
    }
  
    if (hasShield) {
      shieldTimer--;
  
      if (shieldTimer < 30) {
        if (shieldTimer % 5 === 0) {
          shieldVisible = !shieldVisible;
        }
      } else {
        shieldVisible = true;
      }
  
      if (shieldTimer <= 0) {
        hasShield = false;
        shieldVisible = true;
      }
    }
  
    if (isRecovering) {
      recoveryTimer--;
      if (recoveryTimer % 5 === 0) {
        isVisible = !isVisible;
      }
      if (recoveryTimer <= 0) {
        isRecovering = false;
        isVisible = true;
      }
    }
  },

  flap() {
    this.velocity = this.jump;
    flapSound.currentTime = 0;
    flapSound.play();
  },

  if (isInvulnerable) {
    invulnerableTimer--;
  
    if (invulnerableTimer % 3 === 0) {
      isVisible = !isVisible;
    }
  
    if (invulnerableTimer <= 0) {
      isInvulnerable = false;
      isVisible = true;
    }
  }
};

export function initBird(canvas) {
  bird.x = canvas.width * 0.2;
  bird.y = canvas.height / 2;
  bird.velocity = 0;
}

export function resetBird() {
  bird.x = canvas.width * 0.2;
  bird.y = canvas.height / 2;
  bird.velocity = 0;

  isInvulnerable = false;
  invulnerableTimer = 0;
  isVisible = true;
  birdFrame = 0;
  frameCounter = 0;
  hasShield = false;
  shieldTimer = 0;
  shieldVisible = true;
}

export function flapBird() {
  bird.flap();
}

export function updateBird() {
  bird.update();
}

export function drawBird(ctx) {
  if (!isVisible) return; // parpadeo: no se dibuja

  bird.draw(ctx);
}

export function setBirdSkin(skin) {
  currentSkinColor = skin;
  birdSprites[0].src = `/assets/${skin}bird-upflap.png`;
  birdSprites[1].src = `/assets/${skin}bird-midflap.png`;
  birdSprites[2].src = `/assets/${skin}bird-downflap.png`;
}

export function isBirdInvulnerable() {
  return isInvulnerable;
}

export function birdHasShield() {
  return hasShield;
}

export function removeBirdShield() {
  hasShield = false;
}

export function grantShield() {
  hasShield = true;
  shieldTimer = 180; // 3 segundos
  shieldVisible = true;
}

export function hasBirdShield() {
  return hasShield;
}

export function triggerRecovery() {
  isRecovering = true;
  recoveryTimer = 120; 
  isVisible = true;
}

export function isBirdRecovering() {
  return isRecovering;
}
