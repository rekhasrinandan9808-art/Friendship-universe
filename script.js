// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. REFERENCES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const name1Input = document.getElementById('name1');
const name2Input = document.getElementById('name2');
const btnGenerate = document.getElementById('btn-generate');

const stepNames = document.getElementById('step-names');
const stepSurprise = document.getElementById('step-surprise');
const stepTimeline = document.getElementById('step-timeline');
const stepInfinity = document.getElementById('step-infinity');

const cardFlip = document.getElementById('cardFlip');
const btnFlip = document.getElementById('btn-flip');
const surpriseMsg = document.getElementById('surprise-message');
const surpriseFrom = document.getElementById('surprise-from');
const surpriseTitle = document.getElementById('surprise-title');

const btnNextTimeline = document.getElementById('btn-next-timeline');
const btnNextInfinity = document.getElementById('btn-next-infinity');
const btnDownload = document.getElementById('btn-download');
const btnShare = document.getElementById('btn-share');
const btnRestart = document.getElementById('btn-restart');

const tlName1 = document.getElementById('tl-name1');
const tlName2 = document.getElementById('tl-name2');
const infName1 = document.getElementById('inf-name1');
const infName2 = document.getElementById('inf-name2');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. STATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let name1 = 'Nandan';
let name2 = 'Rishitha';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. UTILITY: switch steps
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function showStep(stepId) {
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. CONFETTI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const confettiCanvas = document.getElementById('confetti-canvas');
const ctxConfetti = confettiCanvas.getContext('2d');
let confettiPieces = [];
let confettiRunning = false;

function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfetti);
resizeConfetti();

class ConfettiPiece {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = Math.random() * confettiCanvas.height - confettiCanvas.height;
        this.w = Math.random() * 8 + 4;
        this.h = Math.random() * 4 + 2;
        this.color = `hsl(${Math.random() * 60 + 200}, 80%, 60%)`;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = Math.random() * 2 + 1;
        this.rot = Math.random() * 360;
        this.rv = (Math.random() - 0.5) * 6;
        this.life = 1;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rot += this.rv;
        this.life -= 0.002;
        if (this.y > confettiCanvas.height + 50 || this.life <= 0) this.reset();
    }
    draw() {
        ctxConfetti.save();
        ctxConfetti.translate(this.x, this.y);
        ctxConfetti.rotate((this.rot * Math.PI) / 180);
        ctxConfetti.globalAlpha = Math.max(0, this.life);
        ctxConfetti.fillStyle = this.color;
        ctxConfetti.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctxConfetti.restore();
    }
}

function startConfetti(count = 180) {
    if (confettiRunning) return;
    confettiRunning = true;
    confettiPieces = [];
    for (let i = 0; i < count; i++) confettiPieces.push(new ConfettiPiece());

    function animateConfetti() {
        if (!confettiRunning) return;
        ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        let alive = 0;
        for (const p of confettiPieces) {
            p.update();
            p.draw();
            if (p.life > 0.01) alive++;
        }
        if (alive > 0) requestAnimationFrame(animateConfetti);
        else {
            confettiRunning = false;
            ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }
    animateConfetti();
}

function stopConfetti() {
    confettiRunning = false;
    ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. MEMORY RAIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const rainCanvas = document.getElementById('rain-canvas');
const ctxRain = rainCanvas.getContext('2d');
let rainDrops = [];
let rainRunning = false;

function resizeRain() {
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeRain);
resizeRain();

const rainWords = ['💙', '✨', '⭐', 'Trust', 'Laughter', 'Memories', 'Forever', 'Friendship'];

class RainDrop {
    constructor() {
        this.reset();
        this.y = Math.random() * rainCanvas.height - rainCanvas.height;
    }
    reset() {
        this.x = Math.random() * rainCanvas.width;
        this.y = -60;
        this.size = Math.random() * 20 + 16;
        this.speed = Math.random() * 1.2 + 0.6;

        // pick word: 40% chance name1, 40% name2, 20% random
        const r = Math.random();
        if (r < 0.4) this.text = name1;
        else if (r < 0.8) this.text = name2;
        else this.text = rainWords[Math.floor(Math.random() * rainWords.length)];

        // color glow
        if (this.text === name1) this.color = 'rgba(138, 180, 255, 0.7)';
        else if (this.text === name2) this.color = 'rgba(245, 139, 203, 0.7)';
        else this.color = 'rgba(255,255,255,0.35)';

        this.opacity = Math.random() * 0.6 + 0.3;
        this.rotation = (Math.random() - 0.5) * 0.2;
    }
    update() {
        this.y += this.speed;
        this.x += Math.sin(this.y * 0.003) * 0.15;
        if (this.y > rainCanvas.height + 60) this.reset();
    }
    draw() {
        ctxRain.save();
        ctxRain.globalAlpha = this.opacity;
        ctxRain.font = `${this.size}px "Inter", sans-serif`;
        ctxRain.textAlign = 'center';
        ctxRain.textBaseline = 'middle';

        // glow shadow
        ctxRain.shadowColor = this.color;
        ctxRain.shadowBlur = 30;

        ctxRain.fillStyle = this.color;
        ctxRain.fillText(this.text, this.x, this.y);

        ctxRain.restore();
    }
}

function startRain() {
    if (rainRunning) return;
    rainRunning = true;
    rainDrops = [];
    for (let i = 0; i < 80; i++) {
        const d = new RainDrop();
        d.y = Math.random() * rainCanvas.height;
        rainDrops.push(d);
    }

    function animateRain() {
        if (!rainRunning) return;
        ctxRain.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
        for (const d of rainDrops) {
            d.update();
            d.draw();
        }
        requestAnimationFrame(animateRain);
    }
    animateRain();
}

function stopRain() {
    rainRunning = false;
    ctxRain.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. INFINITY STARS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function generateStars() {
    const container = document.getElementById('starsContainer');
    container.innerHTML = '';
    for (let i = 0; i < 40; i++) {
        const span = document.createElement('span');
        span.style.left = Math.random() * 100 + '%';
        span.style.top = Math.random() * 100 + '%';
        span.style.width = Math.random() * 3 + 1 + 'px';
        span.style.height = span.style.width;
        span.style.animationDelay = Math.random() * 5 + 's';
        span.style.animationDuration = (Math.random() * 4 + 2) + 's';
        container.appendChild(span);
    }
}
generateStars();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. CORE LOGIC
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Generate Surprise ──
btnGenerate.addEventListener('click', () => {
    name1 = name1Input.value.trim() || 'You';
    name2 = name2Input.value.trim() || 'Them';

    // Update all dynamic text
    tlName1.textContent = name1;
    tlName2.textContent = name2;
    infName1.textContent = name1;
    infName2.textContent = name2;

    // Surprise message variations
    const messages = [
        `💙<br />You make life <span class="highlight">beautiful</span>`,
        `✨<br />You are <span class="highlight">magic</span> in human form`,
        `🌟<br />Home is wherever <span class="highlight">you</span> are`,
        `💫<br />Thanks for being <span class="highlight">you</span>`,
        `🌙<br />You're my favorite <span class="highlight">person</span>`
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    surpriseMsg.innerHTML = randomMsg;
    surpriseFrom.textContent = `— from ${name1}`;
    surpriseTitle.textContent = `A message for ${name2}`;

    // Reset flip
    cardFlip.classList.remove('flipped');

    // Switch step
    showStep('step-surprise');

    // Start confetti
    startConfetti(200);
    setTimeout(stopConfetti, 4500);
});

// ── Flip Card ──
btnFlip.addEventListener('click', () => {
    cardFlip.classList.toggle('flipped');
    if (cardFlip.classList.contains('flipped')) {
        btnFlip.textContent = '↩️ Flip Back';
    } else {
        btnFlip.textContent = '👆 Flip Card';
    }
});

// ── Next: Timeline ──
btnNextTimeline.addEventListener('click', () => {
    showStep('step-timeline');
    // Start rain on timeline
    startRain();
    // Re-trigger timeline animations
    document.querySelectorAll('.timeline-item').forEach((el, i) => {
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.animation = `timelineFade 0.6s ease forwards`;
        el.style.animationDelay = `${0.1 + i * 0.2}s`;
    });
});

// ── Next: Infinity ──
btnNextInfinity.addEventListener('click', () => {
    stopRain();
    showStep('step-infinity');
    // Keep confetti subtle on final
    startConfetti(80);
    setTimeout(stopConfetti, 3000);
});

// ── Download ──
btnDownload.addEventListener('click', () => {
    alert('📸 To download, take a screenshot of this beautiful card! 💙');
});

// ── Share ──
btnShare.addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: 'Happy Friendship Day 💙',
            text: `✨ ${name1} 🤝 ${name2} — Forever friends! 💙`,
            url: window.location.href
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(`✨ ${name1} 🤝 ${name2} — Forever friends! 💙 Happy Friendship Day!`)
            .then(() => alert('📋 Copied to clipboard! Share it with your bestie.'))
            .catch(() => alert('🔗 Share this page with your bestie!'));
    }
});

// ── Restart ──
btnRestart.addEventListener('click', () => {
    stopRain();
    stopConfetti();
    showStep('step-names');
    cardFlip.classList.remove('flipped');
    btnFlip.textContent = '👆 Flip Card';
});

// ── Enter key support ──
name2Input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnGenerate.click();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. INIT — start with names step
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
showStep('step-names');
// Pre-fill with defaults
name1Input.value = 'Nandan';
name2Input.value = 'Rishitha';

console.log('💙 Happy Friendship Day!');
console.log('✨ Made with love for two besties.');
