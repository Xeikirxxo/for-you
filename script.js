var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");
var msg = document.getElementById("message");
var hint = document.getElementById("hint");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener("resize", function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

var stars = [];
for (var i = 0; i < 200; i++) {
  stars.push({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.2 + 0.2,
    alpha: Math.random() * 0.7 + 0.2,
    twinkle: Math.random() * Math.PI * 2
  });
}

var heartPoints = [];
for (var t = 0; t < Math.PI * 2; t += 0.018) {
  var hx = 16 * Math.pow(Math.sin(t), 3);
  var hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
  heartPoints.push({ bx: hx, by: hy });
}

var particles = [];
for (var i = 0; i < heartPoints.length; i++) {
  particles.push({
    bx: heartPoints[i].bx,
    by: heartPoints[i].by,
    x: canvas.width / 2 + (Math.random() - 0.5) * 300,
    y: canvas.height / 2 + (Math.random() - 0.5) * 300,
    vx: 0, vy: 0
  });
}

var energyParticles = [];
function spawnEnergy() {
  var angle = Math.random() * Math.PI * 2;
  var dist = Math.random() * Math.max(canvas.width, canvas.height) * 0.5 + 200;
  energyParticles.push({
    x: canvas.width / 2 + Math.cos(angle) * dist,
    y: canvas.height / 2 + Math.sin(angle) * dist,
    size: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 1.5 + 0.8,
    alpha: Math.random() * 0.6 + 0.3
  });
}
setInterval(spawnEnergy, 80);

var angleY = 0;
var time = 0;
var messageShown = false;
var clickEffects = [];

function addClickEffect(cx, cy) {
  clickEffects.push({ x: cx, y: cy, t: 0, max: 60 });
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    var dx = p.x - cx;
    var dy = p.y - cy;
    var d = Math.sqrt(dx*dx + dy*dy);
    var f = Math.max(0, (220 - d) / 220);
    p.vx += dx * f * 0.5;
    p.vy += dy * f * 0.5;
  }
}

function showMessage() {
  if (!messageShown) {
    messageShown = true;
    hint.style.opacity = "0";
    msg.classList.add("visible");
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

  for (var i = 0; i < stars.length; i++) {
    var s = stars[i];
    s.twinkle += 0.03;
    var a = s.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
    ctx.beginPath();
    ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255," + a + ")";
    ctx.fill();
  }

  var newEnergy = [];
  for (var i = 0; i < energyParticles.length; i++) {
    var p = energyParticles[i];
    var dx = canvas.width / 2 - p.x;
    var dy = canvas.height / 2 - p.y;
    var dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 35) continue;
    var nx = dx / dist;
    var ny = dy / dist;
    p.x += nx * p.speed + (-ny * 0.35);
    p.y += ny * p.speed + (nx * 0.35);
    var fade = Math.min(1, dist / 100);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,80,120," + (p.alpha * fade) + ")";
    ctx.fill();
    newEnergy.push(p);
  }
  energyParticles = newEnergy;

  angleY += 0.012;
  var pulse = 1 + Math.sin(time * 1.8) * 0.07;
  var scale = Math.min(canvas.width, canvas.height) / 38;

  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
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
    var sz = 2 + depth * 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
    ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    ctx.fill();
  }

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