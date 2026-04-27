const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

const clickCounter = document.getElementById("click-counter");
const progressFill = document.getElementById("progress-fill");
const reactionText = document.getElementById("reaction-text");
const mainMessage = document.getElementById("main-message");
const subMessage = document.getElementById("sub-message");
const hint = document.getElementById("hint");
const secretPanel = document.getElementById("secret-panel");
const questionPanel = document.getElementById("question-panel");
const finalPanel = document.getElementById("final-panel");
const finalTitle = document.getElementById("final-title");
const finalText = document.getElementById("final-text");
const hiddenNoteBtn = document.getElementById("hidden-note");
const restartBtn = document.getElementById("restart-btn");
const buttonRow = document.getElementById("button-row");
const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");
const panelCloseButtons = document.querySelectorAll(".panel-close");

const STORAGE_KEY = "for-you-scene-state";
const SECRET_TARGET = 100;

const titleFrames = ["For you ❤️", "For you 💘", "For you 💖", "For you 💞"];
const stageCopy = [
  {
    at: 0,
    title: "Мне давно хотелось это сказать.",
    body: "Сделай пару кликов по сердцу. Оно не просто крутится, оно собирает смелость.",
    reaction: "Нажми на сердце, сцена начнёт раскрываться."
  },
  {
    at: 1,
    title: "С этого всё и начинается.",
    body: "Каждый клик добавляет свет, глубину и немного честности.",
    reaction: "Первый шаг сделан."
  },
  {
    at: 10,
    title: "Ты умеешь делать обычный момент особенным.",
    body: "Даже этот экран выглядит лучше, когда задерживаешься на нём чуть дольше.",
    reaction: "10 кликов. Уже чувствуется настроение."
  },
  {
    at: 25,
    title: "Мне нравится, как рядом с тобой становится тише внутри.",
    body: "Не скучнее. Именно тише. Будто всё встаёт на место.",
    reaction: "25 кликов. Сцена уже не шутит."
  },
  {
    at: 45,
    title: "Ты не просто нравишься. Ты запоминаешься.",
    body: "Такие люди не проходят фоном. Они остаются в голове и в сердце.",
    reaction: "45 кликов. Сердце светится сильнее."
  },
  {
    at: 70,
    title: "Ещё немного, и это уже не получится скрывать.",
    body: "Иногда самый красивый момент наступает ровно тогда, когда перестаёшь прятать главное.",
    reaction: "70 кликов. Почти финал."
  },
  {
    at: 100,
    title: "Ладно. Теперь честно.",
    body: "Я правда хотел сказать это красиво. И, кажется, почти получилось.",
    reaction: "100 кликов. Вопрос открыт."
  }
];

const counterReactions = [
  { at: 0, text: "0 кликов" },
  { at: 1, text: "1 клик" },
  { at: 2, text: "2 клика" },
  { at: 5, text: "5 кликов" },
  { at: 10, text: "10 кликов" },
  { at: 25, text: "25 кликов" },
  { at: 50, text: "50 кликов" },
  { at: 100, text: "100 кликов" }
];

const state = {
  clicks: 0,
  secretUnlocked: false,
  accepted: false,
  noFloating: false,
  hiddenNoteOpen: false,
  hiddenNoteSeen: false
};

let titleIndex = 0;
let pulseTime = 0;
let heartRotation = 0;
let typedToken = 0;

let stars = [];
let orbiters = [];
let floatingHearts = [];
let sparks = [];
let ripples = [];
let confetti = [];
let cursorTrail = [];
let heartParticles = [];
let heartPath = [];

function createHeartPath() {
  const points = [];
  for (let t = 0; t < Math.PI * 2; t += 0.016) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    points.push({ x, y });
  }
  return points;
}

function resetSceneObjects() {
  stars = Array.from({ length: 220 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.4 + 0.3,
    alpha: Math.random() * 0.6 + 0.2,
    twinkle: Math.random() * Math.PI * 2
  }));

  orbiters = Array.from({ length: 30 }, () => ({
    angle: Math.random() * Math.PI * 2,
    distance: 120 + Math.random() * Math.max(canvas.width, canvas.height) * 0.4,
    speed: 0.002 + Math.random() * 0.004,
    size: 0.7 + Math.random() * 1.8,
    alpha: 0.2 + Math.random() * 0.5,
    drift: (Math.random() - 0.5) * 50
  }));

  floatingHearts = [];
  sparks = [];
  ripples = [];
  confetti = [];
  cursorTrail = [];

  heartParticles = heartPath.map((point) => ({
    baseX: point.x,
    baseY: point.y,
    x: canvas.width * 0.5 + (Math.random() - 0.5) * 260,
    y: canvas.height * 0.5 + (Math.random() - 0.5) * 260,
    vx: 0,
    vy: 0
  }));
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  resetSceneObjects();
  if (state.noFloating) {
    teleportNoButton(true);
  }
}

function drawHeartShape(x, y, size, alpha, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0.3);
  ctx.bezierCurveTo(0, 0, -1, 0, -1, 0.42);
  ctx.bezierCurveTo(-1, 0.95, 0, 1.35, 0, 1.7);
  ctx.bezierCurveTo(0, 1.35, 1, 0.95, 1, 0.42);
  ctx.bezierCurveTo(1, 0, 0, 0, 0, 0.3);
  ctx.fill();
  ctx.restore();
}

function spawnFloatingHeart() {
  floatingHearts.push({
    x: Math.random() * canvas.width,
    y: canvas.height + 30,
    size: 8 + Math.random() * 16,
    speed: 0.3 + Math.random() * 0.7,
    alpha: 0.16 + Math.random() * 0.4,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.006 + Math.random() * 0.012,
    swayAmp: 12 + Math.random() * 34
  });
}

function spawnSparkBurst(x, y, intensity = 1) {
  const count = Math.round(18 * intensity);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 5 * intensity;
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 40 + Math.random() * 20,
      age: 0,
      color: Math.random() > 0.3 ? "#4ac8ff" : "#c9f7ff"
    });
  }
}

function spawnConfetti(x, y, intensity = 1) {
  const count = Math.round(30 * intensity);
  const colors = ["#36a9ff", "#69d8ff", "#a6efff", "#d3fbff", "#ffffff"];
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5 * intensity;
    confetti.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      gravity: 0.11 + Math.random() * 0.08,
      size: 3 + Math.random() * 6,
      alpha: 0.9,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

function spawnRipple(x, y, big = false) {
  ripples.push({
    x,
    y,
    radius: 0,
    max: big ? 220 : 150,
    alpha: big ? 0.85 : 0.62
  });
}

function pointInsideHeart(px, py) {
  const scale = Math.min(canvas.width, canvas.height) / 32;
  const cx = canvas.width * 0.5;
  const cy = canvas.height * 0.5;
  const hx = (px - cx) / scale;
  const hy = -(py - cy) / scale;
  const equation = Math.pow(hx * hx + hy * hy - 1, 3) - (hx * hx * Math.pow(hy, 3));
  return equation <= 0.42;
}

function getCurrentStage() {
  let current = stageCopy[0];
  for (const stage of stageCopy) {
    if (state.clicks >= stage.at) {
      current = stage;
    }
  }
  return current;
}

function setTypeText(element, text) {
  typedToken += 1;
  const token = typedToken;
  element.textContent = "";
  let index = 0;

  function typeNext() {
    if (token !== typedToken) {
      return;
    }
    if (index >= text.length) {
      element.textContent = text;
      return;
    }
    element.textContent += text[index];
    index += 1;
    setTimeout(typeNext, 12 + Math.random() * 26);
  }

  typeNext();
}

function updateTextScene(forceType = false) {
  const stage = getCurrentStage();
  if (forceType) {
    setTypeText(mainMessage, stage.title);
  } else {
    mainMessage.textContent = stage.title;
  }
  subMessage.textContent = stage.body;
  reactionText.textContent = stage.reaction;
}

function updateCounterUi() {
  const label = counterReactions.slice().reverse().find((item) => state.clicks >= item.at) || counterReactions[0];
  clickCounter.textContent = `${label.text} · ${Math.min(state.clicks, SECRET_TARGET)}/${SECRET_TARGET}`;
  progressFill.style.width = `${Math.min(state.clicks / SECRET_TARGET, 1) * 100}%`;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    clicks: state.clicks,
    secretUnlocked: state.secretUnlocked,
    accepted: state.accepted,
    hiddenNoteSeen: state.hiddenNoteSeen
  }));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    state.clicks = Number(parsed.clicks) || 0;
    state.secretUnlocked = Boolean(parsed.secretUnlocked);
    state.accepted = Boolean(parsed.accepted);
    state.hiddenNoteSeen = Boolean(parsed.hiddenNoteSeen);
  } catch (_error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function updateHiddenNoteButton() {
  if (state.hiddenNoteSeen) {
    hiddenNoteBtn.disabled = true;
    hiddenNoteBtn.textContent = "Секрет открыт";
    hiddenNoteBtn.style.opacity = "0.45";
    hiddenNoteBtn.style.cursor = "default";
    return;
  }

  hiddenNoteBtn.disabled = false;
  hiddenNoteBtn.textContent = "Секрет";
  hiddenNoteBtn.style.opacity = "";
  hiddenNoteBtn.style.cursor = "";
}

function revealSecretScene() {
  if (state.secretUnlocked) {
    secretPanel.classList.add("visible");
    questionPanel.classList.add("visible");
    hint.textContent = "Сердце уже всё сказало. Осталось выбрать ответ.";
    return;
  }

  if (state.clicks < SECRET_TARGET) {
    return;
  }

  state.secretUnlocked = true;
  secretPanel.classList.add("visible");
  questionPanel.classList.add("visible");
  hint.textContent = "Сердце уже всё сказало. Осталось выбрать ответ.";
  spawnConfetti(canvas.width * 0.5, canvas.height * 0.45, 1.6);
  spawnRipple(canvas.width * 0.5, canvas.height * 0.5, true);
  saveState();
}

function showHiddenNote() {
  if (state.hiddenNoteSeen) {
    return false;
  }

  secretPanel.classList.add("visible");
  hint.style.opacity = "0";
  state.hiddenNoteOpen = true;
  state.hiddenNoteSeen = true;
  updateHiddenNoteButton();
  saveState();
  if (state.secretUnlocked && !state.accepted) {
    questionPanel.classList.add("visible");
  }
  return true;
}

function maybeUnlockByClicks() {
  if (state.clicks >= SECRET_TARGET) {
    revealSecretScene();
  }
}

function pushHeartParticles(x, y) {
  for (const particle of heartParticles) {
    const dx = particle.x - x;
    const dy = particle.y - y;
    const distance = Math.hypot(dx, dy);
    const force = Math.max(0, (220 - distance) / 220);
    particle.vx += dx * force * 0.03;
    particle.vy += dy * force * 0.03;
  }
}

function registerHeartClick(x, y) {
  state.clicks += 1;
  updateCounterUi();
  updateTextScene(true);
  maybeUnlockByClicks();
  saveState();
  spawnSparkBurst(x, y, 1);
  spawnConfetti(x, y, 0.8);
  spawnRipple(x, y);
  pushHeartParticles(x, y);
}

function handleCanvasClick(x, y, detail = 1) {
  if (state.accepted) {
    spawnConfetti(x, y, 0.4);
    spawnRipple(x, y);
    return;
  }

  if (!pointInsideHeart(x, y)) {
    spawnRipple(x, y);
    return;
  }

  registerHeartClick(x, y);
  if (detail >= 2) {
    if (showHiddenNote()) {
      spawnConfetti(x, y, 1.3);
    }
  }
}

function showFinalScene() {
  state.accepted = true;
  document.body.classList.add("final-state");
  questionPanel.classList.remove("visible");
  btnNo.remove();
  finalTitle.textContent = "Я так и знал.";
  finalText.textContent = "Ты сделала этот экран ещё теплее. Это был лучший клик во всей сцене.";
  finalPanel.classList.add("visible");
  hint.textContent = "Финал открыт. Можно перезапустить сцену и пройти её заново.";
  spawnConfetti(canvas.width * 0.5, canvas.height * 0.46, 2.8);
  spawnSparkBurst(canvas.width * 0.5, canvas.height * 0.45, 2);
  spawnRipple(canvas.width * 0.5, canvas.height * 0.48, true);
  saveState();
}

function teleportNoButton(force = false) {
  if (!state.secretUnlocked || state.accepted) {
    return;
  }

  const rect = btnNo.getBoundingClientRect();
  const yesRect = btnYes.getBoundingClientRect();
  const margin = 24;

  if (!state.noFloating) {
    state.noFloating = true;
    document.body.appendChild(btnNo);
    btnNo.classList.add("no-floating");
    btnNo.style.width = `${Math.max(rect.width, 130)}px`;
    buttonRow.style.minHeight = `${Math.max(rect.height, yesRect.height, 48)}px`;
  }

  const maxX = window.innerWidth - rect.width - margin;
  const maxY = window.innerHeight - rect.height - margin;

  let x = margin;
  let y = margin;
  let tries = 0;

  while (tries < 40) {
    tries += 1;
    x = margin + Math.random() * Math.max(1, maxX - margin);
    y = margin + Math.random() * Math.max(1, maxY - margin);

    const overlapYes =
      x < yesRect.right + 80 &&
      x + rect.width > yesRect.left - 80 &&
      y < yesRect.bottom + 80 &&
      y + rect.height > yesRect.top - 80;

    const overlapHud =
      x + rect.width > window.innerWidth - 360 &&
      y < 230;

    if (!overlapYes && !overlapHud) {
      break;
    }
  }

  if (!force) {
    spawnSparkBurst(x + rect.width * 0.5, y + rect.height * 0.5, 0.8);
  }

  btnNo.style.left = `${x}px`;
  btnNo.style.top = `${y}px`;
}

function resetExperience() {
  state.clicks = 0;
  state.secretUnlocked = false;
  state.accepted = false;
  state.noFloating = false;
  state.hiddenNoteOpen = false;
  state.hiddenNoteSeen = false;

  localStorage.removeItem(STORAGE_KEY);

  document.body.classList.remove("final-state");
  finalPanel.classList.remove("visible");
  questionPanel.classList.remove("visible");
  secretPanel.classList.remove("visible");

  if (!btnNo.isConnected) {
    buttonRow.appendChild(btnNo);
  }

  btnNo.className = "secondary-btn";
  btnNo.style.left = "";
  btnNo.style.top = "";
  btnNo.style.width = "";

  if (!buttonRow.contains(btnYes)) {
    buttonRow.prepend(btnYes);
  }

  if (!buttonRow.contains(btnNo)) {
    buttonRow.appendChild(btnNo);
  }

  buttonRow.style.minHeight = "";

  updateCounterUi();
  updateTextScene(false);
  updateHiddenNoteButton();
  hint.textContent = "Двойной клик по сердцу откроет маленький секрет.";
  resetSceneObjects();
}

function drawBackground() {
  const gradient = ctx.createRadialGradient(
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.height * 0.05,
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.height * 0.65
  );

  gradient.addColorStop(0, state.accepted ? "rgba(118, 232, 255, 0.16)" : "rgba(74, 194, 255, 0.08)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStars() {
  for (const star of stars) {
    star.twinkle += 0.025;
    const alpha = star.alpha * (0.72 + Math.sin(star.twinkle) * 0.28);
    ctx.beginPath();
    ctx.arc(star.x * canvas.width, star.y * canvas.height, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(234, 248, 255, ${alpha})`;
    ctx.fill();
  }
}

function drawOrbiters() {
  const cx = canvas.width * 0.5;
  const cy = canvas.height * 0.5;

  for (const orbiter of orbiters) {
    orbiter.angle += orbiter.speed;
    const x = cx + Math.cos(orbiter.angle) * orbiter.distance;
    const y = cy + Math.sin(orbiter.angle * 1.6) * (orbiter.distance * 0.38) + orbiter.drift;
    ctx.beginPath();
    ctx.arc(x, y, orbiter.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(87, 214, 255, ${orbiter.alpha})`;
    ctx.fill();
  }
}

function drawFloatingHearts() {
  if (Math.random() > 0.92) {
    spawnFloatingHeart();
  }

  floatingHearts = floatingHearts.filter((heart) => {
    heart.y -= heart.speed;
    heart.sway += heart.swaySpeed;
    const x = heart.x + Math.sin(heart.sway) * heart.swayAmp;
    drawHeartShape(x, heart.y, heart.size, heart.alpha, "#52cfff");
    return heart.y > -60;
  });
}

function drawHeartParticles() {
  const cx = canvas.width * 0.5;
  const cy = canvas.height * 0.5;
  const scale = Math.min(canvas.width, canvas.height) / 36;
  const pulse = 1 + Math.sin(pulseTime * 1.9) * 0.055;

  heartRotation += 0.01;
  pulseTime += 0.016;

  const glow = ctx.createRadialGradient(cx, cy, scale * 2, cx, cy, scale * 18);
  glow.addColorStop(0, state.accepted ? "rgba(186, 245, 255, 0.24)" : "rgba(91, 206, 255, 0.18)");
  glow.addColorStop(1, "rgba(91, 206, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(cx - scale * 22, cy - scale * 20, scale * 44, scale * 40);

  for (const particle of heartParticles) {
    const rotX = particle.baseX * Math.cos(heartRotation);
    const rotZ = particle.baseX * Math.sin(heartRotation);
    const targetX = cx + rotX * scale * pulse;
    const targetY = cy + particle.baseY * scale * pulse;

    particle.vx += (targetX - particle.x) * 0.06;
    particle.vy += (targetY - particle.y) * 0.06;
    particle.vx *= 0.84;
    particle.vy *= 0.84;
    particle.x += particle.vx;
    particle.y += particle.vy;

    const depth = (rotZ / 16 + 1) * 0.5;
    const radius = 1.7 + depth * 1.8;
    const hue = state.accepted
      ? `rgba(${192 + depth * 30}, ${235 + depth * 18}, 255, 0.96)`
      : `rgba(${80 + depth * 30}, ${195 + depth * 40}, 255, 0.94)`;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = hue;
    ctx.shadowBlur = 18;
    ctx.shadowColor = state.accepted ? "rgba(186, 245, 255, 0.62)" : "rgba(78, 205, 255, 0.62)";
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawRipples() {
  ripples = ripples.filter((ripple) => {
    ripple.radius += 3.8;
    ripple.alpha *= 0.96;
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(165, 234, 255, ${ripple.alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    return ripple.radius < ripple.max && ripple.alpha > 0.02;
  });
}

function drawSparks() {
  sparks = sparks.filter((spark) => {
    spark.age += 1;
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vx *= 0.98;
    spark.vy *= 0.98;
    const alpha = 1 - spark.age / spark.life;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = spark.color.replace(")", `, ${Math.max(alpha, 0)})`).replace("rgb", "rgba");
    ctx.fillStyle = spark.color.startsWith("#") ? spark.color : spark.fillStyle;
    ctx.globalAlpha = Math.max(alpha, 0);
    ctx.fillStyle = spark.color;
    ctx.fill();
    ctx.globalAlpha = 1;
    return spark.age < spark.life;
  });
}

function drawConfetti() {
  confetti = confetti.filter((piece) => {
    piece.vy += piece.gravity;
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.rotation += piece.rotationSpeed;
    piece.alpha -= 0.012;

    ctx.save();
    ctx.globalAlpha = Math.max(piece.alpha, 0);
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size * 0.5, -piece.size * 0.18, piece.size, piece.size * 0.36);
    ctx.restore();

    return piece.alpha > 0 && piece.y < canvas.height + 80;
  });
}

function drawCursorTrail() {
  cursorTrail = cursorTrail.filter((item) => {
    item.life -= 1;
    item.x += item.vx;
    item.y += item.vy;
    item.vy += 0.01;
    const alpha = item.life / item.maxLife;
    if (item.type === "heart") {
      drawHeartShape(item.x, item.y, item.size, alpha * 0.9, "#72ddff");
    } else {
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.size * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(213, 247, 255, ${alpha})`;
      ctx.fill();
    }
    return item.life > 0;
  });
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawStars();
  drawOrbiters();
  drawFloatingHearts();
  drawHeartParticles();
  drawRipples();
  drawSparks();
  drawConfetti();
  drawCursorTrail();
  requestAnimationFrame(loop);
}

canvas.addEventListener("click", (event) => {
  handleCanvasClick(event.clientX, event.clientY, event.detail);
});

canvas.addEventListener("dblclick", (event) => {
  event.preventDefault();
  if (pointInsideHeart(event.clientX, event.clientY)) {
    if (showHiddenNote()) {
      spawnConfetti(event.clientX, event.clientY, 1.4);
    }
  }
});

document.addEventListener("mousemove", (event) => {
  if (cursorTrail.length > 40) {
    cursorTrail.shift();
  }
  cursorTrail.push({
    x: event.clientX + (Math.random() - 0.5) * 6,
    y: event.clientY + (Math.random() - 0.5) * 6,
    vx: (Math.random() - 0.5) * 0.7,
    vy: -Math.random() * 0.8,
    size: 4 + Math.random() * 3,
    type: Math.random() > 0.45 ? "spark" : "heart",
    life: 24 + Math.random() * 10,
    maxLife: 32
  });
});

hiddenNoteBtn.addEventListener("click", () => {
  if (showHiddenNote()) {
    spawnRipple(canvas.width * 0.5, canvas.height * 0.34);
  }
});

panelCloseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const panelId = button.dataset.closePanel;
    const panel = document.getElementById(panelId);
    if (!panel) {
      return;
    }

    panel.classList.remove("visible");

    if (panelId === "secret-panel") {
      state.hiddenNoteOpen = false;
    }
  });
});

btnYes.addEventListener("click", () => {
  showFinalScene();
});

btnNo.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  teleportNoButton();
});

restartBtn.addEventListener("click", () => {
  resetExperience();
});

window.addEventListener("resize", resize);

setInterval(() => {
  titleIndex = (titleIndex + 1) % titleFrames.length;
  document.title = titleFrames[titleIndex];
}, 900);

loadState();
heartPath = createHeartPath();
resize();
updateCounterUi();
updateTextScene(false);
updateHiddenNoteButton();

if (state.secretUnlocked) {
  secretPanel.classList.add("visible");
  questionPanel.classList.add("visible");
  hint.textContent = "Сердце уже всё сказало. Осталось выбрать ответ.";
}

if (state.accepted) {
  showFinalScene();
}

loop();
