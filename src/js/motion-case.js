/* Case study pages: the animation language of the page.
   · Title: words rise out of a mask. Meta row and cover follow; the cover opens up from a window.
   · Overview statement: words light up one by one as you scroll through it.
   · Photos move with the scroll: the cover grows to full size, frames open from a window, pictures travel and zoom
     inside them, the paired photos slide in and pass each other, and the product screen rises into place.
   · Figures count up. Soft gradients drift behind the page as you scroll.
   Reduced motion: none of this runs and the page is fully visible. (Text blocks use the shared [data-reveal] module.) */
(() => {
  const V = window.VOW;
  if (!V || !document.querySelector('.cs')) return;
  const { mm, MOTION } = V;

  mm.add({ isDesktop: `(min-width: 768px) and ${MOTION}`, isMobile: `(max-width: 767px) and ${MOTION}` }, (ctx) => {
    const { isDesktop } = ctx.conditions;
    const q = gsap.utils.selector('.cs');
    const R = 'round 28px';

    /* 1 — Header: split the title into masked words, then run one timeline */
    const title = document.querySelector('.cs-title');
    const words = [];
    if (title) {
      const text = title.textContent.trim();
      title.setAttribute('aria-label', text);
      title.textContent = '';
      text.split(/\s+/).forEach((w, i, all) => {
        const m = document.createElement('span'); m.className = 'm'; m.setAttribute('aria-hidden', 'true');
        const s = document.createElement('span'); s.textContent = w;
        m.append(s); title.append(m); if (i < all.length - 1) title.append(' ');
        words.push(s);
      });
    }
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.set('[data-cs="title"]', { autoAlpha: 1 }, 0)
      .fromTo('.crumb[data-cs]', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.05)
      .fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.09, ease: 'power4.out' }, 0.15)
      .fromTo('.cs-lede[data-cs]', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.6)
      .fromTo('.cs-meta[data-cs]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.75)
      .fromTo('.cs-meta > div', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.75)
      .fromTo('.cs-cover', { autoAlpha: 0, clipPath: `inset(16% 12% 0% 12% ${R})` },
        { autoAlpha: 1, clipPath: `inset(0% 0% 0% 0% ${R})`, duration: 1.5, ease: 'power3.inOut' }, 0.9)
      .fromTo('.cs-cover img', { scale: 1.6 }, { scale: 1.3, duration: 2, ease: 'power3.out' }, 0.9);

    // Shared scrub settings: progress runs while the element crosses the screen
    const through = (trigger) => ({ trigger, start: 'top bottom', end: 'bottom top', scrub: 0.6 });
    const arriving = (trigger) => ({ trigger, start: 'top bottom', end: 'center center', scrub: 0.6 });
    // How far a photo travels inside its frame (percent of its height). The zoom must stay above 1 + 2 × travel.
    const travel = isDesktop ? 13 : 9;

    // The cover grows to full size as you reach it, and the photo travels inside it
    if (document.querySelector('.cs-cover')) {
      gsap.fromTo('.cs-cover', { scale: isDesktop ? 0.86 : 0.92 }, { scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.cs-cover-wrap', start: 'top 80%', end: 'top 10%', scrub: 0.6 } });
      gsap.fromTo('.cs-cover img', { yPercent: -travel }, { yPercent: travel, ease: 'none',
        scrollTrigger: through('.cs-cover-wrap') });
    }

    /* 2 — Overview statement: words brighten with the scroll */
    const stmt = q('.cs-statement .w');
    if (stmt.length) {
      gsap.set('.cs-statement', { autoAlpha: 1 });
      gsap.fromTo(stmt, { opacity: 0.16 }, {
        opacity: 1, ease: 'none', stagger: 0.12,
        scrollTrigger: { trigger: '.cs-statement', start: 'top 82%', end: 'bottom 48%', scrub: 0.5 }
      });
    }

    /* 3 — Image frames: open from a window as you scroll to them, with the photos moving inside */
    gsap.utils.toArray('.cs-media [data-cs="frame"]').forEach((frame) => {
      const duo = frame.closest('.cs-duo');
      const side = duo ? Array.prototype.indexOf.call(duo.children, frame) : -1;
      // The trigger is the section, which stays put while the frame itself is moved
      const section = frame.closest('.cs-media');

      gsap.fromTo(frame, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5,
        scrollTrigger: { trigger: section, start: 'top 95%', once: true } });
      gsap.fromTo(frame, { clipPath: `inset(18% 16% 18% 16% ${R})` }, { clipPath: `inset(0% 0% 0% 0% ${R})`, ease: 'none',
        scrollTrigger: arriving(duo ? section : frame) });

      const bg = frame.querySelector('img.bg'), fg = frame.querySelector('img.fg');
      if (bg && fg) {
        // Product stage: the photo travels one way while the screen rises and grows into place
        gsap.fromTo(bg, { scale: 1.5, yPercent: -travel }, { scale: 1.28, yPercent: travel, ease: 'none',
          scrollTrigger: through(frame) });
        gsap.fromTo(fg, { scale: 0.68, yPercent: isDesktop ? 34 : 20 }, { scale: 1, yPercent: 0, ease: 'none',
          scrollTrigger: arriving(frame) });
        return;
      }

      gsap.fromTo(frame.querySelectorAll('img'), { scale: 1.55, yPercent: -travel }, { scale: 1.28, yPercent: travel,
        ease: 'none', scrollTrigger: through(duo ? section : frame) });

      if (duo) {
        // Paired photos slide in from opposite sides; on desktop they also pass each other vertically
        gsap.fromTo(frame, { xPercent: side ? 22 : -22 }, { xPercent: 0, ease: 'none', scrollTrigger: arriving(section) });
        if (isDesktop) gsap.fromTo(frame, { y: side ? 170 : -20 }, { y: side ? -110 : 80, ease: 'none',
          scrollTrigger: through(section) });
      }
    });

    /* 4 — Figures count up */
    gsap.utils.toArray('.cs-metrics [data-count]').forEach((el) => {
      const target = Number(el.dataset.count), suffix = el.dataset.suffix || '';
      if (!Number.isFinite(target)) return;
      const proxy = { n: 0 };
      gsap.to(proxy, {
        n: target, duration: 1.4, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => { el.textContent = Math.round(proxy.n).toLocaleString('en-US') + suffix; }
      });
    });

    /* 5 — Soft light behind the page: each glow drifts at its own speed with the scroll, and breathes slowly */
    gsap.utils.toArray('.cs-glows .g').forEach((g, i) => {
      const dir = i % 2 ? -1 : 1;
      gsap.fromTo(g, { yPercent: 18 * dir, xPercent: -8 * dir }, {
        yPercent: -18 * dir, xPercent: 8 * dir, ease: 'none',
        scrollTrigger: { trigger: '.cs', start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
      gsap.to(g, { scale: 1.12, opacity: 0.7, duration: 7 + i * 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
  });
})();
