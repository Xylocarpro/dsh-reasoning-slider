import { clamp, makeParticle } from './core.js';
export function startParticles(canvas, getPosition = () => 3) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0, previous = 0, elapsed = 0, width = 0, height = 0, points = [], visible = true;
  const position = () => clamp(Number(getPosition()) || 0, 0, 3);
  const emitter = () => 14 + Math.max(0, width - 28) * position() / 3;
  function resize() {
    const box = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    width = box.width; height = box.height;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const perLayer = clamp(Math.round(width / 50), 5, 7);
    // Four distinct planes, painted back to front. Positions are independent
    // random samples so no layer forms a repeating row or cadence.
    points = Array.from({ length: 4 }, (_, layer) => {
      return Array.from({ length: perLayer }, (_, i) => {
        const point = makeParticle(width, height, layer / 3);
        point.x = Math.random() * emitter();
        point.wait = 0;
        point.y = 4 + Math.random() * Math.max(1, height - 8);
        return point;
      });
    }).flat();
    paint(0);
  }
  function paint(dt) {
    // One continuous speed curve: Low=0, High=.5, Ultra=1.
    const speedScale = clamp((position() - 1) / 2, 0, 1);
    const boundary = emitter();
    ctx.clearRect(0, 0, width, height); elapsed += dt * speedScale;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, boundary, height); ctx.clip();
    for (const p of points) {
      // Waiting particles spawn at the current thumb, never the track end.
      // Moving left retires particles outside the newly filled region.
      if (p.wait > 0) {
        p.wait = Math.max(0, p.wait - dt * speedScale);
        p.x = boundary;
        if (p.wait > 0) continue;
      }
      p.x -= p.speed * speedScale * dt;
      if (p.x < -p.radius * 3 || p.x > boundary) {
        Object.assign(p, makeParticle(width, height, p.depth));
        p.x = boundary;
        p.wait = .04 + Math.random() * .4;
        continue;
      }
      const y = p.y + Math.sin(elapsed * .8 + p.phase) * (.3 + p.depth * 1.2);
      const alpha = p.opacity * clamp(p.x / 15, 0, 1) * clamp((boundary - p.x) / 10, 0, 1);
      const radius = p.radius * (2.1 + p.depth * .5);
      const g = ctx.createRadialGradient(p.x, y, 0, p.x, y, radius);
      g.addColorStop(0, `rgba(245,242,255,${alpha})`);
      g.addColorStop(.38, `rgba(240,237,255,${alpha * .88})`);
      g.addColorStop(.62, `rgba(234,231,255,${alpha * .28})`);
      g.addColorStop(1, 'rgba(234,231,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, y, radius, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  function frame(time) {
    raf = 0; paint(previous ? Math.min((time - previous) / 1000, .05) : 0); previous = time;
    raf = requestAnimationFrame(frame);
  }
  function sync() {
    cancelAnimationFrame(raf); raf = 0; previous = 0;
    if (!document.hidden && visible) {
      if (reduced.matches) paint(0); else raf = requestAnimationFrame(frame);
    }
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  intersection.observe(canvas);
  document.addEventListener('visibilitychange', sync); reduced.addEventListener('change', sync);
  resize(); sync();
  return () => { cancelAnimationFrame(raf); observer.disconnect(); intersection.disconnect(); document.removeEventListener('visibilitychange', sync); reduced.removeEventListener('change', sync); };
}
