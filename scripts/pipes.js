import { canvas, ctx, incrementScore , endGame } from './main.js';
import { bird, hasBirdShield, removeBirdShield, triggerRecovery, isBirdRecovering } from './bird.js';
import { pointSound } from './utils.js';
import { addParticles } from './particles.js';
import { maybeSpawnPowerUp, setPowerUpSpawnRate } from './powerups.js';

let pipeTimer = 0;
let pipeSpeed = 2;
let originalPipeSpeed = pipeSpeed;
let basePipeGap = 180; 
let pipeGap = basePipeGap;
let pipeSpawnRate = 100;
let gapBonusActive = false;
let gapBonusTimer = 0;
let gapTransitionFrames = 0;

export const pipes = [];

const pipeWidth = 70;
const pipeImg = new Image();
pipeImg.src = '/assets/pipe.png';

export function createPipe() {
  const top = Math.random() * (canvas.height - pipeGap - 200) + 50;
  pipes.push({ x: canvas.width, top, bottom: top + pipeGap, passed: false });

  maybeSpawnPowerUp(canvas.width + 20, top + pipeGap / 2 - 16);
}

export function updatePipes() {
  for (let i = pipes.length - 1; i >= 0; i--) {
    const pipe = pipes[i];
    pipe.x -= pipeSpeed;

    if (
      bird.x + bird.width > pipe.x &&
      bird.x < pipe.x + pipeWidth &&
      (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)
    ) {
      if (isBirdRecovering()) {
        return;
      }  
      if (hasBirdShield()) {
        removeBirdShield();
        triggerRecovery(); 
        return; 
      }
      endGame();
    }
    

    // Paso del tubo con éxito
    if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
      pipe.passed = true;
      incrementScore();

      pointSound.currentTime = 0;
      pointSound.play();

      addParticles(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.color);

      if (score % 5 === 0) {
        pipeSpeed += 0.5;
        pipeGap = Math.max(120, pipeGap - 10);
        originalPipeSpeed = pipeSpeed;
      }
    }

    // Fuera de la pantalla
    if (pipe.x + pipeWidth < 0) {
      pipes.splice(i, 1);
    }
  }

  pipeTimer++;
  if (pipeTimer % pipeSpawnRate === 0) createPipe();
  if (gapTransitionFrames > 0) {
    gapTransitionFrames--;
  }
  updateGapBonus();
}

export function drawPipes(ctx) {
  pipes.forEach(pipe => {
    let visualGap = pipeGap;
  
    if (gapTransitionFrames > 0) {
      const framesTotal = 15;
      const progress = 1 - (gapTransitionFrames / framesTotal); // 0 → 1
      visualGap = basePipeGap + (pipeGap - basePipeGap) * progress;
    }
  
    const mid = pipe.top + (pipe.bottom - pipe.top) / 2;
    const top = mid - visualGap / 2;
    const bottom = mid + visualGap / 2;
  
    ctx.drawImage(pipeImg, pipe.x, bottom, pipeWidth, canvas.height - bottom);
  
    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(pipeImg, pipe.x, -top, pipeWidth, top);
    ctx.restore();
  });  
}

export function setDifficulty(level) {
  switch (level) {
    case 'easy':
      pipeSpeed = 1.5;
      basePipeGap = 400;
      pipeGap = basePipeGap;
      pipeSpawnRate = 200;
      setPowerUpSpawnRate(80);
      break;
    case 'normal':
      pipeSpeed = 2;
      basePipeGap = 250;
      pipeGap = basePipeGap;
      pipeSpawnRate = 175;
      setPowerUpSpawnRate(65);
      break;
    case 'hard':
      pipeSpeed = 2.5;
      basePipeGap = 150;
      pipeGap = basePipeGap;
      pipeSpawnRate = 150;
      setPowerUpSpawnRate(45);
      break;
    case 'impossible':
      pipeSpeed = 3;
      basePipeGap = 130;
      pipeGap = basePipeGap;
      pipeSpawnRate = 100;
      setPowerUpSpawnRate(30);
      break;
  }
  originalPipeSpeed = pipeSpeed;
}

export function getPipeSpeed() {
  return pipeSpeed;
}

export function setPipeSpeed(value) {
  pipeSpeed = value;
}

export function resetPipes() {
  pipes.length = 0;
  pipeTimer = 0;
  pipeGap = basePipeGap;
  gapBonusActive = false;
  gapBonusTimer = 0;
}

export function activateGapBonus() {
  if (gapBonusActive) return;
  pipeGap += 50;
  gapBonusTimer = 300;
  gapBonusActive = true;
  gapTransitionFrames = 15;
}

function updateGapBonus() {
  if (gapBonusActive) {
    gapBonusTimer--;
    if (gapBonusTimer <= 0) {
      pipeGap = basePipeGap; 
      gapBonusActive = false;
    }
  }
}
