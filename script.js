const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const textElement = document.getElementById("text");

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
let angleY = 0;
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
  angleY += 0.03;
  let pulse = 1 + Math.sin(time * 1.5) * 0.1;

  particles.forEach(p => {
    let s_factor = Math.min(canvas.width, canvas.height) / 40;

    let rotatedX = p.bx * Math.cos(angleY);
    
    let targetX = canvas.width / 2 + rotatedX * s_factor * pulse;
    let targetY = canvas.height / 2 - p.by * s_factor * pulse;

    let dx = p.x - mouse.x;
    let dy = p.y - mouse.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 150) {
      let f = (150 - dist) / 150;
      p.vx += dx * f * 0.15;
      p.vy += dy * f * 0.15;
    }

    p.vx += (targetX - p.x) * 0.04;
    p.vy += (targetY - p.y) * 0.04;

    p.vx *= 0.85;
    p.vy *= 0.85;

    p.x += p.vx;
    p.y += p.vy;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ff2d55";
    ctx.fill();
  });

  requestAnimationFrame(update);
}

update();

window.addEventListener("click", () => {
  if (isExploded) return;
  isExploded = true;

  if (navigator.vibrate) navigator.vibrate(80);

  particles.forEach(p => {
    p.vx += (Math.random() - 0.5) * 60;
    p.vy += (Math.random() - 0.5) * 60;
  });

  setTimeout(() => {
    textElement.style.opacity = "1";
    textElement.style.transform = "translate(-50%, -50%) scale(1)";
  }, 200);
});