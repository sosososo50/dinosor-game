// game.js (FULL) — Click/Touch بأي مكان بالصفحة يعمل Jump أو Restart
// Dark mode: background black, dino + traps + game over text white

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");

const GROUND_Y = 200;

let speed, gravity, score, alive, lastTime, spawnTimer;

const dino = { x: 70, y: GROUND_Y, w: 42, h: 30, vy: 0, jumping: false };
let cacti = [];

function reset() {
  speed = 360;
  gravity = 1600;
  score = 0;
  alive = true;
  lastTime = performance.now();
  spawnTimer = 0;

  dino.y = GROUND_Y;
  dino.vy = 0;
  dino.jumping = false;

  cacti = [];
  scoreEl.textContent = "0";
}

function jumpOrRestart() {
  if (!alive) {
    reset();
    return;
  }
  if (!dino.jumping) {
    dino.vy = -620;
    dino.jumping = true;
  }
}

function spawnCactus() {
  const h = 25 + Math.random() * 35;
  const w = 14 + Math.random() * 12;
  cacti.push({ x: canvas.width + 20, y: GROUND_Y + (dino.h - h), w, h });
}

function rectHit(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function drawDino(x, y) {
  const s = 3;
  const px = [
    [8,0],[9,0],[10,0],
    [7,1],[8,1],[9,1],[10,1],[11,1],
    [7,2],[8,2],[9,2],[10,2],[11,2],
    [6,3],[7,3],[8,3],[9,3],[10,3],
    [5,4],[6,4],[7,4],[8,4],[9,4],[10,4],
    [4,5],[5,5],[6,5],[7,5],[8,5],[9,5],
    [4,6],[5,6],[6,6],[7,6],[8,6],
    [6,5],[6,6],
    [5,7],[7,7],
    [5,8],[7,8],
    [4,9],[5,9],[7,9],[8,9],
    [3,6],[2,6],[1,6],
    [2,7],[1,7]
  ];

  // ✅ الدينو أبيض
  ctx.fillStyle = "#fff";
  for (const [cx, cy] of px) ctx.fillRect(x + cx * s, y + cy * s, s, s);

  // ✅ العين سوداء (حتى تبين على الأبيض)
  ctx.fillStyle = "#000";
  ctx.fillRect(x + 10 * s, y + 1 * s, s, s);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ✅ أرض بيضاء
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + dino.h);
  ctx.lineTo(canvas.width, GROUND_Y + dino.h);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();

  // دينو
  drawDino(dino.x, dino.y);

  // ✅ الصبارات/الأفخاخ بيضاء
  ctx.fillStyle = "#fff";
  for (const c of cacti) ctx.fillRect(c.x, c.y, c.w, c.h);

  // ✅ Game Over أبيض بالنص
  if (!alive) {
    ctx.fillStyle = "#fff";
    ctx.font = "28px system-ui";
    ctx.fillText("Game over , press anywhere to retry", canvas.width / 2 - 210, 120);
  }
}

function update(dt) {
  if (!alive) return;

  dino.vy += gravity * dt;
  dino.y += dino.vy * dt;

  if (dino.y >= GROUND_Y) {
    dino.y = GROUND_Y;
    dino.vy = 0;
    dino.jumping = false;
  }

  for (const c of cacti) c.x -= speed * dt;
  cacti = cacti.filter((c) => c.x + c.w > -50);

  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnCactus();
    spawnTimer = 0.9 + Math.random() * 0.8;
  }

  for (const c of cacti) {
    if (rectHit(dino, c)) {
      alive = false;
      break;
    }
  }

  score += dt * 10;
  speed += dt * 6;
  scoreEl.textContent = Math.floor(score).toString();
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;

  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") jumpOrRestart();
  if (e.code === "KeyR") reset();
});

window.addEventListener("mousedown", (e) => {
  if (e.button === 0) jumpOrRestart();
});

window.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    jumpOrRestart();
  },
  { passive: false }
);

reset();
requestAnimationFrame(loop);
