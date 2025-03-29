// scripts/main.js
import { bird, flapBird, initBird, updateBird, drawBird, resetBird } from './bird.js';
import { updatePipes, drawPipes, createPipe, resetPipes } from './pipes.js';
import { updatePowerUps, drawPowerUps, checkPowerUpCollision, resetPowerUps, updatePowerUpBars } from './powerups.js';
import { updateParticles, drawParticles, resetParticles } from './particles.js';
import { drawBackground, autoSetBackground, resizeCanvas } from './utils.js';
import { setUIListeners, applySavedSettings, hideStartMenu, showGameOverScreen, updateScoreDisplay } from './ui.js';

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

export let gameStarted = false;
export let gameRunning = false;
export let score = 0;
export let highScore = localStorage.getItem('highScore') || 0;

export function setGameRunning(val) {
  gameRunning = val;
}

export function setGameStarted(val) {
  gameStarted = val;
}

export function resetGame() {
  score = 0;
  gameRunning = true;
  resetBird();
  resetPipes();
  resetParticles();
  resetPowerUps();
  updateScoreDisplay(score);
  createPipe();
  gameLoop();
}

export function incrementScore() {
  score++;
  updateScoreDisplay(score);
}

function gameLoop() {
  if (!gameRunning) return;

  updatePowerUpBars();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(ctx);

  updateBird();
  drawBird(ctx);

  updatePipes();
  drawPipes(ctx);

  updatePowerUps();
  drawPowerUps(ctx);
  checkPowerUpCollision(bird);

  updateParticles();
  drawParticles(ctx);
  requestAnimationFrame(gameLoop);
}

function onResize() {
  resizeCanvas();
}

function onKeyDown(e) {
  if ((e.code === 'Space' || e.code === 'Enter') && gameStarted && gameRunning) {
    e.preventDefault();
    flapBird();
  }
}

function onTouchStart(e) {
  if (gameStarted && gameRunning) {
    e.preventDefault();
    flapBird();
  }
}

function init() {
  resizeCanvas();
  initBird(canvas);
  autoSetBackground();
  applySavedSettings();
  setUIListeners();

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('touchstart', onTouchStart);
}

export function startGame() {
  gameStarted = true;
  hideStartMenu();
  resetGame();
}

export function endGame() {
  gameRunning = false;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
  showGameOverScreen(score, highScore);
}

init();
