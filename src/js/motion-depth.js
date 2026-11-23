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

      gsap.set(frame, { perspective: 900 });

      const enter = () => {
        gsap.to(bg, { scale: 1.12, duration: 1.4, ease: 'power2.out' });
        gsap.to(fg, { scale: 1.06, duration: 0.7, ease: 'power3.out' });
        gsap.to(fg, { filter: 'drop-shadow(0 46px 54px rgba(5,3,40,.7))', duration: 0.7, ease: 'power3.out' });
      };
      const move = (e) => {
        const r = frame.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        // photo drifts opposite the pointer; the screen follows it, lifts and turns a little
        gsap.to(bg, { x: -nx * 26, y: -ny * 18, duration: 0.9, ease: 'power3.out', overwrite: 'auto' });
        gsap.to(fg, { x: nx * 18, y: ny * 12 - 8, rotationY: nx * 7, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
      };
      const leave = () => {
        gsap.to(bg, { scale: 1, x: 0, y: 0, duration: 1, ease: 'power3.out', overwrite: 'auto' });
        gsap.to(fg, { scale: 1, x: 0, y: 0, rotationY: 0, duration: 0.9, ease: 'power3.out', overwrite: 'auto' });
        gsap.to(fg, { filter: 'drop-shadow(0 30px 40px rgba(5,3,40,.6))', duration: 0.7, ease: 'power3.out' });
      };
      card.addEventListener('mouseenter', enter);
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);
      off.push(() => {
        card.removeEventListener('mouseenter', enter);
        card.removeEventListener('mousemove', move);
        card.removeEventListener('mouseleave', leave);
        gsap.set([bg, fg], { clearProps: 'all' });
        gsap.set(frame, { clearProps: 'perspective' });
      });
    });
    return () => off.forEach((fn) => fn());
  });
})();
