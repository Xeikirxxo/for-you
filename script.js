const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const msg = document.getElementById("message");
const hint = document.getElementById("hint");
const secretEl = document.getElementById("secret");
const ynWrap = document.getElementById("yn-wrap");
const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// --- АНИМИРОВАННЫЙ ЗАГОЛОВОК ВКЛАДКИ ---
const titles = ["For you ❤️", "For you 🤍", "For you 💗", "For you 💓"];
let titleIdx = 0;
setInterval(() => {
  titleIdx = (titleIdx + 1) % titles.length;
  document.title = titles[titleIdx];
}, 600);

// Звёзды
let stars = [];
for (let i = 0; i < 200; i++) {
  stars.push({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.2 + 0.2,
    alpha: Math.random() * 0.7 + 0.2,
    twinkle: Math.random() * Math.PI * 2
  });
}

// Точки сердца
let heartPoints = [];
for (let t = 0; t < Math.PI * 2; t += 0.018) {
  let hx = 16 * Math.pow(Math.sin(t), 3);
  let hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
  heartPoints.push({ bx: hx, by: hy });
}

// Частицы сердца
let particles = heartPoints.map(p => ({
  bx: p.bx, by: p.by,
  x: canvas.width / 2 + (Math.random() - 0.5) * 300,
  y: canvas.height / 2 + (Math.random() - 0.5) * 300,
  vx: 0, vy: 0
}));

// Энергетические частицы
let energyParticles = [];
function spawnEnergy() {
  let angle = Math.random() * Math.PI * 2;
  let dist = Math.random() * Math.max(canvas.width, canvas.height) * 0.5 + 200;
  energyParticles.push({
    x: canvas.width / 2 + Math.cos(angle) * dist,
    y: canvas.height / 2 + Math.sin(angle) * dist,
    size: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 1.5 + 0.8,
    alpha: Math.random() * 0.6 + 0.3
  });
}
setInterval(spawnEnergy, 80);

// --- ПЛАВАЮЩИЕ СЕРДЕЧКИ ---
let floatingHearts = [];
function spawnFloatingHeart() {
  floatingHearts.push({
    x: Math.random() * canvas.width,
    y: canvas.height + 20,
    size: Math.random() * 14 + 7,
    speed: Math.random() * 0.8 + 0.3,
    alpha: Math.random() * 0.5 + 0.2,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: Math.random() * 0.02 + 0.008,
    swayAmp: Math.random() * 30 + 10
  });
}
setInterval(spawnFloatingHeart, 600);

function drawHeart(x, y, size, alpha, color) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color || "#ff2d55";
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.4);
  ctx.bezierCurveTo(x - size, y + size * 0.9, x, y + size * 1.3, x, y + size * 1.6);
  ctx.bezierCurveTo(x, y + size * 1.3, x + size, y + size * 0.9, x + size, y + size * 0.4);
  ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3);
  ctx.fill();
  ctx.restore();
}

// --- СЛЕД КУРСОРА ---
let trail = [];
let mouseX = -999, mouseY = -999;
const trailTypes = ["spark", "heart"];

document.addEventListener("mousemove", function(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  for (let i = 0; i < 2; i++) {
    trail.push({
      x: mouseX + (Math.random() - 0.5) * 8,
      y: mouseY + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -Math.random() * 1.5 - 0.5,
      size: Math.random() * 5 + 2,
      alpha: 0.8 + Math.random() * 0.2,
      type: Math.random() > 0.6 ? "heart" : "spark",
      color: Math.random() > 0.5 ? "#ff2d55" : "#ffcc00",
      gravity: 0.05
    });
  }
});

// --- СЧЁТЧИК КЛИКОВ ---
let clickCount = 0;
const counterEl = document.createElement("div");
counterEl.id = "click-counter";
counterEl.style.cssText = `
  position: fixed; top: 20px; right: 24px;
  color: rgba(255,255,255,0.55);
  font-family: Georgia, serif; font-size: 15px;
  z-index: 20; pointer-events: none;
  transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), color 0.3s;
  text-shadow: 0 0 10px #ff2d55;
`;
document.body.appendChild(counterEl);

const reactions = [
  { at: 1,   text: "1 ❤️" },
  { at: 3,   text: "3 — уже интересно 👀" },
  { at: 5,   text: "5 — тебе нравится? 😏" },
  { at: 10,  text: "10 — ого 🔥" },
  { at: 20,  text: "20 — не останавливайся 💫" },
  { at: 50,  text: "50 — ты влюбилась? 😍" },
  { at: 100, text: "100 ❤️‍🔥 — это уже серьёзно" },
];

let secretShown = false;

function updateCounter() {
  clickCount++;

  // Секретное послание после 100 кликов
  if (clickCount >= 100 && !secretShown) {
    secretShown = true;
    msg.style.opacity = '0';
    setTimeout(() => {
      msg.style.display = 'none';
      secretEl.classList.add('visible');
      ynWrap.classList.add('visible');
    }, 800);
  }

  const reaction = reactions.slice().reverse().find(r => clickCount >= r.at);
  counterEl.textContent = reaction
    ? `${clickCount} кликов · ${reaction.text}`
    : `${clickCount} кликов ❤️`;
  counterEl.style.transform = "scale(1.35)";
  counterEl.style.color = "rgba(255,100,140,0.95)";
  setTimeout(() => {
    counterEl.style.transform = "scale(1)";
    counterEl.style.color = "rgba(255,255,255,0.55)";
  }, 180);
}

// --- СМЕНА ФОНА ---
const bgStages = [
  { at: 0,   r: 0,  g: 0,  b: 0  },
  { at: 10,  r: 30, g: 0,  b: 10 },
  { at: 30,  r: 25, g: 0,  b: 35 },
  { at: 60,  r: 0,  g: 5,  b: 35 },
  { at: 100, r: 40, g: 0,  b: 25 },
];
let currentBg = { r: 0, g: 0, b: 0 };
let targetBg  = { r: 0, g: 0, b: 0 };

function updateBgTarget() {
  const stage = bgStages.slice().reverse().find(s => clickCount >= s.at);
  if (stage) targetBg = { r: stage.r, g: stage.g, b: stage.b };
}

// --- ЭФФЕКТ ПЕЧАТАНИЯ ---
const fullText = "Ты мне очень нравишься, Лера ❤️";
let typedIndex = 0;
let typingStarted = false;

function startTyping() {
  if (typingStarted) return;
  typingStarted = true;
  msg.textContent = "";
  msg.classList.add('visible');
  function typeNext() {
    if (typedIndex < fullText.length) {
      msg.textContent += fullText[typedIndex];
      typedIndex++;
      setTimeout(typeNext, 60 + Math.random() * 40);
    }
  }
  typeNext();
}

function showMessage() {
  if (!typingStarted) {
    hint.style.opacity = '0';
    startTyping();
  }
}

// --- КОНФЕТТИ ---
let confetti = [];
const confettiColors = ["#ff2d55","#ff6b6b","#ffcc00","#a855f7","#38bdf8","#fb923c","#fff"];

function spawnConfetti(cx, cy) {
  for (let i = 0; i < 28; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = Math.random() * 5 + 2;
    confetti.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: Math.random() * 6 + 3,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      alpha: 1,
      gravity: 0.18 + Math.random() * 0.1,
      shape: Math.random() > 0.5 ? "rect" : "circle"
    });
  }
}

let angleY = 0;
let time = 0;
let clickEffects = [];

function addClickEffect(cx, cy) {
  clickEffects.push({ x: cx, y: cy, t: 0, max: 60 });
  particles.forEach(p => {
    let dx = p.x - cx, dy = p.y - cy;
    let dist = Math.sqrt(dx*dx + dy*dy);
    let f = Math.max(0, (220 - dist) / 220);
    p.vx += dx * f * 0.5;
    p.vy += dy * f * 0.5;
  });
}

canvas.addEventListener("click", function(e) {
  addClickEffect(e.clientX, e.clientY);
  spawnConfetti(e.clientX, e.clientY);
  updateCounter();
  updateBgTarget();
  showMessage();
});

canvas.addEventListener("touchstart", function(e) {
  e.preventDefault();
  var touch = e.touches[0];
  addClickEffect(touch.clientX, touch.clientY);
  spawnConfetti(touch.clientX, touch.clientY);
  updateCounter();
  updateBgTarget();
  showMessage();
  if (navigator.vibrate) navigator.vibrate(60);
}, { passive: false });

// --- КНОПКА ДА / НЕТ ---
btnYes.addEventListener("click", function() {
  ynWrap.innerHTML = `<div id="yn-label" style="font-size:clamp(18px,3vw,36px);color:#fff;text-shadow:0 0 20px #ff2d55">
    Я так и знал 💖<br><span style="font-size:0.6em;opacity:0.7">ты лучшая ❤️</span>
  </div>`;
  spawnConfetti(window.innerWidth / 2, window.innerHeight / 2);
  setTimeout(() => spawnConfetti(window.innerWidth / 2, window.innerHeight / 2), 300);
  setTimeout(() => spawnConfetti(window.innerWidth / 2, window.innerHeight / 2), 600);
});

// Кнопка "Нет" убегает
btnNo.addEventListener("mouseover", runAway);
btnNo.addEventListener("touchstart", function(e) {
  e.stopPropagation();
  runAway();
});

function runAway() {
  const margin = 80;
  const x = margin + Math.random() * (window.innerWidth - margin * 2);
  const y = margin + Math.random() * (window.innerHeight - margin * 2);
  btnNo.style.left = x + "px";
  btnNo.style.top  = y + "px";
}

function lerpColor(a, b, t) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function draw() {
  currentBg = lerpColor(currentBg, targetBg, 0.02);
  ctx.fillStyle = `rgba(${currentBg.r},${currentBg.g},${currentBg.b},0.18)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  time += 0.016;

  // Звёзды
  stars.forEach(s => {
    s.twinkle += 0.03;
    let a = s.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
    ctx.beginPath();
    ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255," + a + ")";
    ctx.fill();
  });

  // Плавающие сердечки
  floatingHearts = floatingHearts.filter(h => {
    h.y -= h.speed;
    h.sway += h.swaySpeed;
    let hx = h.x + Math.sin(h.sway) * h.swayAmp;
    if (h.y + h.size * 2 < 0) return false;
    drawHeart(hx, h.y, h.size, h.alpha, "#ff2d55");
    return true;
  });

  // Энергия
  energyParticles = energyParticles.filter(p => {
    let dx = canvas.width / 2 - p.x;
    let dy = canvas.height / 2 - p.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 30) return false;
    let nx = dx / dist, ny = dy / dist;
    p.x += nx * p.speed - ny * 0.4;
    p.y += ny * p.speed + nx * 0.4;
    let fade = Math.min(1, dist / 100);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,80,120," + (p.alpha * fade) + ")";
    ctx.fill();
    return true;
  });

  // Сердце
  angleY += 0.012;
  let pulse = 1 + Math.sin(time * 1.8) * 0.07;
  let scale = Math.min(canvas.width, canvas.height) / 38;

  particles.forEach(p => {
    let rotX = p.bx * Math.cos(angleY);
    let rotZ = p.bx * Math.sin(angleY);
    let tx = canvas.width / 2 + rotX * scale * pulse;
    let ty = canvas.height / 2 + p.by * scale * pulse;
    p.vx += (tx - p.x) * 0.06;
    p.vy += (ty - p.y) * 0.06;
    p.vx *= 0.82; p.vy *= 0.82;
    p.x += p.vx; p.y += p.vy;
    let depth = (rotZ / 16 + 1) / 2;
    let r = Math.round(180 + depth * 75);
    let g = Math.round(20 + depth * 25);
    let b = Math.round(55 + depth * 30);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2 + depth * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fill();
  });

  // Рипл
  clickEffects = clickEffects.filter(ef => {
    ef.t++;
    if (ef.t >= ef.max) return false;
    let progress = ef.t / ef.max;
    ctx.beginPath();
    ctx.arc(ef.x, ef.y, progress * 140, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,45,85," + (1 - progress) * 0.7 + ")";
    ctx.lineWidth = 2;
    ctx.stroke();
    return true;
  });

  // Конфетти
  confetti = confetti.filter(c => {
    c.vy += c.gravity; c.x += c.vx; c.y += c.vy;
    c.rotation += c.rotSpeed; c.alpha -= 0.018;
    if (c.alpha <= 0) return false;
    ctx.save();
    ctx.globalAlpha = c.alpha;
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rotation);
    ctx.fillStyle = c.color;
    if (c.shape === "rect") ctx.fillRect(-c.size/2, -c.size/4, c.size, c.size/2);
    else { ctx.beginPath(); ctx.arc(0, 0, c.size/2, 0, Math.PI*2); ctx.fill(); }
    ctx.restore();
    return true;
  });

  // --- СЛЕД КУРСОРА ---
  trail = trail.filter(p => {
    p.x += p.vx; p.y += p.vy; p.vy += p.gravity;
    p.alpha -= 0.03;
    if (p.alpha <= 0) return false;
    ctx.save();
    ctx.globalAlpha = p.alpha;
    if (p.type === "heart") {
      drawHeart(p.x, p.y, p.size * 0.5, 1, p.color);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    ctx.restore();
    return true;
  });

  requestAnimationFrame(draw);
}

draw();