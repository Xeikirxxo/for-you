const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const text = document.getElementById("text");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

let stars = [];
for (let i = 0; i < 150; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5,
    speed: Math.random() * 0.4 + 0.1,
    alpha: Math.random()
  });
}

let particles = [];
for (let t = 0; t < Math.PI * 2; t += 0.02) {
  let x = 16 * Math.pow(Math.sin(t), 3);
  let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  particles.push({
    bx: x,
    by: y,
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: 0,
    vy: 0
  });
}

let mouse = { x: -9999, y: -9999 };
let isExploded = false;
let yRotationAngle = 0;
let time = 0;

window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("touchmove", e => {
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
});

function update() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  stars.forEach(s => {
    s.y += s.speed;
    if (s.y > canvas.height) {
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
    ctx.fill();
  });

  time += 0.05;
  yRotationAngle += 0.03;
  let pulse = 1 + Math.sin(time * 1.5) * 0.08;

  particles.forEach(p => {
    let s_factor = Math.min(canvas.width, canvas.height) / 42;

    let finalX = canvas.width / 2 + (p.bx * Math.cos(yRotationAngle)) * s_factor * pulse;
    let finalY = canvas.height / 2 - p.by * s_factor * pulse;

    let dx = p.x - mouse.x;
    let dy = p.y - mouse.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 130) {
      let f = (130 - dist) / 130;
      p.vx += dx * f * 0.12;
      p.vy += dy * f * 0.12;
    }

    p.vx += (finalX - p.x) * 0.035;
    p.vy += (finalY - p.y) * 0.035;

    p.vx *= 0.86;
    p.vy *= 0.86;

    p.x += p.vx;
    p.y += p.vy;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ff3b6b";
    ctx.fill();
  });

  requestAnimationFrame(update);
}

update();

window.addEventListener("click", () => {
  if (isExploded) return;
  isExploded = true;

  if (navigator.vibrate) navigator.vibrate(80);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  particles.forEach(p => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 0) {
      p.vx += (dx / d) * 35;
      p.vy += (dy / d) * 35;
    }
  });

  setTimeout(() => {
    text.classList.add('show');
  }, 200);
});