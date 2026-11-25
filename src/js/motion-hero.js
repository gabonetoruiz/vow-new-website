/* Home hero entrance: one orchestrated timeline on load, including the word-by-word blur reveal of the title. */
(() => {
  const V = window.VOW;
  if (!V) return; // GSAP did not load (motion-core.js bails out): the page stays fully visible
  const { mm, MOTION } = V;

  /* 1 — Hero entrance: one orchestrated timeline on load.
     Uses from() so each element settles on its own CSS values. */
  mm.add(MOTION, () => {
    const small = innerWidth < 768;
    const s = small ? 0.6 : 1; // shorter travel on small screens

    // Text reveal (port of TextReveal per="word" preset="fade-in-blur"):
    // split each headline line into words; screen readers get the full sentence once.
    const h1 = document.getElementById('hero-title');
    if (!h1) return; // page has no hero title
    const original = h1.innerHTML;
    const lines = h1.querySelectorAll('[data-hero="line"]');
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = [...lines].map((l) => l.textContent.trim()).join(' ');
    lines.forEach((line) => {
      const parts = line.textContent.split(/(\s+)/);
      line.textContent = '';
      line.setAttribute('aria-hidden', 'true');
      parts.forEach((part) => {
        if (/^\s+$/.test(part)) { line.append(part); return; }
        if (!part) return;
        // Also split after hyphens ("High-" "touch", "End-" "to-" "end.") so the reveal reads word by word
        part.split(/(?<=-)/).forEach((piece) => {
          const w = document.createElement('span');
          w.className = 'word';
          w.textContent = piece;
          line.append(w);
        });
      });
    });
    h1.prepend(sr);
    const words = h1.querySelectorAll('.word');

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-media', { autoAlpha: 0, scale: 1.08, duration: 2.6, ease: 'power2.out' }, 0)
      .from('[data-hero="nav"]', { autoAlpha: 0, y: -14, duration: 0.7, stagger: 0.06 }, 0.15)
      .from('[data-hero="eyebrow"]', { autoAlpha: 0, y: 16 * s, duration: 0.7 }, 0.2)
      .set(lines, { autoAlpha: 1 }, 0.15)
      // Blur reveal: each word sharpens and rises in turn. Kept short so the headline is readable within about 1.5s.
      .from(words, {
        autoAlpha: 0, y: 40 * s, scale: 0.94, filter: `blur(${small ? 10 : 16}px)`,
        transformOrigin: '50% 100%',
        duration: 0.9, stagger: 0.08, ease: 'power2.out',
        clearProps: 'filter' // drop the filter once sharp, so no lingering compositing cost
      }, 0.15)
      .from('[data-hero="sub"]', { autoAlpha: 0, y: 24 * s, duration: 0.7 }, 0.45)
      .from('[data-hero="cta"]', { autoAlpha: 0, y: 20 * s, duration: 0.6, stagger: 0.08 }, 0.6)
      .from('[data-hero="foot"]', { autoAlpha: 0, duration: 0.7 }, 0.85);

    return () => { h1.innerHTML = original; }; // restore the unsplit headline on teardown
  });
})();
