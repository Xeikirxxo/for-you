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
for (let i = 0; i < 120; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5,
    speed: Math.random() * 0.5 + 0.2
  });
}

let particles = [];

for (let t = 0; t < Math.PI * 2; t += 0.03) {
  let x = 16 * Math.pow(Math.sin(t), 3);
  let y = 13 * Math.cos(t)
        - 5 * Math.cos(2 * t)
        - 2 * Math.cos(3 * t)
        - Math.cos(4 * t);

  particles.push({
    bx: x,
    by: y,
    x: 0,
    y: 0,
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

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let baseScale = Math.min(canvas.width, canvas.height) / 40;

  stars.forEach(s => {
    s.y += s.speed;
    if (s.y > canvas.height) {
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  });

  time += 0.05;

  let pulse = 1 + Math.sin(time * 2) * 0.1;

  particles.forEach(p => {

    let scale = Math.min(canvas.width, canvas.height) / 40;

    let targetX = canvas.width/2 + p.bx * scale * pulse - scale * 2;
    let targetY = canvas.height/2 - p.by * scale * pulse;

    let dx = p.x - mouse.x;
    let dy = p.y - mouse.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    if (dist < 80) {
      let force = (80 - dist) / 80;
      p.vx += dx * force * 0.2;
      p.vy += dy * force * 0.2;
    }

    p.vx += (targetX - p.x) * 0.02;
    p.vy += (targetY - p.y) * 0.02;

    p.vx *= 0.9;
    p.vy *= 0.9;

    p.x += p.vx;
    p.y += p.vy;

    ctx.fillStyle = "#ff2e63";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff2e63";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("I love you, Лерка", p.x, p.y);
  });

  requestAnimationFrame(update);
}

update();

window.addEventListener("click", () => {

  if (navigator.vibrate) navigator.vibrate(100);

  particles.forEach(p => {
    p.vx += (Math.random() - 0.5) * 25;
    p.vy += (Math.random() - 0.5) * 25;
  });

  setTimeout(() => {
    text.innerText = "Ты мне очень нравишься";

    text.style.opacity = 1;
    text.style.transform = "translate(-50%, -50%) scale(1)";
  }, 400);
});