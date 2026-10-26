type Paper = { x: number; y: number; vx: number; vy: number; angle: number; spin: number; size: number; color: string; born: number; gravity: number; drift: number; flutter: number; phase: number; stretch: number };

let stopCurrent: (() => void) | undefined;

export function stopCelebration() {
  stopCurrent?.();
}

export function celebrate() {
  stopCelebration();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const context = canvas.getContext('2d');
  if (!context) return;
  document.body.append(canvas);

  const papers: Paper[] = [];
  const colors = ['#39a567', '#ffc43b', '#ff705e', '#48b8e9', '#b17be8', '#ffdc72', '#f367b0', '#5edac5'];
  const burstTimes = [0, 130, 340, 620, 1020, 1480];
  let width = 0, height = 0, frame = 0, burst = 0;
  const resize = () => {
    const oldWidth = width, oldHeight = height;
    width = window.innerWidth; height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (oldWidth && oldHeight) papers.forEach(paper => { paper.x *= width / oldWidth; paper.y *= height / oldHeight; });
  };
  resize();
  window.addEventListener('resize', resize);

  const cleanupTimer = window.setTimeout(stopCelebration, 6300);
  const cleanup = () => {
    cancelAnimationFrame(frame);
    clearTimeout(cleanupTimer);
    window.removeEventListener('resize', resize);
    canvas.remove();
    if (stopCurrent === cleanup) stopCurrent = undefined;
  };
  stopCurrent = cleanup;

  const launch = (time: number) => {
    const count = width < 600 ? 65 : 100;
    const addPaper = (x: number, y: number, vx: number, vy: number) => papers.push({
      x, y, vx, vy,
      angle: Math.random() * Math.PI * 2, spin: (Math.random() - .5) * 28,
      size: 4 + Math.random() * 12, color: colors[Math.floor(Math.random() * colors.length)], born: time,
      gravity: 270 + Math.random() * 430, drift: 50 + Math.random() * 180,
      flutter: 3 + Math.random() * 12, phase: Math.random() * Math.PI * 2,
      stretch: Math.random() < .25 ? 2 + Math.random() * 2 : .45 + Math.random() * .8,
    });
    for (const side of [-1, 1]) for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 - side * (.05 + Math.random() * 1.3);
      const speed = Math.min(1500, height * 1.7) * (.5 + Math.random() * .9);
      addPaper(width * (side < 0 ? .02 + Math.random() * .2 : .78 + Math.random() * .2),
        height * (.7 + Math.random() * .35), Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
    // Mix overhead showers with the irregular cannon bursts for full-screen chaos.
    for (let i = 0; i < count * .6; i++) {
      addPaper(Math.random() * width, -Math.random() * height * .3,
        (Math.random() - .5) * 280, 40 + Math.random() * 180);
    }
  };
  const started = performance.now();
  let previous = started;
  const draw = (now: number) => {
    const elapsed = now - started;
    if (elapsed >= 6000) { cleanup(); return; }
    const dt = Math.min((now - previous) / 1000, .04);
    previous = now;
    while (burst < burstTimes.length && elapsed >= burstTimes[burst]) { launch(now); burst++; }
    context.clearRect(0, 0, width, height);
    for (const paper of papers) {
      const age = (now - paper.born) / 1000;
      paper.vx *= Math.exp(-.65 * dt);
      paper.vy += paper.gravity * dt;
      paper.x += (paper.vx + Math.sin(age * paper.flutter + paper.phase) * paper.drift) * dt;
      paper.y += (paper.vy + Math.cos(age * paper.flutter * .7 + paper.phase) * 45) * dt;
      paper.angle += paper.spin * dt;
      if (paper.y > height + 80 || paper.x < -100 || paper.x > width + 100) continue;
      context.save();
      context.globalAlpha = Math.max(0, Math.min(1, (5.2 - age) / 1.2, (6000 - elapsed) / 700));
      context.translate(paper.x, paper.y);
      context.rotate(paper.angle);
      context.scale(Math.cos(age * paper.flutter + paper.phase), 1);
      context.fillStyle = paper.color;
      context.fillRect(-paper.size / 2, -paper.size * paper.stretch / 2, paper.size, paper.size * paper.stretch);
      context.restore();
    }
    frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);
}
