// ============================================================
// PROJECT AURORA — Full Universe Experience
// ============================================================

// ---------- CANVAS SETUP ----------
const canvas = document.getElementById('universeCanvas');
const ctx = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ---------- STATE ----------
const state = {
  name1: '',
  name2: '',
  phase: 0,
  progress: 0,
  stars: [],
  particles: [],
  constellation: [],
  planet: null,
  memories: [],
  heartbeat: 0,
  time: 0,
  isActive: false,
  secretShown: false,
};

// ---------- TOAST ----------
function showToast(msg) {
  let toast = document.querySelector('.toast-aurora');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-aurora';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('visible'), 2500);
}

// ---------- STAR CLASS ----------
class Star {
  constructor(x, y, size, color) {
    this.x = x || Math.random() * W;
    this.y = y || Math.random() * H;
    this.size = size || 1 + Math.random() * 2.5;
    this.baseSize = this.size;
    this.color = color || `hsl(${220 + Math.random() * 40}, 60%, ${60 + Math.random() * 30}%)`;
    this.twinkleSpeed = 0.5 + Math.random() * 1.5;
    this.twinkleOffset = Math.random() * Math.PI * 2;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.life = 1;
    this.targetX = x || Math.random() * W;
    this.targetY = y || Math.random() * H;
    this.text = '';
  }

  update(time) {
    const pulse = Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.3 + 0.7;
    this.size = this.baseSize * pulse;

    if (state.phase >= 3) {
      const beat = Math.sin(state.heartbeat) * 0.15 + 0.85;
      this.size *= beat;
    }

    if (state.phase === 4) {
      this.x += (this.targetX - this.x) * 0.008;
      this.y += (this.targetY - this.y) * 0.008;
    }

    if (state.phase === 6) {
      this.vy -= 0.02;
      this.size *= 0.998;
      this.life -= 0.001;
    }
  }

  draw(ctx) {
    if (this.life < 0.05) return;
    ctx.save();
    ctx.globalAlpha = this.life * 0.8;
    const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
    glow.addColorStop(0, this.color);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.size * 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ---------- PARTICLE CLASS ----------
class Particle {
  constructor(x, y, color) {
    this.x = x || W / 2;
    this.y = y || H / 2;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
    this.size = 2 + Math.random() * 4;
    this.color = color || `hsl(${220 + Math.random() * 60}, 80%, 70%)`;
    this.life = 1;
    this.decay = 0.005 + Math.random() * 0.01;
    this.gravity = 0.02;
    this.targetX = W / 2 + (Math.random() - 0.5) * 200;
    this.targetY = H / 2 + (Math.random() - 0.5) * 200;
    this.phase = 0;
    this.text = '';
  }

  update() {
    this.phase += 0.02;
    this.vx += (this.targetX - this.x) * 0.002;
    this.vy += (this.targetY - this.y) * 0.002;
    this.vx *= 0.99;
    this.vy *= 0.99;
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;

    if (state.phase >= 3) {
      const beat = Math.sin(state.heartbeat) * 0.5 + 1;
      this.size *= beat;
    }
  }

  draw(ctx) {
    if (this.life < 0.01) return;
    ctx.save();
    ctx.globalAlpha = this.life * 0.9;
    const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
    glow.addColorStop(0, this.color);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    if (this.text) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = '20px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.text, this.x, this.y);
    }
    ctx.restore();
  }
}

// ---------- PLANET CLASS ----------
class Planet {
  constructor(name1, name2) {
    this.name = `${name1} × ${name2}`;
    this.x = W / 2;
    this.y = H / 2;
    this.radius = 60;
    this.rotation = 0;
    this.satellites = [];
    this.color1 = '#6c63ff';
    this.color2 = '#a78bfa';

    const emojis = ['💙', '✨', '⭐', '💕', '🌠', '💫', '🌟', '💜'];
    for (let i = 0; i < 8; i++) {
      this.satellites.push({
        angle: (i / 8) * Math.PI * 2,
        distance: 90 + Math.random() * 40,
        size: 16 + Math.random() * 10,
        emoji: emojis[i % emojis.length],
        speed: 0.3 + Math.random() * 0.4,
      });
    }
  }

  update() {
    this.rotation += 0.005;
    this.satellites.forEach(s => {
      s.angle += s.speed * 0.008;
    });
  }

  draw(ctx) {
    ctx.save();

    const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
    glow.addColorStop(0, 'rgba(108,99,255,0.15)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createRadialGradient(
      this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
      this.x, this.y, this.radius
    );
    grad.addColorStop(0, this.color2);
    grad.addColorStop(0.5, this.color1);
    grad.addColorStop(1, '#2a1f6e');
    ctx.fillStyle = grad;
    ctx.shadowColor = this.color1;
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.radius * (1.4 + i * 0.15), this.radius * 0.3 + i * 0.05, this.rotation * 0.3 + i, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f0ecff';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(this.name, this.x, this.y - this.radius - 20);

    this.satellites.forEach(s => {
      const sx = this.x + Math.cos(s.angle) * s.distance;
      const sy = this.y + Math.sin(s.angle) * s.distance;
      ctx.font = `${s.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.emoji, sx, sy);

      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 8]);
      ctx.beginPath();
      ctx.arc(this.x, this.y, s.distance, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    ctx.restore();
  }
}

// ---------- MEMORY CLASS ----------
class Memory {
  constructor(text, x, y) {
    this.text = text;
    this.x = x || Math.random() * W;
    this.y = y || H + 50;
    this.vy = -0.4 - Math.random() * 0.8;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.size = 14 + Math.random() * 12;
    this.life = 1;
    this.color = `hsl(${200 + Math.random() * 60}, 80%, ${65 + Math.random() * 25}%)`;
    this.rotation = (Math.random() - 0.5) * 0.5;
  }

  update() {
    this.y += this.vy;
    this.x += this.vx + Math.sin(this.y * 0.01) * 0.2;
    this.life -= 0.003;
    this.rotation += 0.01;
  }

  draw(ctx) {
    if (this.life < 0.01) return;
    ctx.save();
    ctx.globalAlpha = this.life * 0.8;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
    ctx.font = `${this.size}px "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, 0, 0);
    ctx.restore();
  }
}

// ---------- CONSTELLATION ----------
const constellationLines = [
  'Dear friend,',
  'Thank you for being you.',
  'Every moment with you',
  'Is a star in my sky.',
  'Happy Friendship Day 💙'
];

function buildConstellation() {
  const points = [];
  const cx = W / 2;
  const cy = H / 2 - 50;
  const radius = 160;
  const count = constellationLines.length + 1;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const r = radius * (0.7 + Math.random() * 0.3);
    points.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      targetX: cx + Math.cos(angle) * r,
      targetY: cy + Math.sin(angle) * r,
      text: constellationLines[i] || '',
    });
  }
  return points;
}

// ---------- INIT UNIVERSE ----------
function initUniverse() {
  state.stars = [];
  state.particles = [];
  state.memories = [];

  for (let i = 0; i < 400; i++) {
    state.stars.push(new Star(
      Math.random() * W,
      Math.random() * H,
      0.5 + Math.random() * 2,
      `hsl(${200 + Math.random() * 60}, 50%, ${50 + Math.random() * 30}%)`
    ));
  }

  for (let i = 0; i < 80; i++) {
    const p = new Particle(
      W / 2 + (Math.random() - 0.5) * 600,
      H / 2 + (Math.random() - 0.5) * 400,
      `hsl(${240 + Math.random() * 60}, 70%, ${60 + Math.random() * 30}%)`
    );
    p.size = 8 + Math.random() * 20;
    p.decay = 0.001;
    state.particles.push(p);
  }

  state.planet = null;
  state.constellation = [];
  state.secretShown = false;
  document.getElementById('secretEnding').classList.remove('visible');
}

// ---------- SCENE 1: BIRTH ----------
function sceneBirth() {
  state.phase = 1;
  state.progress = 0;

  const names = `${state.name1} ✦ ${state.name2}`;
  const chars = names.split('');
  const centerX = W / 2;
  const centerY = H / 2;

  chars.forEach((char, i) => {
    const angle = (i / chars.length) * Math.PI * 2;
    const dist = 100 + Math.random() * 200;
    const p = new Particle(
      centerX + Math.cos(angle) * dist + (Math.random() - 0.5) * 100,
      centerY + Math.sin(angle) * dist + (Math.random() - 0.5) * 100,
      `hsl(${240 + Math.random() * 60}, 80%, ${70 + Math.random() * 20}%)`
    );
    p.size = 6 + Math.random() * 8;
    p.targetX = centerX + Math.cos(angle) * 60;
    p.targetY = centerY + Math.sin(angle) * 60;
    p.decay = 0.008;
    p.text = char;
    state.particles.push(p);
  });

  for (let i = 0; i < 120; i++) {
    const p = new Particle(
      W / 2 + (Math.random() - 0.5) * 600,
      H / 2 + (Math.random() - 0.5) * 400,
      `hsl(${200 + Math.random() * 80}, 90%, 80%)`
    );
    p.size = 2 + Math.random() * 4;
    p.decay = 0.01 + Math.random() * 0.02;
    p.targetX = W / 2 + (Math.random() - 0.5) * 200;
    p.targetY = H / 2 + (Math.random() - 0.5) * 200;
    state.particles.push(p);
  }

  state.isActive = true;
}

// ---------- SCENE 2: STARS MEET ----------
function sceneStarsMeet() {
  state.phase = 2;

  const star1 = new Star(W * 0.25, H / 2, 12, '#6c63ff');
  const star2 = new Star(W * 0.75, H / 2, 12, '#a78bfa');
  star1.targetX = W / 2 - 30;
  star1.targetY = H / 2;
  star2.targetX = W / 2 + 30;
  star2.targetY = H / 2;

  state.stars.push(star1, star2);

  for (let i = 0; i < 60; i++) {
    const p = new Particle(
      W * 0.25 + (Math.random() - 0.5) * 100,
      H / 2 + (Math.random() - 0.5) * 100,
      `hsl(${260 + Math.random() * 40}, 80%, 70%)`
    );
    p.size = 3 + Math.random() * 6;
    p.decay = 0.005;
    p.targetX = W / 2 + (Math.random() - 0.5) * 100;
    p.targetY = H / 2 + (Math.random() - 0.5) * 100;
    state.particles.push(p);
  }

  setTimeout(() => {
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 12;
      const p = new Particle(W / 2, H / 2, `hsl(${Math.random() * 360}, 90%, 70%)`);
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = 3 + Math.random() * 8;
      p.decay = 0.01 + Math.random() * 0.02;
      p.targetX = W / 2 + Math.cos(angle) * 300;
      p.targetY = H / 2 + Math.sin(angle) * 300;
      state.particles.push(p);
    }
    state.phase = 3;
  }, 3000);
}

// ---------- SCENE 3: GALAXY ----------
function sceneGalaxy() {
  state.phase = 3;
}

// ---------- SCENE 4: CONSTELLATION ----------
function sceneConstellation() {
  state.phase = 4;
  const points = buildConstellation();
  state.constellation = points;

  points.forEach((p, i) => {
    const star = new Star(p.x, p.y, 4 + Math.random() * 3, '#a78bfa');
    star.targetX = p.x;
    star.targetY = p.y;
    star.baseSize = 4 + Math.random() * 3;
    if (i < constellationLines.length) {
      star.text = constellationLines[i];
    }
    state.stars.push(star);
  });

  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    const steps = 20;
    for (let j = 0; j < steps; j++) {
      const t = j / steps;
      const p = new Particle(
        from.x + (to.x - from.x) * t,
        from.y + (to.y - from.y) * t,
        `hsl(${260 + Math.random() * 40}, 80%, 70%)`
      );
      p.size = 2 + Math.random() * 3;
      p.decay = 0.002;
      p.targetX = from.x + (to.x - from.x) * t;
      p.targetY = from.y + (to.y - from.y) * t;
      state.particles.push(p);
    }
  }
}

// ---------- SCENE 5: PLANET ----------
function scenePlanet() {
  state.phase = 5;
  state.planet = new Planet(state.name1, state.name2);
}

// ---------- SCENE 6: MEMORY RAIN ----------
function sceneMemoryRain() {
  state.phase = 6;
  const memories = [
    '😂', '💙', '✨', '🤝', '😊', '🌟', '💕', '🎉',
    'You made me laugh', 'Thank you', 'Remember that time?',
    'Best friend', 'Always there', '💫', '⭐', '🌈'
  ];

  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const text = memories[Math.floor(Math.random() * memories.length)];
      const m = new Memory(
        text,
        Math.random() * W,
        H + 30 + Math.random() * 50
      );
      state.memories.push(m);
    }, i * 300);
  }
}

// ---------- SCENE 7: SECRET ----------
function sceneSecret() {
  state.phase = 7;
  setTimeout(() => {
    document.getElementById('secretEnding').classList.add('visible');
    state.secretShown = true;
  }, 3000);
}

// ---------- EASTER EGGS ----------
let eggCount = 0;
let konamiIndex = 0;
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  state.stars.forEach(star => {
    const dist = Math.hypot(x - star.x, y - star.y);
    if (dist < 20) {
      eggCount++;
      if (eggCount === 7) {
        for (let i = 0; i < 150; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 15;
          const p = new Particle(x, y, `hsl(${Math.random() * 360}, 100%, 70%)`);
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
          p.size = 3 + Math.random() * 6;
          p.decay = 0.01 + Math.random() * 0.02;
          state.particles.push(p);
        }
        eggCount = 0;
        showToast('🎆 Fireworks! ✨');
      }
    }
  });
});

let shakeDetected = false;
if (window.DeviceMotionEvent) {
  window.addEventListener('devicemotion', (e) => {
    const acc = e.accelerationIncludingGravity;
    if (acc && Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z) > 30) {
      if (!shakeDetected) {
        shakeDetected = true;
        for (let i = 0; i < 80; i++) {
          setTimeout(() => {
            const p = new Particle(
              Math.random() * W,
              Math.random() * H * 0.3,
              `hsl(${40 + Math.random() * 30}, 90%, 70%)`
            );
            p.vx = 2 + Math.random() * 6;
            p.vy = 3 + Math.random() * 8;
            p.size = 4 + Math.random() * 8;
            p.decay = 0.02;
            state.particles.push(p);
          }, i * 50);
        }
        showToast('☄️ Meteor Shower!');
        setTimeout(() => shakeDetected = false, 3000);
      }
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      document.getElementById('scene').style.background =
        `radial-gradient(ellipse at center, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}, #050510)`;
      showToast('🌈 Galaxy Shifted!');
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

let longPressTimer;
canvas.addEventListener('mousedown', () => {
  longPressTimer = setTimeout(() => {
    state.heartbeat = Date.now() * 0.005;
    showToast('💓 Heartbeat Mode Active');
  }, 800);
});
canvas.addEventListener('mouseup', () => clearTimeout(longPressTimer));
canvas.addEventListener('touchstart', () => {
  longPressTimer = setTimeout(() => {
    state.heartbeat = Date.now() * 0.005;
    showToast('💓 Heartbeat Mode Active');
  }, 800);
});
canvas.addEventListener('touchend', () => clearTimeout(longPressTimer));

// ---------- DRAW ----------
function draw() {
  ctx.clearRect(0, 0, W, H);

  if (state.phase >= 3) {
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 500);
    grad.addColorStop(0, 'rgba(108,99,255,0.05)');
    grad.addColorStop(0.5, 'rgba(167,139,250,0.03)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  state.stars.forEach(star => star.draw(ctx));
  state.particles.forEach(p => p.draw(ctx));
  state.memories.forEach(m => m.draw(ctx));

  if (state.planet) {
    state.planet.draw(ctx);
  }

  if (state.constellation.length > 0 && state.phase === 4) {
    ctx.save();
    ctx.strokeStyle = 'rgba(167,139,250,0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    for (let i = 0; i < state.constellation.length - 1; i++) {
      const from = state.constellation[i];
      const to = state.constellation[i + 1];
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      if (from.text) {
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(from.text, from.x, from.y - 20);
        ctx.setLineDash([4, 8]);
      }
    }
    ctx.restore();
  }

  state.stars.forEach(star => star.update(state.time));
  state.particles.forEach(p => p.update());
  state.memories.forEach(m => m.update());
  state.memories = state.memories.filter(m => m.life > 0.01);

  if (state.planet) state.planet.update();

  state.particles = state.particles.filter(p => p.life > 0.01);
  state.stars = state.stars.filter(s => s.life > 0.01);

  state.time += 0.01;
  if (state.phase >= 3) {
    state.heartbeat += 0.03;
  }
}

// ---------- ANIMATION LOOP ----------
function animate() {
  draw();
  requestAnimationFrame(animate);
}

// ---------- START SEQUENCE ----------
function startUniverse(name1, name2) {
  state.name1 = name1;
  state.name2 = name2;

  document.getElementById('uiOverlay').classList.add('hidden');

  initUniverse();
  sceneBirth();

  setTimeout(() => { sceneStarsMeet(); }, 4000);
  setTimeout(() => { sceneGalaxy(); }, 7000);
  setTimeout(() => { sceneConstellation(); }, 12000);
  setTimeout(() => { scenePlanet(); }, 18000);
 
