/* Contact page motion, matching the case study pages. Reduced motion: none of this runs and the page is fully visible.
   (The form and band copy use the shared [data-reveal] module.) */
(() => {
  const V = window.VOW;
  if (!V || !document.querySelector('.ct')) return;
  const { mm, MOTION } = V;

  // Wrap each word of a heading in a mask so it can rise into view
  const split = (el) => {
    const parts = el.children.length ? [...el.children] : [el];
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const words = [];
    parts.forEach((part) => {
      const text = part.textContent.trim().split(/\s+/);
      part.textContent = '';
      text.forEach((w, i) => {
        const m = document.createElement('span'); m.className = 'm'; m.setAttribute('aria-hidden', 'true');
        const s = document.createElement('span'); s.textContent = w;
        m.append(s); part.append(m); if (i < text.length - 1) part.append(' ');
        words.push(s);
      });
    });
    el.setAttribute('aria-label', label);
    return words;
  };
  const title = split(document.querySelector('.ct-title'));
  const big = split(document.querySelector('[data-ct="big"]'));

  mm.add({ isDesktop: `(min-width: 768px) and ${MOTION}`, isMobile: `(max-width: 767px) and ${MOTION}` }, (ctx) => {
    const { isDesktop } = ctx.conditions;
    const R = 'round 28px';

    /* 1 — Header: title rises, then intro, options and social links */
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .set('[data-ct="title"]', { autoAlpha: 1 }, 0)
      .fromTo(title, { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.09, ease: 'power4.out' }, 0.1)
      .fromTo('[data-ct="intro"]', { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.45)
      .fromTo('[data-ct="option"]', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.7)
      .fromTo('[data-ct="social"]', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 1);

    /* 2 — Photo: opens from a window and grows as you scroll to it, while the picture travels inside */
    const travel = isDesktop ? 13 : 9;
    gsap.fromTo('.ct-photo', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, scrollTrigger: { trigger: '.ct-photo-wrap', start: 'top bottom', once: true } });
    gsap.fromTo('.ct-photo', { clipPath: `inset(10% 10% 10% 10% ${R})` }, { clipPath: `inset(0% 0% 0% 0% ${R})`, ease: 'none',
      scrollTrigger: { trigger: '.ct-photo-wrap', start: 'top 90%', end: 'center center', scrub: 0.6 } });
    gsap.fromTo('.ct-photo img', { scale: 1.5, yPercent: -travel }, { scale: 1.28, yPercent: travel, ease: 'none',
      scrollTrigger: { trigger: '.ct-photo-wrap', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });

    /* 3 — Guest band: the line draws down and the big title rises word by word */
    gsap.fromTo('.ct-line', { scaleY: 0 }, { scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.ct-band', start: 'top 85%', end: 'center 55%', scrub: 0.5 } });
    gsap.timeline({ scrollTrigger: { trigger: '[data-ct="big"]', start: 'top 88%', once: true } })
      .set('[data-ct="big"]', { autoAlpha: 1 }, 0)
      .fromTo(big, { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.09, ease: 'power4.out' }, 0);
  });
})();
