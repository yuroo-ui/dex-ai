// ═══ Arc Network Particles ═══
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let W, H;
const particles = [];
const NODE_COUNT = 40;
const CONNECT_DIST = 140;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Arc colors
const COLORS = ['rgba(99,102,241,0.4)', 'rgba(139,92,246,0.3)', 'rgba(168,85,247,0.3)', 'rgba(255,255,255,0.15)'];

for (let i = 0; i < NODE_COUNT; i++) {
  particles.push({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2 + 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  });
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  
  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < CONNECT_DIST) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(99,102,241,${(1 - d / CONNECT_DIST) * 0.25})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  
  // Draw nodes
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
  
  requestAnimationFrame(draw);
}
draw();
