/* Micro-interactions: crisp hover/press feedback on buttons, text links and cards (real hover devices only). */
(() => {
  const V = window.VOW;
  if (!V) return; // GSAP did not load (motion-core.js bails out): the page stays fully visible
  const { mm, MOTION } = V;

  /* 3 — Micro-interactions: only for real hover devices with motion allowed. */
  mm.add(`(hover: hover) and (pointer: fine) and ${MOTION}`, () => {
    const off = [];
    const on = (el, type, fn) => { el.addEventListener(type, fn); off.push(() => el.removeEventListener(type, fn)); };

    // Buttons: crisp lift, arrow nudge, press feedback
    gsap.utils.toArray('.btn').forEach((btn) => {
      const icon = btn.querySelector('svg');
      on(btn, 'mouseenter', () => {
        gsap.to(btn, { scale: 1.035, duration: 0.3, ease: 'power3.out', overwrite: 'auto' });
        if (icon) gsap.to(icon, { x: 3, y: -3, duration: 0.3, ease: 'power3.out', overwrite: 'auto' });
      });
      on(btn, 'mouseleave', () => {
        gsap.to(btn, { scale: 1, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
        if (icon) gsap.to(icon, { x: 0, y: 0, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
      });
      on(btn, 'pointerdown', () => gsap.to(btn, { scale: 0.97, duration: 0.12, ease: 'power2.out', overwrite: 'auto' }));
      on(btn, 'pointerup', () => gsap.to(btn, { scale: 1.035, duration: 0.35, ease: 'back.out(3)', overwrite: 'auto' }));
    });

    // Text links: arrow nudge
    gsap.utils.toArray('.link').forEach((link) => {
      const icon = link.querySelector('svg');
      if (!icon) return;
      on(link, 'mouseenter', () => gsap.to(icon, { x: 3, y: -3, duration: 0.3, ease: 'power3.out', overwrite: 'auto' }));
      on(link, 'mouseleave', () => gsap.to(icon, { x: 0, y: 0, duration: 0.4, ease: 'power3.out', overwrite: 'auto' }));
    });

    // Cards: lift, with a slow push-in on their image
    gsap.utils.toArray('.prod, .tile, .case, .glow').forEach((card) => {
      const img = card.querySelector('.field img, .prod-visual > img, :scope > img');
      on(card, 'mouseenter', () => {
        gsap.to(card, { y: -6, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        if (img) gsap.to(img, { scale: 1.04, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
      });
      on(card, 'mouseleave', () => {
        gsap.to(card, { y: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
        if (img) gsap.to(img, { scale: 1, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
      });
    });

    return () => off.forEach((fn) => fn()); // remove listeners when this media query stops matching
  });
})();
