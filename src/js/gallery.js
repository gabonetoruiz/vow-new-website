/* Gallery: an infinite, draggable photo canvas.
   Drag or throw to explore, press and hold to zoom out, click a photo to lift it to the centre.
   Only the cards on screen exist in the DOM; the rest of the "world" is a repeating, hash-picked pattern. */
(() => {
  const stage = document.getElementById('gStage');
  const world = document.getElementById('gWorld');
  const source = document.getElementById('gSource');
  if (!stage || !world || !source) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const all = [...source.children].map((li) => ({
    src: li.dataset.src, w: +li.dataset.w, h: +li.dataset.h, sector: li.dataset.sector,
    title: li.dataset.title, meta: li.dataset.meta, desc: li.dataset.desc, alt: li.dataset.alt
  }));
  const chips = [...document.querySelectorAll('.g-filters [data-filter]')];
  const status = document.getElementById('gStatus');
  const focusEl = document.getElementById('gFocus');
  const focusImg = document.getElementById('gFocusImg');
  const tilt = document.getElementById('gTilt');
  const tT = document.getElementById('gT'), tM = document.getElementById('gM'), tD = document.getElementById('gD');
  const sr = document.getElementById('gFocusSr');
  const closeBtn = focusEl.querySelector('.g-focus-close');

  let list = all;           // photos currently shown (filter)
  let W = 260, GAP = 28, PX = 0, PY = 0;  // card width, gap, cell pitch
  let sw = 0, sh = 0;       // stage size
  let ox = 0, oy = 0;       // world offset
  let vx = 0, vy = 0;       // inertia
  let down = false, moved = 0, sx0 = 0, sy0 = 0, lx = 0, ly = 0, lt = 0;
  let mx = null, my = null; // pointer in stage coords (spotlight)
  let zoom = 1, zoomTarget = 1, holdTimer = 0;
  let raf = 0, open = null;
  const cards = new Map();  // "i,j" -> element

  // ---- layout helpers
  const hash = (i, j) => { let h = (i * 374761393 + j * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return (h ^ (h >>> 16)) >>> 0; };
  // card height/width for a photo: portrait 4:3 tall, square, landscape ~ 3:2
  const ratioOf = (p) => { const a = p.w / p.h; return a < 0.85 ? 1.38 : a < 1.2 ? 1 : 0.68; };
  const pick = (i, j) => list[(((i * 5 + j * 7) % list.length) + list.length) % list.length];

  const measure = () => {
    const r = stage.getBoundingClientRect();
    sw = r.width; sh = r.height;
    W = Math.round(Math.min(280, Math.max(150, sw * 0.2)));
    GAP = Math.round(W * 0.1);
    PX = W + GAP;
    PY = Math.round(W * 1.38) + GAP;
  };

  const colOffset = (i) => (hash(i, 99) % 100) / 100 * PY;  // stagger columns vertically

  const make = (i, j) => {
    const p = pick(i, j);
    const el = document.createElement('div');
    el.className = 'g-card';
    el.setAttribute('aria-hidden', 'true');
    el.style.width = W + 'px';
    el.style.height = Math.round(W * ratioOf(p)) + 'px';
    const img = new Image();
    img.src = p.src; img.alt = ''; img.decoding = 'async'; img.draggable = false;
    el.append(img);
    el._p = p; el._i = i; el._j = j;
    world.append(el);
    return el;
  };

  // ---- render: place the cards that are on screen
  const render = () => {
    const z = zoom, cx = sw / 2, cy = sh / 2;
    const pad = 1;
    const wx0 = (cx - (cx - 0) / z) - ox, wx1 = (cx + (sw - cx) / z) - ox;
    const wy0 = (cy - cy / z) - oy, wy1 = (cy + (sh - cy) / z) - oy;
    const i0 = Math.floor(wx0 / PX) - pad, i1 = Math.ceil(wx1 / PX) + pad;
    const seen = new Set();
    for (let i = i0; i <= i1; i++) {
      const off = colOffset(i);
      const j0 = Math.floor((wy0 - off) / PY) - pad, j1 = Math.ceil((wy1 - off) / PY) + pad;
      for (let j = j0; j <= j1; j++) {
        const key = i + ',' + j; seen.add(key);
        let el = cards.get(key);
        if (!el) { el = make(i, j); cards.set(key, el); }
        const ch = el.offsetHeight || Math.round(W * ratioOf(el._p));
        const wxc = i * PX + W / 2, wyc = j * PY + off + PY / 2 - GAP / 2;
        const px = (wxc + ox - cx) * z + cx, py = (wyc + oy - cy) * z + cy;
        const nx = (px - cx) / (sw / 2), ny = (py - cy) / (sh / 2);
        // gentle arc: edges turn toward the centre and recede
        const ry = -nx * 16, rx = ny * 10, tz = -(nx * nx + ny * ny) * 160;
        el.style.transform = `translate3d(${(px - W / 2).toFixed(1)}px,${(py - ch / 2).toFixed(1)}px,${tz.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) scale(${z.toFixed(3)})`;
        if (mx != null) {
          const d = Math.hypot(px - mx, py - my) / (Math.min(sw, sh) * 0.55);
          el.style.setProperty('--veil', Math.min(0.62, 0.08 + d * 0.5).toFixed(2));
        } else el.style.setProperty('--veil', '.3');
      }
    }
    for (const [key, el] of cards) if (!seen.has(key)) { el.remove(); cards.delete(key); }
  };

  // ---- animation loop: runs only while something is moving
  const tick = () => {
    raf = 0;
    if (!down && !open) {
      ox += vx; oy += vy;
      vx *= 0.94; vy *= 0.94;
      if (Math.abs(vx) < 0.05) vx = 0;
      if (Math.abs(vy) < 0.05) vy = 0;
    }
    zoom += (zoomTarget - zoom) * 0.14;
    if (Math.abs(zoomTarget - zoom) < 0.001) zoom = zoomTarget;
    render();
    if (down || vx || vy || zoom !== zoomTarget) schedule();
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };

  // Which card is under a point? Geometric, because 3D-transformed cards do not always receive the hit test.
  // Cards nearer the centre sit closer to the viewer, so they win overlaps.
  const cardAt = (x, y) => {
    const s = stage.getBoundingClientRect();
    let best = null, bd = Infinity;
    for (const el of cards.values()) {
      const r = el.getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
      const d = Math.hypot(r.left + r.width / 2 - (s.left + s.width / 2), r.top + r.height / 2 - (s.top + s.height / 2));
      if (d < bd) { bd = d; best = el; }
    }
    return best;
  };

  // ---- pointer: drag, throw, press-hold zoom, click
  stage.addEventListener('pointerdown', (e) => {
    if (open || e.button > 0) return;
    if (e.target.closest('.g-hint')) return;
    down = true; moved = 0; sx0 = lx = e.clientX; sy0 = ly = e.clientY; lt = performance.now(); vx = vy = 0;
    try { stage.setPointerCapture(e.pointerId); } catch (_) { /* synthetic pointer */ }
    stage.classList.add('is-down');
    if (!reduce.matches) holdTimer = setTimeout(() => { if (down && moved < 6) { zoomTarget = 0.88; schedule(); } }, 220);
    schedule();
  });
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
    stage.style.setProperty('--sx', mx + 'px'); stage.style.setProperty('--sy', my + 'px');
    if (down) {
      const dx = e.clientX - lx, dy = e.clientY - ly, now = performance.now(), dt = Math.max(1, now - lt);
      ox += dx / zoom; oy += dy / zoom;
      vx = dx / zoom * (16 / dt) * 0.9; vy = dy / zoom * (16 / dt) * 0.9;
      lx = e.clientX; ly = e.clientY; lt = now;
      moved = Math.max(moved, Math.hypot(e.clientX - sx0, e.clientY - sy0));
      if (moved > 6) { stage.classList.add('has-moved'); zoomTarget = 1; clearTimeout(holdTimer); }
    }
    if (!open) schedule();
  });
  const release = (e) => {
    if (!down) return;
    down = false; clearTimeout(holdTimer); zoomTarget = 1;
    stage.classList.remove('is-down');
    if (performance.now() - lt > 90) vx = vy = 0;   // paused before release: no throw
    if (reduce.matches) vx = vy = 0;
    if (e.type === 'pointerup' && moved < 6) {
      const card = cardAt(e.clientX, e.clientY);
      if (card) openCard(card);
    }
    schedule();
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('pointerleave', () => { if (!down) { mx = my = null; schedule(); } });

  // ---- keyboard: arrows pan, Enter opens the card nearest the centre
  stage.addEventListener('keydown', (e) => {
    if (open) return;
    const k = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (k) {
      e.preventDefault(); stage.classList.add('has-moved');
      if (reduce.matches) { ox += k[0] * 140; oy += k[1] * 140; render(); }   // step, no glide
      else { vx = k[0] * 14; vy = k[1] * 14; schedule(); }
    }
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      let best = null, bd = Infinity;
      for (const el of cards.values()) {
        const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
        const d = Math.hypot(r.left + r.width / 2 - (s.left + s.width / 2), r.top + r.height / 2 - (s.top + s.height / 2));
        if (d < bd) { bd = d; best = el; }
      }
      if (best) openCard(best);
    }
  });

  // ---- focused photo (FLIP from the card to the centre)
  let typer = 0, flip = null;
  const type = (lines) => {
    clearInterval(typer);
    const els = [tT, tM, tD]; els.forEach((el) => { el.textContent = ''; el.classList.remove('is-typing'); });
    if (reduce.matches) { lines.forEach((t, n) => { els[n].textContent = t; }); return; }
    let n = 0, c = 0; els[0].classList.add('is-typing');
    typer = setInterval(() => {
      if (c >= lines[n].length) { els[n].classList.remove('is-typing'); n++; c = 0; if (n >= lines.length) { clearInterval(typer); return; } els[n].classList.add('is-typing'); }
      els[n].textContent = lines[n].slice(0, ++c);
    }, 16);
  };

  const fitSize = (p) => {
    const maxH = Math.max(160, sh - 190), maxW = Math.max(180, sw - 40);
    let w = Math.min(maxW, Math.max(W * 1.5, Math.min(640, sw * 0.6)));
    let h = w * p.h / p.w;
    if (h > maxH) { h = maxH; w = h * p.w / p.h; }
    return { w: Math.round(w), h: Math.round(h) };
  };

  const openCard = (card) => {
    if (open) return;
    const p = card._p, from = card.getBoundingClientRect(), sr0 = stage.getBoundingClientRect();
    open = { card, p, opener: document.activeElement };
    vx = vy = 0; zoomTarget = 1;
    stage.classList.add('is-open');
    focusImg.src = p.src; focusImg.alt = p.alt;
    const { w, h } = fitSize(p);
    focusImg.style.width = w + 'px'; focusImg.style.height = h + 'px';
    sr.textContent = `${p.title}. ${p.meta}. ${p.desc}`;
    focusEl.setAttribute('aria-label', p.title);
    focusEl.hidden = false;
    tilt.style.transition = 'none'; tilt.style.transform = '';
    requestAnimationFrame(() => {
      focusEl.classList.add('is-in');
      const to = focusImg.getBoundingClientRect();
      card.classList.add('is-hidden');
      if (!reduce.matches && focusImg.animate) {
        flip = focusImg.animate([
          { transform: `translate(${from.left - to.left + (from.width - to.width) / 2}px,${from.top - to.top + (from.height - to.height) / 2}px) scale(${from.width / to.width},${from.height / to.height})` },
          { transform: 'none' }
        ], { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
      tilt.style.transition = '';
      type([p.title, p.meta, p.desc]);
    });
    closeBtn.focus({ preventScroll: true });
  };

  const closeCard = () => {
    if (!open) return;
    const { card, opener } = open;
    clearInterval(typer);
    const finish = () => {
      focusEl.hidden = true; focusEl.classList.remove('is-in');
      card.classList.remove('is-hidden');
      stage.classList.remove('is-open');
      tilt.style.transform = '';
      open = null; flip = null;
      (opener && opener.focus ? opener : stage).focus({ preventScroll: true });
      schedule();
    };
    focusEl.classList.remove('is-in');
    if (!reduce.matches && focusImg.animate && card.isConnected) {
      const from = card.getBoundingClientRect(), to = focusImg.getBoundingClientRect();
      flip = focusImg.animate([
        { transform: 'none' },
        { transform: `translate(${from.left - to.left + (from.width - to.width) / 2}px,${from.top - to.top + (from.height - to.height) / 2}px) scale(${from.width / to.width},${from.height / to.height})` }
      ], { duration: 420, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      flip.onfinish = finish;
    } else finish();
  };
  focusEl.addEventListener('click', closeCard);
  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); closeCard(); }
    else if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }  // single focusable control: keep focus inside the dialog
  });
  // 3D tilt following the cursor
  focusEl.addEventListener('pointermove', (e) => {
    if (reduce.matches || !open) return;
    const r = focusEl.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `perspective(900px) rotateY(${(nx * 14).toFixed(2)}deg) rotateX(${(-ny * 12).toFixed(2)}deg)`;
  });
  focusEl.addEventListener('pointerleave', () => { tilt.style.transform = ''; });

  // ---- filters (chips + deep links like /gallery/#philanthropy)
  const applyFilter = (key) => {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === key)));
    const next = key === 'all' ? all : all.filter((p) => p.sector === key);
    list = next.length ? next : all;
    for (const el of cards.values()) el.remove();
    cards.clear();
    if (status) status.textContent = `Showing ${next.length || all.length} photo${(next.length || all.length) === 1 ? '' : 's'}`;
    render(); schedule();
  };
  chips.forEach((c) => c.addEventListener('click', () => {
    applyFilter(c.dataset.filter);
    history.replaceState(null, '', c.dataset.filter === 'all' ? location.pathname : `#${c.dataset.filter}`);
  }));
  const syncFromHash = () => {
    const key = decodeURIComponent(location.hash.slice(1));
    applyFilter(chips.some((c) => c.dataset.filter === key) ? key : 'all');
  };
  addEventListener('hashchange', syncFromHash);

  // ---- setup
  measure();
  ox = -PX * 0.5; oy = 0;
  syncFromHash();
  new ResizeObserver(() => {
    const prevW = W; measure();
    if (open) closeCard();
    if (W !== prevW) { for (const el of cards.values()) el.remove(); cards.clear(); }
    render();
  }).observe(stage);
  // Gentle idle drift is intentionally omitted: the canvas only moves when the reader moves it.
})();
