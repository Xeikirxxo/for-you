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
  let x = 16 * Math.pow(Math.sin(t), 3);
  let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
  heartPoints.push({ bx: x, by: y });
}

// Частицы
let particles = heartPoints.map(p => ({
  bx: p.bx,
  by: p.by,
  x: canvas.width / 2 + (Math.random() - 0.5) * 300,
  y: canvas.height / 2 + (Math.random() - 0.5) * 300,
  vx: 0,
  vy: 0
}));

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
    let f = Math.max(0, (200 - dist) / 200);
    p.vx += dx * f * 0.4;
    p.vy += dy * f * 0.4;
  });
}

function showMessage() {
  if (!messageShown) {
    messageShown = true;
    hint.style.opacity = '0';
    setTimeout(() => {
      msg.classList.add('visible');
    }, 100);
  }
}

canvas.addEventListener("click", e => {
  addClickEffect(e.clientX, e.clientY);
  showMessage();
});

canvas.addEventListener("touchstart", e => {
  let t = e.touches[0];
  addClickEffect(t.clientX, t.clientY);
  showMessage();
  if (navigator.vibrate) navigator.vibrate(60);
  e.preventDefault();
}, { passive: false });

function draw() {
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Мерцание звёзд
  time += 0.016;
  stars.forEach(s => {
    s.twinkle += 0.03;
    let a = s.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
    ctx.beginPath();
    ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fill();
  });

  // Вращение вокруг вертикальной оси
  angleY += 0.025;
  let pulse = 1 + Math.sin(time * 1.8) * 0.07;
  let scale = Math.min(canvas.width, canvas.height) / 38;

  particles.forEach(p => {
    let rotX = p.bx * Math.cos(angleY);
    let rotZ = p.bx * Math.sin(angleY); // глубина

    let tx = canvas.width / 2 + rotX * scale * pulse;
    let ty = canvas.height / 2 + p.by * scale * pulse;

    p.vx += (tx - p.x) * 0.06;
    p.vy += (ty - p.y) * 0.06;
    p.vx *= 0.82;
    p.vy *= 0.82;
    p.x += p.vx;
    p.y += p.vy;

    // Тень глубины: спереди ярче, сзади темнее
    let depth = (rotZ / 16 + 1) / 2;
    let r = Math.round(180 + depth * 75);
    let g = Math.round(20 + depth * 25);
    let b = Math.round(55 + depth * 30);
    let size = 2 + depth * 1.5;

    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fill();
  });

  // Рипл от нажатий
  clickEffects = clickEffects.filter(e => e.t < e.max);
  clickEffects.forEach(e => {
    e.t++;
    let progress = e.t / e.max;
    let r = progress * 120;
    let alpha = (1 - progress) * 0.6;
    ctx.beginPath();
    ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 45, 85, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  requestAnimationFrame(draw);
}

draw();