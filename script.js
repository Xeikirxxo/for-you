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

// Энергетические частицы летящие к сердцу
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

let angleY = 0;
let time = 0;
let messageShown = false;
let clickEffects = [];

// Взрыв — работает при каждом нажатии
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

// Текст — появляется один раз при первом нажатии
function showMessage() {
  if (!messageShown) {
    messageShown = true;
    hint.style.opacity = '0';
    msg.classList.add('visible');
  }
}

canvas.addEventListener("click", function(e) {
  addClickEffect(e.clientX, e.clientY);
  showMessage();
});

canvas.addEventListener("touchstart", function(e) {
  e.preventDefault();
  var touch = e.touches[0];
  addClickEffect(touch.clientX, touch.clientY);
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

  // Энергия летит к сердцу
  var newEnergy = [];
  for (var i = 0; i < energyParticles.length; i++) {
    var p = energyParticles[i];
    var dx = canvas.width / 2 - p.x;
    var dy = canvas.height / 2 - p.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 30) continue; // поглощена сердцем

    // Спираль к центру
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

  // Сердце вращается медленно вокруг вертикальной оси
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

  // Рипл при нажатиях
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

  requestAnimationFrame(draw);
}

draw();