/* Case study pages: the animation language of the page.
   · Title: words rise out of a mask. Meta row and cover follow; the cover opens up from a window.
   · Overview statement: words light up one by one as you scroll through it.
   · Every image frame opens from a window and settles as it enters; on desktop the photos also drift inside their frames.
   · Figures count up. A thin line threaded down the page draws itself with the scroll.
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
      .fromTo('.cs-cover img', { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'power3.out' }, 0.9);

    // The cover photo drifts as you scroll past
    if (isDesktop) gsap.fromTo('.cs-cover img', { yPercent: -5 }, {
      yPercent: 6, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: '.cs-cover', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });

    /* 2 — Overview statement: words brighten with the scroll */
    const stmt = q('.cs-statement .w');
    if (stmt.length) {
      gsap.set('.cs-statement', { autoAlpha: 1 });
      gsap.fromTo(stmt, { opacity: 0.16 }, {
        opacity: 1, ease: 'none', stagger: 0.12,
        scrollTrigger: { trigger: '.cs-statement', start: 'top 82%', end: 'bottom 48%', scrub: 0.5 }
      });
    }

    /* 3 — Image frames: open from a window as they enter, then (desktop) drift inside the frame */
    gsap.utils.toArray('.cs-media [data-cs="frame"]').forEach((frame) => {
      const imgs = frame.querySelectorAll('img');
      gsap.fromTo(frame, { autoAlpha: 0, clipPath: `inset(12% 8% 12% 8% ${R})` }, {
        autoAlpha: 1, clipPath: `inset(0% 0% 0% 0% ${R})`, duration: 1.3, ease: 'power3.inOut',
        scrollTrigger: { trigger: frame, start: 'top 85%', once: true }
      });
      const bg = frame.querySelector('img.bg'), fg = frame.querySelector('img.fg');
      if (bg && fg) {
        // Product stage: photo and screen move at different speeds, so the two layers read as separate
        gsap.fromTo(bg, { scale: 1.2, yPercent: -4 }, { scale: 1.04, yPercent: 4, ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
        gsap.fromTo(fg, { yPercent: isDesktop ? 7 : 3 }, { yPercent: isDesktop ? -7 : -3, ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      } else if (isDesktop) {
        gsap.fromTo(imgs, { scale: 1.14, yPercent: -4 }, { scale: 1.02, yPercent: 4, ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      } else {
        gsap.fromTo(imgs, { scale: 1.1 }, { scale: 1, duration: 1.4, ease: 'power2.out',
          scrollTrigger: { trigger: frame, start: 'top 85%', once: true } });
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

    /* 5 — The thread: one line, drawn by the scroll */
    const path = document.querySelector('.cs-line path');
    if (path) gsap.fromTo(path, { strokeDashoffset: 1 }, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: '.cs', start: 'top 20%', end: 'bottom 80%', scrub: 0.8 }
    });
  });
})();
