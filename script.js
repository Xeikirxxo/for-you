const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const msg = document.getElementById("message");
const hint = document.getElementById("hint");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Звёзды
let stars = [];
for (let i = 0; i < 200; i++) {
  stars.push({
    x: Math.random(),
    y: Math.random(),
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
  bx: p.bx,
  by: p.by,
  x: canvas.width / 2 + (Math.random() - 0.5) * 300,
  y: canvas.height / 2 + (Math.random() - 0.5) * 300,
  vx: 0,
  vy: 0
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

// --- СЧЁТЧИК КЛИКОВ ---
let clickCount = 0;
const counterEl = document.createElement("div");
counterEl.id = "click-counter";
counterEl.style.cssText = `
  position: fixed;
  top: 20px;
  right: 24px;
  color: rgba(255,255,255,0.55);
  font-family: Georgia, serif;
  font-size: 15px;
  z-index: 20;
  pointer-events: none;
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

function updateCounter() {
  clickCount++;
  const reaction = reactions.slice().reverse().find(r => clickCount >= r.at);
  counterEl.textContent = reaction
    ? `${clickCount} кликов · ${reaction.text}`
    : `${clickCount} кликов ❤️`;

  // Пульс на счётчике
  counterEl.style.transform = "scale(1.35)";
  counterEl.style.color = "rgba(255,100,140,0.95)";
  setTimeout(() => {
    counterEl.style.transform = "scale(1)";
    counterEl.style.color = "rgba(255,255,255,0.55)";
  }, 180);
}

// --- КОНФЕТТИ ---
let confetti = [];
const confettiColors = ["#ff2d55","#ff6b6b","#ffcc00","#a855f7","#38bdf8","#fb923c","#fff"];

function spawnConfetti(cx, cy) {
  for (let i = 0; i < 28; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = Math.random() * 5 + 2;
    confetti.push({
      x: cx,
      y: cy,
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
let messageShown = false;
let clickEffects = [];

function addClickEffect(cx, cy) {
  clickEffects.push({ x: cx, y: cy, t: 0, max: 60 });
  particles.forEach(p => {
    let dx = p.x - cx;
    let dy = p.y - cy;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let f = Math.max(0, (220 - dist) / 220);
    p.vx += dx * f * 0.5;
    p.vy += dy * f * 0.5;
  });
}

function showMessage() {
  if (!messageShown) {
    messageShown = true;
    hint.style.opacity = '0';
    msg.classList.add('visible');
  }
}

canvas.addEventListener("click", function(e) {
  addClickEffect(e.clientX, e.clientY);
  spawnConfetti(e.clientX, e.clientY);
  updateCounter();
  showMessage();
});

canvas.addEventListener("touchstart", function(e) {
  e.preventDefault();
  var touch = e.touches[0];
  addClickEffect(touch.clientX, touch.clientY);
  spawnConfetti(touch.clientX, touch.clientY);
  updateCounter();
  showMessage();
  if (navigator.vibrate) navigator.vibrate(60);
}, { passive: false });

function draw() {
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  time += 0.016;

  // Звёзды
  stars.forEach(function(s) {
    s.twinkle += 0.03;
    var a = s.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
    ctx.beginPath();
    ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255," + a + ")";
    ctx.fill();
  });

  // Энергия
  var newEnergy = [];
  for (var i = 0; i < energyParticles.length; i++) {
    var p = energyParticles[i];
    var dx = canvas.width / 2 - p.x;
    var dy = canvas.height / 2 - p.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 30) continue;
    var nx = dx / dist;
    var ny = dy / dist;
    var perpX = -ny * 0.4;
    var perpY = nx * 0.4;
    p.x += nx * p.speed + perpX;
    p.y += ny * p.speed + perpY;
    var fade = Math.min(1, dist / 100);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,80,120," + (p.alpha * fade) + ")";
    ctx.fill();
    newEnergy.push(p);
  }
  energyParticles = newEnergy;

  // Сердце
  angleY += 0.012;
  var pulse = 1 + Math.sin(time * 1.8) * 0.07;
  var scale = Math.min(canvas.width, canvas.height) / 38;

  particles.forEach(function(p) {
    var rotX = p.bx * Math.cos(angleY);
    var rotZ = p.bx * Math.sin(angleY);
    var tx = canvas.width / 2 + rotX * scale * pulse;
    var ty = canvas.height / 2 + p.by * scale * pulse;
    p.vx += (tx - p.x) * 0.06;
    p.vy += (ty - p.y) * 0.06;
    p.vx *= 0.82;
    p.vy *= 0.82;
    p.x += p.vx;
    p.y += p.vy;
    var depth = (rotZ / 16 + 1) / 2;
    var r = Math.round(180 + depth * 75);
    var g = Math.round(20 + depth * 25);
    var b = Math.round(55 + depth * 30);
    var size = 2 + depth * 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    ctx.fill();
  });

  // Рипл
  var newEffects = [];
  for (var j = 0; j < clickEffects.length; j++) {
    var ef = clickEffects[j];
    ef.t++;
    if (ef.t >= ef.max) continue;
    var progress = ef.t / ef.max;
    var radius = progress * 140;
    var alpha = (1 - progress) * 0.7;
    ctx.beginPath();
    ctx.arc(ef.x, ef.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,45,85," + alpha + ")";
    ctx.lineWidth = 2;
    ctx.stroke();
    newEffects.push(ef);
  }
  clickEffects = newEffects;

  // --- КОНФЕТТИ ---
  var newConfetti = [];
  for (var k = 0; k < confetti.length; k++) {
    var c = confetti[k];
    c.vy += c.gravity;
    c.x += c.vx;
    c.y += c.vy;
    c.rotation += c.rotSpeed;
    c.alpha -= 0.018;
    if (c.alpha <= 0) continue;

    ctx.save();
    ctx.globalAlpha = c.alpha;
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rotation);
    ctx.fillStyle = c.color;

    if (c.shape === "rect") {
      ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    newConfetti.push(c);
  }
  confetti = newConfetti;

  requestAnimationFrame(draw);
}

draw();