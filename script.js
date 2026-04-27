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
    r: Math.random() * 1.2,
    speed: Math.random() * 0.3 + 0.1,
    alpha: Math.random()
  });
}

let particles = [];
for (let t = 0; t < Math.PI * 2; t += 0.04) {
  let x = 16 * Math.pow(Math.sin(t), 3);
  let y = 13 * Math.cos(t) 
        - 5 * Math.cos(2 * t) 
        - 2 * Math.cos(3 * t) 
        - Math.cos(4 * t);

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

window.addEventListener("touchmove", e => {
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
});

window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

let time = 0;
let isExploded = false;
let heartRotationAngle = 0;

function update() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
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
  let pulse = 1 + Math.sin(time * 2) * 0.05;
  heartRotationAngle += 0.003;

  particles.forEach(p => {
    let s_factor = Math.min(canvas.width, canvas.height) / 45;

    let rx = p.bx * Math.cos(heartRotationAngle) - p.by * Math.sin(heartRotationAngle);
    let ry = p.bx * Math.sin(heartRotationAngle) + p.by * Math.cos(heartRotationAngle);

    let finalX = canvas.width / 2 + rx * s_factor * pulse;
    let finalY = canvas.height / 2 - ry * s_factor * pulse;

    let dx = p.x - mouse.x;
    let dy = p.y - mouse.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 100) {
      let f = (100 - dist) / 100;
      p.vx += dx * f * 0.05;
      p.vy += dy * f * 0.05;
    }

    p.vx += (finalX - p.x) * 0.03;
    p.vy += (finalY - p.y) * 0.03;

    p.vx *= 0.88;
    p.vy *= 0.88;

    p.x += p.vx;
    p.y += p.vy;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ff4d6d";
    ctx.fill();
  });

  requestAnimationFrame(update);
}

update();

window.addEventListener("click", () => {
  if (isExploded) return;
  isExploded = true;

  if (navigator.vibrate) navigator.vibrate(100);

  particles.forEach(p => {
    p.vx += (Math.random() - 0.5) * 40;
    p.vy += (Math.random() - 0.5) * 40;
  });

  setTimeout(() => {
    text.innerText = "Ты мне очень нравишься, Лерка ❤️";
    text.style.opacity = 1;
    text.style.transform = "translate(-50%, -50%) scale(1)";
  }, 400);
});