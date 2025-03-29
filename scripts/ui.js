import { startGame, resetGame, score, highScore } from './main.js';
import { setBirdSkin } from './bird.js';
import { setDifficulty } from './pipes.js';
import { setBackground, setVolume } from './utils.js';

const startMenu = document.getElementById('startMenu');
const startBtn = document.getElementById('startBtn');
const skinSelector = document.getElementById('birdSkin');
const bgSelector = document.getElementById('bgSelector');
const difficultySelector = document.getElementById('difficultySelector');
const langSelector = document.getElementById('langSelector');
const volumeSlider = document.getElementById('volumeSlider');
const muteBtn = document.getElementById('muteBtn');
const scoreDisplay = document.getElementById('score');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverContent = document.querySelector('.gameOverContent');
const birdPreview = document.getElementById('birdPreview');
const backToMenuBtn = document.getElementById('backToMenuBtn');

export function setUIListeners() {
  startBtn.addEventListener('click', () => {
    const selectedSkin = skinSelector.value;
    const selectedBg = bgSelector.value;
    const difficulty = difficultySelector.value;

    localStorage.setItem('skin', selectedSkin);
    localStorage.setItem('bg', selectedBg);
    localStorage.setItem('difficulty', difficulty);

    setBirdSkin(selectedSkin);
    setBackground(selectedBg);
    setDifficulty(difficulty);

    startGame();
  });

  restartBtn.addEventListener('click', () => {
    gameOverScreen.style.opacity = 0;
    setTimeout(() => {
      resetGame();
      gameOverScreen.classList.remove('show');
    }, 500);
  });

  volumeSlider.addEventListener('input', () => {
    setVolume(parseFloat(volumeSlider.value));
  });

  muteBtn.addEventListener('click', () => {
    const isMuted = parseFloat(volumeSlider.value) === 0;
    const newVol = isMuted ? 1 : 0;
    setVolume(newVol);
    volumeSlider.value = newVol;
    muteBtn.textContent = isMuted ? '🔊' : '🔇';
  });

  skinSelector.addEventListener('change', (e) => {
    setBirdSkin(e.target.value);
  });

  bgSelector.addEventListener('change', (e) => {
    const canvas = document.getElementById('gameCanvas');
    canvas.classList.add('fade-out');
    setTimeout(() => {
      setBackground(e.target.value);
      canvas.classList.remove('fade-out');
      canvas.classList.add('fade-in');
      setTimeout(() => canvas.classList.remove('fade-in'), 500);
    }, 500);
  });

  langSelector.addEventListener('change', (e) => {
    const selectedLang = e.target.value;
    localStorage.setItem('lang', selectedLang);
    loadLanguage(selectedLang);
  });

  backToMenuBtn.addEventListener('click', () => {
    gameOverScreen.style.opacity = 0;
    setTimeout(() => {
      gameOverScreen.classList.remove('show');
      document.getElementById('startMenu').style.display = 'block';
      document.getElementById('startMenu').classList.remove('fade-out');
      document.getElementById('startMenu').classList.add('fade-in');
    }, 500);
  });

  // Actualiza preview del pájaro
  let previewFrame = 0;
  setInterval(() => {
    const skin = skinSelector.value;
    birdPreview.style.backgroundImage = `url(/assets/${skin}bird-${['upflap', 'midflap', 'downflap'][previewFrame]}.png)`;
    birdPreview.style.backgroundSize = 'contain';
    birdPreview.style.backgroundRepeat = 'no-repeat';
    birdPreview.style.backgroundPosition = 'center';
    previewFrame = (previewFrame + 1) % 3;
  }, 200);
}

export function applySavedSettings() {
  const savedSkin = localStorage.getItem('skin') || 'yellow';
  const savedBg = localStorage.getItem('bg') || 'bg';
  const savedDifficulty = localStorage.getItem('difficulty') || 'normal';
  const savedLang = localStorage.getItem('lang') || navigator.language.slice(0, 2) || 'es';

  skinSelector.value = savedSkin;
  bgSelector.value = savedBg;
  difficultySelector.value = savedDifficulty;
  langSelector.value = savedLang;

  setBirdSkin(savedSkin);
  setBackground(savedBg);
  setDifficulty(savedDifficulty);
  loadLanguage(savedLang);
}

export function hideStartMenu() {
  startMenu.classList.add('fade-out');
  setTimeout(() => {
    startMenu.style.display = 'none';
  }, 500);
}

export function showGameOverScreen(currentScore, highScore) {
  finalScore.textContent = `${currentScore} (Record: ${highScore})`;
  gameOverScreen.classList.add('show');
  void gameOverScreen.offsetWidth; // reflow
  gameOverScreen.style.opacity = 1;
  gameOverContent.classList.add('show');
}

export function updateScoreDisplay(currentScore) {
  scoreDisplay.textContent = currentScore;
}

// Para traducción
async function loadLanguage(langCode) {
  try {
    const res = await fetch(`/lang/${langCode}.json`);
    const langData = await res.json();

    document.querySelector('#startMenu h2').textContent = langData.welcome;
    document.querySelector('.preview-container span').textContent = langData.choose_bird;
    document.querySelector('.bg-container span').textContent = langData.background;
    document.querySelector('.difficulty-container span').textContent = langData.difficulty;
    document.querySelector('.volume-container span').textContent = langData.volume;
    document.querySelector('#startBtn').textContent = langData.play;
    document.querySelector('#restartBtn').textContent = langData.restart;
    document.querySelector('#language').textContent = langData.language;
    document.querySelector('.gameOverContent h1').textContent = langData.game_over;
    document.querySelector('#finalScore').previousSibling.textContent = langData.score + ": ";
    document.querySelector('#backToMenuBtn').textContent = langData.return_menu;

    const difficultyOptions = document.querySelectorAll('#difficultySelector option');
    difficultyOptions[0].textContent = langData.easy;
    difficultyOptions[1].textContent = langData.normal;
    difficultyOptions[2].textContent = langData.hard;
    difficultyOptions[3].textContent = langData.impossible;

    const skinOptions = document.querySelectorAll('#birdSkin option');
    skinOptions[0].textContent = langData.yellow;
    skinOptions[1].textContent = langData.blue;
    skinOptions[2].textContent = langData.red;

    const bgOptions = document.querySelectorAll('#bgSelector option');
    bgOptions[0].textContent = langData.day;
    bgOptions[1].textContent = langData.night;
    bgOptions[2].textContent = langData.clouds;
  } catch (err) {
    console.error("Error cargando idioma:", err);
  }
}
