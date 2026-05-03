/* ═══ Animated network background ═══ */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let W, H;
const particles = [];
const CONNECTION_DIST = 150;
const PARTICLE_COUNT = 60;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Create particles
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2 + 1,
  });
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONNECTION_DIST) {
        const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  // Draw particles
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(129,140,248,0.3)';
    ctx.fill();

    // Move
    p.x += p.vx;
    p.y += p.vy;

    // Wrap
    if (p.x < 0) p.x = W;
    if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H;
    if (p.y > H) p.y = 0;
  }

  requestAnimationFrame(draw);
}

draw();
