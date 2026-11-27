/* Ecosystem: places the nodes on a tilted orbit around the hub and turns it slowly. Nearer nodes are larger and brighter.
   The orbit holds while a node is hovered, focused or pinned, while it is off screen and under "Pause motion".
   With reduced motion it is drawn once and stays still. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-eco]').forEach((eco) => {
    const stage = eco.querySelector('.eco-stage');
    const svg = eco.querySelector('.eco-space');
    const nodes = [...eco.querySelectorAll('[data-node]')];
    const items = nodes.map((n) => n.parentElement);
    const links = [...eco.querySelectorAll('[data-link]')];
    const pulses = [...eco.querySelectorAll('[data-pulse]')];
    const orbits = [...eco.querySelectorAll('.eco-orbit')];
    const step = Math.PI * 2 / nodes.length;
    let w = 0, h = 0, cx = 0, cy = 0, rx = 0, ry = 0;
    let turn = 0, clock = 0, last = 0, raf = 0, visible = false;
    let hovered = null, focused = null, pinned = null;
    const active = () => hovered || focused || pinned;

    const draw = () => {
      nodes.forEach((node, i) => {
        const a = -Math.PI / 2 + i * step + turn;
        const depth = (Math.sin(a) + 1) / 2;              // 0 = back, 1 = front
        const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
        const lit = node === active();
        const scale = (0.82 + depth * 0.22) * (lit ? 1.08 : 1);
        items[i].style.transform = `translate(${x}px,${y}px) translate(-50%,-50%) scale(${scale})`;
        items[i].style.filter = `brightness(${lit ? 1.1 : 0.72 + depth * 0.28})`;   // dimmed, not faded: links must not show through
        items[i].style.zIndex = lit ? 120 : Math.round(depth * 100);
        links[i].setAttribute('x1', cx); links[i].setAttribute('y1', cy);
        links[i].setAttribute('x2', x); links[i].setAttribute('y2', y);
        links[i].style.opacity = lit ? 1 : 0.2 + depth * 0.45;
        // A light travels along each link, inwards from a node and, once one is active, back out to all the others
        const now = active();
        let t = (clock * 0.28 + i / nodes.length) % 1;
        if (!now || now === node) t = 1 - t;
        pulses[i].setAttribute('cx', cx + (x - cx) * t);
        pulses[i].setAttribute('cy', cy + (y - cy) * t);
        pulses[i].style.opacity = reduce.matches ? 0 : Math.sin(t * Math.PI) * (0.4 + depth * 0.6);
      });
    };

    const measure = () => {
      w = stage.clientWidth; h = stage.clientHeight;
      const widest = Math.max(...items.map((li) => li.offsetWidth));
      cx = w / 2; cy = h * 0.48;
      rx = Math.min(w / 2 - widest * 0.52, 440);
      ry = h * 0.39;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      [1, 0.76, 1.16].forEach((k, i) => {
        orbits[i].setAttribute('cx', cx); orbits[i].setAttribute('cy', cy);
        orbits[i].setAttribute('rx', rx * k); orbits[i].setAttribute('ry', ry * k);
      });
      draw();
    };

    const running = () => visible && !reduce.matches && !window.vowAmbient.paused;
    const tick = (time) => {
      const dt = Math.min((time - last) / 1000, 0.05); last = time;
      clock += dt;
      if (!active()) turn += dt * (Math.PI * 2 / 48);     // one revolution in 48 seconds
      orbits[1].style.strokeDashoffset = -clock * 14;
      draw();
      raf = running() ? requestAnimationFrame(tick) : 0;
    };
    const play = () => {
      if (raf || !running()) return;
      last = performance.now(); raf = requestAnimationFrame(tick);
    };

    const refresh = () => {
      const now = active();
      eco.classList.toggle('is-active', !!now);
      nodes.forEach((n, i) => {
        n.classList.toggle('is-lit', n === now);
        n.setAttribute('aria-pressed', String(n === pinned));
        links[i].classList.toggle('is-lit', n === now);
      });
      draw();
    };
    nodes.forEach((n) => {
      n.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovered = n; refresh(); } });
      n.addEventListener('pointerleave', () => { hovered = null; refresh(); });
      n.addEventListener('focus', () => { if (n.matches(':focus-visible')) { focused = n; refresh(); } });
      n.addEventListener('blur', () => { focused = null; refresh(); });
      n.addEventListener('click', () => { pinned = pinned === n ? null : n; if (!pinned) focused = hovered = null; refresh(); });
    });
    const release = () => { pinned = focused = hovered = null; refresh(); };
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') release(); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.eco-node') && pinned) release(); });

    // The whole scene leans toward the mouse
    eco.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || reduce.matches || window.vowAmbient.paused) return;
      const r = eco.getBoundingClientRect();
      stage.style.setProperty('--tilt-y', `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`);
      stage.style.setProperty('--tilt-x', `${((e.clientY - r.top) / r.height - 0.5) * -6}deg`);
    });
    eco.addEventListener('pointerleave', () => { stage.style.removeProperty('--tilt-x'); stage.style.removeProperty('--tilt-y'); });

    eco.classList.add('is-3d');
    new ResizeObserver(measure).observe(stage);
    if (document.fonts) document.fonts.ready.then(measure);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; play(); }).observe(eco);
    window.vowAmbient.onChange(play);
    reduce.addEventListener('change', () => { draw(); play(); });
  });
})();
