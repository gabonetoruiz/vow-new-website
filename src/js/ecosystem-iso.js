/* Ecosystem, option B. Tiles lie crooked around a hub until asked to assemble; the dashed links then draw in and
   flow towards the hub. With a mouse: hovering the figure assembles it, leaving scatters it, and the tile under the
   pointer lifts. Without hover (phones, tablets): it assembles while the section is on screen and scatters on leaving.
   "Pause motion" stops the flowing links. Reduced motion shows it assembled and still.

   The `data-config` of the element is an entry of _data/ecosystem.json. With only names it draws the home figure; with
   `ring` and `integrations` it draws the larger one, where each tile also carries a subtitle (listed below it on phones).

   Behaviour and drawing approach adapted from the "Settle" figure of Hairline, https://github.com/lucasmarkes/hairline
   MIT License, Copyright (c) 2026 Lucas Marques. Permission is granted, free of charge, to use, copy, modify, merge,
   publish, distribute, sublicense and/or sell copies, provided this notice is included. Provided "as is", without warranty. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const K = Math.SQRT1_2, THICK = 6, HUBT = 13, LIFT = 18;
  const RINGT = 8, CORET = 5;   // ringed figure: height of the platform, and of the low disc that carries VOW on it
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const make = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    parent.appendChild(el);
    return el;
  };
  const path = (pts) => 'M' + pts.map((p) => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L') + 'Z';
  const hull = (pts) => {
    const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = (list) => list.reduce((h, p) => { while (h.length > 1 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop(); h.push(p); return h; }, []).slice(0, -1);
    return half(s).concat(half(s.reverse()));
  };
  // a rounded rectangle of half-sides h (along the words) and k about (cx, cy), turned by `deg`; square without k
  const square = (cx, cy, h, r, deg, k = h) => {
    const c = Math.cos(deg * Math.PI / 180), s = Math.sin(deg * Math.PI / 180), out = [];
    [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach(([sx, sy], q) => {
      for (let j = 0; j <= 6; j++) {
        const a = (q + j / 6) * Math.PI / 2;
        const u = sx * (h - r) + Math.cos(a) * r, v = sy * (k - r) + Math.sin(a) * r;
        out.push([cx + u * c - v * s, cy + u * s + v * c]);
      }
    });
    return out;
  };

  // Seats around the hub, clockwise. Wide screens get a landscape ring; phones a portrait one, seen from higher up
  // and scattered less, so the words stay legible.
  const spread = (D, seats) => seats.map(([x, y]) => [x * D, y * D]);
  const flat = (seats) => seats.map(([u, w]) => [(w + u) * K, (w - u) * K]);   // from across/down to ground x/y
  // Where each tile lies while scattered: offset from its seat, angle and height
  const LOOSE = [[-14, 20, 17], [12, -22, -21], [22, 6, 24], [10, 24, -16], [-22, 8, 22], [-6, -18, -25],
    [-12, 8, 24], [10, -9, -19], [-8, -11, 21], [11, 9, -23], [-10, 10, 18], [9, -8, -20]];

  const HOME = {
    half: 33, hub: 42,
    wide: { seats: spread(104, [[-1, 0], [0, -1], [1, -1], [1, 0], [0, 1], [-1, 1]]), squash: 0.54, spread: 1 },
    tall: { seats: spread(88, [[-1, -1], [0, -1], [1, 0], [1, 1], [0, 1], [-1, 0]]), squash: 0.68, spread: 0.45 }
  };
  // Six groups of people, then the integrations: the first half on the left, the rest on the right
  const GRAND = {
    wide: { half: [72, 37], minor: [38, 21], hub: 112, core: 54, squash: 0.58, spread: 0.7, seats: flat([
      [0, -245], [232, -176], [232, 176], [0, 245], [-232, 176], [-232, -176],
      [-330, -82], [-330, 0], [-330, 82], [330, -82], [330, 0], [330, 82]]) },
    tall: { half: [47, 29], minor: [34, 19], hub: 80, core: 40, squash: 0.68, spread: 0.3, seats: flat([
      [0, -214], [92, -150], [92, 150], [0, 214], [-92, 150], [-92, -150],
      [-128, -70], [-128, 0], [-128, 70], [128, -70], [128, 0], [128, 70]]) }
  };

  // a circle on the ground, as a ring of points
  const circle = (r) => Array.from({ length: 72 }, (_, i) => [Math.cos(i * Math.PI / 36) * r, Math.sin(i * Math.PI / 36) * r]);

  document.querySelectorAll('[data-eco-iso]').forEach((stage, instance) => {
    const config = JSON.parse(stage.dataset.config);
    const grand = !!config.ring;
    const people = config.nodes.map((n) => (typeof n === 'string' ? { title: n } : n));
    const entries = people.concat((config.integrations || []).map((title) => ({ title, minor: true })));
    let narrow = false;
    let view = grand ? GRAND.wide : HOME.wide;
    // half-sizes of a tile: home tiles are square; on the ringed figure they are rectangles wide enough for their names
    const sizeOf = (i) => {
      if (!grand) return [HOME.half, HOME.half];
      return entries[i].minor ? view.minor : view.half;
    };
    const hubOf = () => (grand ? view.hub : HOME.hub);
    const P = (x, y, z = 0) => [(x - y) * K, (x + y) * K * view.squash - z];   // ground plane to screen
    const svg = make('svg', { 'aria-hidden': 'true' }, stage);
    const defs = make('defs', {}, svg);
    const blur = make('filter', { id: `iso-blur-${instance}`, x: '-60%', y: '-60%', width: '220%', height: '220%' }, defs);
    make('feGaussianBlur', { stdDeviation: 5 }, blur);
    const glow = make('filter', { id: `iso-glow-${instance}`, x: '-60%', y: '-80%', width: '220%', height: '260%' }, defs);
    make('feDropShadow', { dx: 0, dy: 0, stdDeviation: 7, 'flood-color': '#95A4FF', 'flood-opacity': 0.85 }, glow);
    const scene = make('g', {}, svg);
    stage.style.setProperty('--iso-glow', `url(#iso-glow-${instance})`);
    // lines of text on a lid, stacked about its centre; each is [text, class, line height]
    const write = (el, lines) => {
      el.replaceChildren();
      const height = lines.reduce((sum, l) => sum + l[2], 0);
      let y = -height / 2;
      lines.forEach(([text, cls, step]) => { make('tspan', { x: 0, y: y + step / 2, class: cls }, el).textContent = text; y += step; });
    };
    // breaks a phrase into lines of at most `max` characters, keeping "&" with the word after it
    const wrap = (text, max) => text.replace(/& /g, '&\u00a0').split(' ').reduce((lines, word) => {
      const last = lines[lines.length - 1];
      if (last !== undefined && (last + ' ' + word).length <= max) lines[lines.length - 1] = last + ' ' + word;
      else lines.push(word);
      return lines;
    }, []);
    const label = (parts, entry) => {
      const { title, sub } = entry;
      if (!grand) {
        // long names break into two lines so they fit their tile
        const lines = title.length > 13 ? [title.slice(0, title.indexOf(' ')), title.slice(title.indexOf(' ') + 1)] : [title];
        write(parts.text, lines.map((l) => [l, '', 11.5]));
      } else if (entry.minor) {
        write(parts.text, [[title, '', 14]]);
      } else {
        const head = wrap(title, narrow ? 14 : 22).map((l) => [l, '', 14]);
        const body = narrow || !sub ? [] : wrap(sub, 23).map((l, i) => [l, 'iso-sub', i ? 11 : 13]);
        write(parts.text, head.concat(body));
      }
    };
    const slab = (cls) => {
      const g = make('g', { class: cls }, scene);
      const shadow = make('path', { class: 'iso-shadow', filter: `url(#iso-blur-${instance})` }, g);
      const body = make('g', { class: 'iso-body' }, g);
      return { g, body, shadow, side: make('path', { class: 'iso-side' }, body), top: make('path', { class: 'iso-top' }, body), inset: make('path', { class: 'iso-inset' }, body), text: make('text', {}, body) };
    };
    const lay = (el, x, y, deg, z) => {
      // flat on the lid, in the same projection as the tile
      const c = Math.cos(deg * Math.PI / 180), n = Math.sin(deg * Math.PI / 180);
      const ex = P(c, n), ey = P(-n, c), o = P(x, y, z);
      el.setAttribute('transform', `matrix(${ex[0]} ${ex[1]} ${ey[0]} ${ey[1]} ${o[0]} ${o[1]})`);
    };
    const prism = (s, outline, insetLine, z, thick) => {
      const top = outline.map(([a, b]) => P(a, b, z + thick));
      s.side.setAttribute('d', path(hull(top.concat(outline.map(([a, b]) => P(a, b, z))))));
      s.top.setAttribute('d', path(top));
      s.inset.setAttribute('d', path(insetLine.map(([a, b]) => P(a, b, z + thick))));
    };
    const draw = (s, x, y, [h, k], deg, z, thick) => {
      const r = Math.min(h, k);
      prism(s, square(x, y, h, r * 0.3, deg, k), square(x, y, h - 3, r * 0.24, deg, k - 3), z, thick);
      lay(s.text, x, y, deg, z + thick);
    };

    const links = entries.map((e) => ({ el: make('path', { class: e.minor ? 'iso-link is-minor' : 'iso-link' }, scene), u: 0 }));
    // the ringed figure stands the hub on a platform carrying the ring words
    const platform = grand ? slab('iso-ring') : null;
    const words = grand ? config.ring.map((word, i) => {
      const arc = make('path', { id: `iso-arc-${instance}-${i}`, fill: 'none' }, defs);
      const group = make('g', {}, platform.body);
      const text = make('text', { class: 'iso-ring-word' }, group);
      const run = make('textPath', { href: `#iso-arc-${instance}-${i}`, startOffset: '50%' }, text);
      run.textContent = word;
      return { arc, group };
    }) : [];
    const hub = slab('iso-hub');
    write(hub.text, [[config.center, '', 32]]);
    const tiles = entries.map((entry, i) => {
      const rise = { k: [120, 82, 74][i % 3], c: [14, 12, 12][i % 3] };
      const back = [38, 44, 50][i % 3];
      return { s: slab(entry.minor ? 'iso-tile is-minor' : 'iso-tile'), entry, x: 0, v: 0, to: 0, goal: 0, wait: 0, lift: 0,
        rise, fall: { k: back, c: 2 * Math.sqrt(back) }, riseLag: [0, 90, 180][i % 3] + (entry.minor ? 240 : 0), lag: [160, 90, 0][i % 3] };
    });

    const pose = (i) => {
      const t = tiles[i], [sx, sy] = view.seats[i], [, , a] = LOOSE[i], z = 0, s = t.x, w = clamp(s);
      const dx = LOOSE[i][0] * view.spread, dy = LOOSE[i][1] * view.spread;
      return { x: lerp(sx + dx, sx, s), y: lerp(sy + dy, sy, s), a: lerp(a, 0, s), z: Math.max(0, lerp(z, 0, w) + 26 * w * (1 - w)) };
    };

    let order = '';
    const render = () => {
      if (grand) {
        prism(platform, circle(view.hub), circle(view.hub - 4), 0, RINGT);
        prism(hub, circle(view.core), circle(view.core - 4), RINGT, CORET);   // low, so it never hides the far ring word
        lay(hub.text, 0, 0, 0, RINGT + CORET);
        // each ring word follows an arc: top, right and left read clockwise, the bottom one the other way to stay upright
        const r = view.core + (view.hub - view.core) * 0.58;
        const at = (deg) => `${Math.cos(deg * Math.PI / 180) * r} ${Math.sin(deg * Math.PI / 180) * r}`;
        [[180, 270, 1], [270, 360, 1], [90, 0, 0], [90, 180, 1]].forEach(([from, to, sweep], i) => {
          words[i].arc.setAttribute('d', `M${at(from)}A${r} ${r} 0 0 ${sweep} ${at(to)}`);
          lay(words[i].group, 0, 0, 0, RINGT);
        });
      } else draw(hub, 0, 0, [HOME.hub, HOME.hub], 0, 0, HUBT);
      const stack = [{ g: hub.g, depth: 0 }];
      tiles.forEach((t, i) => {
        const p = pose(i);
        const size = sizeOf(i), [h, k] = size, half = Math.min(h, k);
        draw(t.s, p.x, p.y, size, p.a, p.z + t.lift * LIFT, THICK);
        // the shadow stays on the floor while the tile rises
        t.s.shadow.setAttribute('d', path(square(p.x + t.lift * 5, p.y + t.lift * 5, h, half * 0.3, p.a, k).map(([a, b]) => P(a, b))));
        t.s.shadow.style.opacity = t.lift * 0.8;
        stack.push({ g: t.s.g, depth: p.x + p.y + 6 * p.z });
        // the link runs from the tile to the hub's edge, so its dashes flow inwards; it draws out from the hub
        const [sx, sy] = view.seats[i], len = Math.hypot(sx, sy), ux = sx / len, uy = sy / len;
        const reach = hubOf() + 3;
        const from = P(ux * reach, uy * reach), to = P(sx - ux * (half + 1), sy - uy * (half + 1)), u = links[i].u;
        links[i].el.setAttribute('d', u > 0 ? `M${lerp(from[0], to[0], u)} ${lerp(from[1], to[1], u)}L${from[0]} ${from[1]}` : '');
      });
      stack.sort((a, b) => a.depth - b.depth);
      const key = stack.map((e) => [...tiles.map((t) => t.s.g), hub.g].indexOf(e.g)).join();
      if (key !== order) {
        order = key;
        stack.forEach((e) => { if (grand && e.g === hub.g) scene.appendChild(platform.g); scene.appendChild(e.g); });
      }
    };

    // 1 seats every tile, 0 scatters them; they leave out of step
    const retarget = (goal, instant) => {
      tiles.forEach((t, i) => {
        if (instant) { t.goal = t.to = t.x = goal; t.v = t.wait = 0; links[i].u = goal; return; }
        if (goal === t.goal) return;
        t.goal = goal;
        t.wait = goal ? t.riseLag : t.lag;
        if (!t.wait) t.to = goal;
      });
    };

    const frame = () => {
      const was = narrow;
      narrow = stage.clientWidth < 600;
      view = (grand ? GRAND : HOME)[narrow ? 'tall' : 'wide'];
      if (narrow !== was || !frame.done) tiles.forEach((t) => label(t.s, t.entry));
      frame.done = true;
      const pts = [];
      view.seats.forEach(([x, y], i) => {
        const dx = LOOSE[i][0] * view.spread, dy = LOOSE[i][1] * view.spread;
        [[x, y], [x + dx, y + dy]].forEach(([a, b]) => square(a, b, sizeOf(i)[0] + 5, 6, 0, sizeOf(i)[1] + 5).forEach(([u, v]) => pts.push(P(u, v), P(u, v, THICK + 8))));
      });
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const side = Math.max(...xs.map(Math.abs));       // keeps the hub centred
      const minY = Math.min(...ys), height = Math.max(...ys) - minY;
      svg.setAttribute('viewBox', `${-side} ${minY} ${side * 2} ${height}`);
      render();
    };

    // ---- what asks it to assemble, and which tile is lifted
    let visible = false, hover = false, focus = false, onScreen = false, lit = -1, raf = 0, last = 0;
    const wanted = () => (reduce.matches || focus || (mouse.matches ? hover : onScreen) ? 1 : 0);
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.033); last = now;
      retarget(wanted(), reduce.matches);
      tiles.forEach((t, i) => {
        if (t.wait > 0) { t.wait -= dt * 1000; if (t.wait <= 0) t.to = t.goal; }
        const spring = t.to < t.x ? t.fall : t.rise;
        t.v += (spring.k * (t.to - t.x) - spring.c * t.v) * dt;
        t.x += t.v * dt;
        // a link draws in once its tile is seated, and draws back out when the tile is asked to leave
        const want = t.x > 0.96 && t.goal >= 1 ? 1 : 0;
        links[i].u = clamp(links[i].u + Math.sign(want - links[i].u) * Math.min(Math.abs(want - links[i].u), dt / (want ? 0.6 : 0.35)));
        const up = i === lit ? 1 : 0;
        t.lift = reduce.matches ? up : t.lift + (up - t.lift) * Math.min(1, dt * 11);
        t.s.g.classList.toggle('is-lit', !!up);
      });
      render();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    const play = () => { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(tick); } };

    // The tile under the pointer, tested on its resting footprint so that lifting it cannot make it slip away
    const under = (e) => {
      const m = svg.getScreenCTM();
      if (!m) return -1;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      let found = -1, front = -Infinity;
      tiles.forEach((t, i) => {
        const q = pose(i), across = p.x / K;
        // test the lid, and also where the lid sits once lifted
        const hit = [0, t.lift * LIFT].some((rise) => {
          const down = (p.y + q.z + THICK + rise) / (K * view.squash);
          const dx = (down + across) / 2 - q.x, dy = (down - across) / 2 - q.y, a = -q.a * Math.PI / 180;
          const [h, k] = sizeOf(i);
          return Math.abs(dx * Math.cos(a) - dy * Math.sin(a)) <= h && Math.abs(dx * Math.sin(a) + dy * Math.cos(a)) <= k;
        });
        if (hit && q.x + q.y > front) { found = i; front = q.x + q.y; }
      });
      return found;
    };
    stage.addEventListener('pointerenter', () => { hover = true; });
    stage.addEventListener('pointermove', (e) => { if (mouse.matches) { hover = true; lit = under(e); } });
    stage.addEventListener('pointerleave', () => { hover = false; lit = -1; });
    stage.addEventListener('focus', () => { if (stage.matches(':focus-visible')) focus = true; });
    stage.addEventListener('blur', () => { focus = false; });

    new ResizeObserver(frame).observe(stage);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      // scrolled right past before the tiles finished leaving: put them back at once
      if (!visible) { hover = onScreen = false; lit = -1; if (!wanted()) { retarget(0, true); tiles.forEach((t) => { t.lift = 0; }); render(); } }
      play();
    }).observe(stage);
    // phones: assembled while most of the figure is on screen
    new IntersectionObserver(([entry]) => {
      // measured against the screen when the figure is taller than it
      const room = Math.min(entry.boundingClientRect.height, entry.rootBounds ? entry.rootBounds.height : innerHeight);
      onScreen = entry.intersectionRect.height >= room * 0.6;
    }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }).observe(stage);
    const sync = (paused) => stage.classList.toggle('is-paused', paused);
    sync(window.vowAmbient.paused);
    window.vowAmbient.onChange(sync);
    frame();
    if (reduce.matches) { retarget(1, true); render(); }
  });
})();
