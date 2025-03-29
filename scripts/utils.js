import { canvas, ctx } from './main.js';
import { hasBirdShield, isBirdRecovering } from './bird.js';
import {getBirdSkin} from './ui.js';

// 🎵 Sonidos
export const flapSound = new Audio('/assets/flap.wav');
export const hitSound = new Audio('/assets/hit.wav');
export const pointSound = new Audio('/assets/point.wav');

export function setVolume(vol) {
  flapSound.volume = vol;
  hitSound.volume = vol;
  pointSound.volume = vol;
}

// 🌄 Fondo animado
const bgImg = new Image();
let bgOffset = 0;

export function setBackground(bgKey) {
  bgImg.src = `/assets/${bgKey}.png`;
  bgImg.onload = () => {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  };
}

export function drawBackground(ctx) {
  bgOffset = (bgOffset - 1) % canvas.width;
  ctx.drawImage(bgImg, bgOffset, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, bgOffset + canvas.width, 0, canvas.width, canvas.height);
}

export function autoSetBackground() {
  const hour = new Date().getHours();
  const autoBg = (hour >= 18 || hour < 6) ? 'bg-night' : 'bg';
  setBackground(autoBg);
  const bgSelector = document.getElementById('bgSelector');
  if (bgSelector) bgSelector.value = autoBg;
}

// ✨ Animación del score al sumar puntos
export function animateScore() {
  const scoreDisplay = document.getElementById('score');
  scoreDisplay.classList.add('score-pop');
  setTimeout(() => scoreDisplay.classList.remove('score-pop'), 300);
}

// 📏 Resize del canvas
export function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

export function getTrailColor() {
  switch (getBirdSkin()) {
    case 'yellow': return 'gold';
    case 'blue': return '#4da6ff';
    case 'red': return '#ff4d4d';
    default: return 'gold';
  }
}

