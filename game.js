const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startMenu = document.getElementById('startMenu');
const startBtn = document.getElementById('startBtn');
const birdPreview = document.getElementById('birdPreview');
const skinSelector = document.getElementById('birdSkin');
const difficultySelector = document.getElementById('difficultySelector');
const volumeSlider = document.getElementById('volumeSlider');
const muteBtn = document.getElementById('muteBtn');
const bgSelector = document.getElementById('bgSelector');

// Estado del juego
let gameStarted = false;
let gameRunning = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let pipeTimer = 0;
const pipes = [];
const particles = [];

// Powerups
const powerUps = [];
let powerUpActive = null;
let powerUpTimer = 0;
let hasShield = false;
let powerUpSpawnRate = 30;

// Bird
const pipeWidth = 70;
let pipeSpeed = 2;
let originalPipeSpeed = pipeSpeed;
let basePipeGap = 180;
let pipeGap = basePipeGap;
let pipeSpawnRate = 100; // Cada cuántos frames aparece un tubo
let birdFrame = 0;
let frameCounter = 0;
const flapSpeed = 10;

// Dimensiones del canvas
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Sonidos
const flapSound = new Audio('assets/flap.wav');
const hitSound = new Audio('assets/hit.wav');
const pointSound = new Audio('assets/point.wav');

function autoSetBackground() {
  const hour = new Date().getHours();
  const autoBg = (hour >= 18 || hour < 6) ? 'bg-night' : 'bg';
  bgSelector.value = autoBg;
  setBackground(autoBg);
}

function setVolume(vol) {
  flapSound.volume = vol;
  hitSound.volume = vol;
  pointSound.volume = vol;
}

volumeSlider.addEventListener('input', () => {
  setVolume(parseFloat(volumeSlider.value));
});

muteBtn.addEventListener('click', () => {
  const isMuted = flapSound.volume > 0;
  setVolume(isMuted ? 0 : 1);
  volumeSlider.value = isMuted ? 0 : 1;
  muteBtn.textContent = isMuted ? '🔇' : '🔊';
});

// Skins y fondo
let currentSkinColor = 'yellow';
const birdSprites = [new Image(), new Image(), new Image()];
const bgImg = new Image();
const pipeImg = new Image();
pipeImg.src = 'assets/pipe.png';

function setBirdSkin(skin) {
  currentSkinColor = skin;
  birdSprites[0].src = `assets/${skin}bird-upflap.png`;
  birdSprites[1].src = `assets/${skin}bird-midflap.png`;
  birdSprites[2].src = `assets/${skin}bird-downflap.png`;
}

function setBackground(bg) {
  bgImg.src = `assets/${bg}.png`;
}

let bgOffset = 0;
function drawBackground() {
  bgOffset = (bgOffset - 1) % canvas.width;
  ctx.drawImage(bgImg, bgOffset, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, bgOffset + canvas.width, 0, canvas.width, canvas.height);
}

function applySavedSettings() {
  const savedSkin = localStorage.getItem('skin') || 'yellow';
  const savedBg = localStorage.getItem('bg') || 'bg';
  const savedDifficulty = localStorage.getItem('difficulty') || 'normal';
  const langSelector = document.getElementById('langSelector');
  const savedLang = localStorage.getItem('lang') || navigator.language.slice(0,2) || 'es';

  langSelector.value = savedLang;
  skinSelector.value = savedSkin;
  bgSelector.value = savedBg;
  difficultySelector.value = savedDifficulty;

  setBirdSkin(savedSkin);
  setBackground(savedBg);
  setDifficulty(savedDifficulty);

  loadLanguage(savedLang);

  langSelector.addEventListener('change', (e) => {
    const selectedLang = e.target.value;
    localStorage.setItem('lang', selectedLang);
    loadLanguage(selectedLang);
});
}

let previewFrame = 0;
setInterval(() => {
  const skin = skinSelector.value;
  birdPreview.style.backgroundImage = `url(assets/${skin}bird-${['upflap', 'midflap', 'downflap'][previewFrame]}.png)`;
  birdPreview.style.backgroundSize = 'contain';
  birdPreview.style.backgroundRepeat = 'no-repeat';
  birdPreview.style.backgroundPosition = 'center';
  previewFrame = (previewFrame + 1) % 3;
}, 200);

skinSelector.addEventListener('change', (e) => {
  setBirdSkin(e.target.value);
});

bgSelector.addEventListener('change', (e) => {
  // Aplica un efecto de fade-out al canvas
  canvas.classList.add('fade-out');
  setTimeout(() => {
    setBackground(e.target.value);
    canvas.classList.remove('fade-out');
    canvas.classList.add('fade-in');
    // Remueve la clase fade-in después de la transición
    setTimeout(() => {
      canvas.classList.remove('fade-in');
    }, 500);
  }, 500);
});

applySavedSettings();
autoSetBackground();

startBtn.addEventListener('click', () => {
  const selectedSkin = skinSelector.value;
  const selectedBg = bgSelector.value;
  const difficulty = document.getElementById('difficultySelector').value;

  localStorage.setItem('difficulty', difficulty);
  localStorage.setItem('skin', selectedSkin);
  localStorage.setItem('bg', selectedBg);

  setBirdSkin(selectedSkin);
  setBackground(selectedBg);
  setDifficulty(difficulty);

  startMenu.classList.add('fade-out');
  setTimeout(() => {
    startMenu.style.display = 'none';
    gameStarted = true;
    gameRunning = true;
    createPipe();
    gameLoop();
  }, 500); 
});


const bird = {
  x: canvasWidth * 0.2,
  y: canvasHeight / 2,
  width: 40,
  height: 30,
  gravity: 0.6,
  velocity: 0,
  jump: -10,
  draw() {
    if (hasShield) {
      // Dibujar un aura
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
  
    // Dibujar el pájaro
    ctx.drawImage(birdSprites[birdFrame], this.x, this.y, this.width, this.height);
  },
  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;

    if (this.y + this.height > canvas.height || this.y < 0) gameOver();

    frameCounter++;
    if (frameCounter % flapSpeed === 0) {
      birdFrame = (birdFrame + 1) % 3;
    }
  },
  flap() {
    this.velocity = this.jump;
    flapSound.currentTime = 0;
    flapSound.play();
  }
};

// Tubos y partículas
function createPipe() {
  const top = Math.random() * (canvas.height - pipeGap - 200) + 50;
  pipes.push({ x: canvas.width, top, bottom: top + pipeGap, passed: false });
  if (Math.random() < powerUpSpawnRate / 100) {
    const types = ['shield', 'slow', 'gap'];
    const type = types[Math.floor(Math.random() * types.length)];
    const y = top + pipeGap / 2 - 16; // centro del hueco
    powerUps.push(new PowerUp(canvas.width + 20, y, type));
  }
}

function updatePipes() {
  for (let i = pipes.length - 1; i >= 0; i--) {
    const pipe = pipes[i];
    pipe.x -= pipeSpeed;

    if (
      bird.x + bird.width > pipe.x &&
      bird.x < pipe.x + pipeWidth &&
      (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)
    ) {
      if (hasShield) {
        hasShield = false;
      } else {
        gameOver();
      }
    }

    if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
      pipe.passed = true;
      score++;
      scoreDisplay.textContent = score;
      animateScore();

      pointSound.currentTime = 0;
      pointSound.play();

      for (let i = 0; i < 10; i++) {
        particles.push(new Particle(bird.x + bird.width / 2, bird.y + bird.height / 2));
      }

      if (score % 5 === 0 && powerUpActive !== 'slow') {
        pipeSpeed += 0.5;
        pipeGap = Math.max(120, pipeGap - 10);
        originalPipeSpeed = pipeSpeed; 
      }
    }

    if (pipe.x + pipeWidth < 0) pipes.splice(i, 1);
  }

  pipeTimer++;
  if (pipeTimer % pipeSpawnRate === 0) createPipe();
}

function activatePowerUp(type) {
  switch (type) {
    case 'shield':
      hasShield = true;
      break;
    case 'slow':
      if (powerUpActive === 'slow') return; // Evitar stacking
      powerUpActive = 'slow';
      originalPipeSpeed = pipeSpeed;
      pipeSpeed = originalPipeSpeed / 2;
      setTimeout(() => {
        pipeSpeed = originalPipeSpeed;
        powerUpActive = null;
      }, 5000);
      break;      
    case 'gap':
      powerUpActive = 'gap';
      pipeGap += 50;
      setTimeout(() => {
        pipeGap -= 50;
        powerUpActive = null;
      }, 5000);
      break;
  }
}

function setDifficulty(level) {
  switch (level) {
    case 'easy':
      pipeSpeed = 1.5;
      pipeGap = 400;
      pipeSpawnRate = 200;
      powerUpSpawnRate = 80;
      break;
    case 'normal':
      pipeSpeed = 2;
      pipeGap = 250;
      pipeSpawnRate = 175;
      powerUpSpawnRate = 65;
      break;
    case 'hard':
      pipeSpeed = 2.5;
      pipeGap = 150;
      pipeSpawnRate = 150;
      powerUpSpawnRate = 50;
      break;
    case 'impossible':
      pipeSpeed = 3;
      pipeGap = 130;
      pipeSpawnRate = 100;
      powerUpSpawnRate = 30;
      break;
  }
}

function drawPipes() {
  pipes.forEach(pipe => {
    ctx.drawImage(pipeImg, pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(pipeImg, pipe.x, -pipe.top, pipeWidth, pipe.top);
    ctx.restore();
  });
}

function animateScore() {
  scoreDisplay.classList.add('score-pop');
  setTimeout(() => scoreDisplay.classList.remove('score-pop'), 300);
}

function gameOver() {
  canvas.style.transform = 'translateX(-5px)';
  setTimeout(() => {
    canvas.style.transform = '';
  }, 100);
  hitSound.play();
  gameRunning = false;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }

  document.getElementById('finalScore').textContent = `${score} (Record: ${highScore})`;

  const gameOverScreen = document.getElementById('gameOverScreen');
  const gameOverContent = document.querySelector('.gameOverContent');
  gameOverScreen.classList.add('show');
  void gameOverScreen.offsetWidth;
  gameOverScreen.style.opacity = 1;
  gameOverContent.classList.add('show');
}

document.getElementById('restartBtn').addEventListener('click', () => {
  const gameOverScreen = document.getElementById('gameOverScreen');
  gameOverScreen.style.opacity = 0;
  setTimeout(() => {
    document.location.reload();
  }, 500);
});


function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  bird.update();
  bird.draw();
  updatePipes();

  powerUps.forEach((p, i) => {
    p.update();
    p.draw();
  
    if (p.checkCollision(bird)) {
      activatePowerUp(p.type);
    }
  
    if (p.x + p.size < 0 || !p.active) {
      powerUps.splice(i, 1);
    }
  });
  
  particles.forEach((p, i) => {
    p.update();
    p.draw(ctx);
    if (!p.isAlive()) particles.splice(i, 1);
  });

  drawPipes();
  requestAnimationFrame(gameLoop);
}

async function loadLanguage(langCode) {
  try {
    const res = await fetch(`lang/${langCode}.json`);
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

    // Actualiza opciones si quieres traducirlas también:
    const difficultyOptions = document.querySelectorAll('#difficultySelector option');
    difficultyOptions[0].textContent = langData.easy;
    difficultyOptions[1].textContent = langData.normal;
    difficultyOptions[2].textContent = langData.hard;
    difficultyOptions[3].textContent = langData.impossible;

    const bgOptions = document.querySelectorAll('#bgSelector option');
    bgOptions[0].textContent = langData.day;
    bgOptions[1].textContent = langData.night;
    bgOptions[2].textContent = langData.clouds;

  } catch (err) {
    console.error("Error cargando idioma:", err);
  }
}

window.addEventListener('resize', () => {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
});

window.addEventListener('keydown', (e) => {
  if ((e.code === 'Enter' || e.code === 'Space') && gameStarted) {
    e.preventDefault();
    bird.flap();
  }
});

window.addEventListener('touchstart', (e) => {
  if (gameStarted && gameRunning) {
    e.preventDefault();
    bird.flap();
  }
});

// Detectar si es móvil
if (/Mobi|Android/i.test(navigator.userAgent)) {
  document.getElementById('mobileJumpBtn').style.display = 'block';
}

document.getElementById('mobileJumpBtn').addEventListener('click', () => {
  if (gameStarted && gameRunning) bird.flap();
});

bgImg.onload = () => {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
};

// Clase de partículas
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 4 + 2;

    const colorMap = {
      yellow: 'gold',
      red: '#ff4d4d',
      blue: '#4da6ff'
    };
    this.color = colorMap[currentSkinColor] || 'white';

    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 1.5) * 4;
    this.life = 40;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05;
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

// Ventajas
class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.size = 32;
    this.type = type;
    this.img = new Image();
    this.img.src = `assets/${type}.png`;
    this.active = true;
  }

  draw() {
    if (!this.active) return;
    ctx.drawImage(this.img, this.x, this.y, this.size, this.size);
  }

  update() {
    if (!this.active) return;
    this.x -= pipeSpeed;
  }

  checkCollision(bird) {
    if (!this.active) return false;
    const hit =
      bird.x < this.x + this.size &&
      bird.x + bird.width > this.x &&
      bird.y < this.y + this.size &&
      bird.y + bird.height > this.y;
    if (hit) this.active = false;
    return hit;
  }
}

