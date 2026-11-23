/* Product cards: the real screen and its background photo move as two separate layers.
   On hover the screen lifts and drifts with the pointer, the photo pushes in and drifts the other way. */
(() => {
  const V = window.VOW;
  if (!V) return; // GSAP did not load: cards stay static
  const { mm, MOTION } = V;

  mm.add(`(hover: hover) and (pointer: fine) and ${MOTION}`, () => {
    const off = [];
    gsap.utils.toArray('.prod').forEach((card) => {
      const frame = card.querySelector('.prod-visual');
      const bg = frame && frame.querySelector('img.bg');
      const fg = frame && frame.querySelector('picture img');
      if (!bg || !fg) return;

      const enter = () => {
        gsap.to(bg, { scale: 1.12, duration: 1.4, ease: 'power2.out' });
      };
      const move = (e) => {
        const r = frame.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        // photo drifts opposite the pointer; the screen follows it and lifts (whole pixels, no tilt, so the UI stays crisp)
        gsap.to(bg, { x: -nx * 26, y: -ny * 18, duration: 0.9, ease: 'power3.out', overwrite: 'auto' });
        gsap.to(fg, { x: nx * 18, y: ny * 12 - 8, duration: 0.6, ease: 'power3.out', overwrite: 'auto', modifiers: { x: (v) => Math.round(parseFloat(v)) + 'px', y: (v) => Math.round(parseFloat(v)) + 'px' } });
      };
      const leave = () => {
        gsap.to(bg, { scale: 1, x: 0, y: 0, duration: 1, ease: 'power3.out', overwrite: 'auto' });
        gsap.to(fg, { x: 0, y: 0, duration: 0.9, ease: 'power3.out', overwrite: 'auto' });
      };
      card.addEventListener('mouseenter', enter);
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);
      off.push(() => {
        card.removeEventListener('mouseenter', enter);
        card.removeEventListener('mousemove', move);
        card.removeEventListener('mouseleave', leave);
        gsap.set([bg, fg], { clearProps: 'all' });
      });
    });
    return () => off.forEach((fn) => fn());
  });
})();
