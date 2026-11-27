/* Ecosystem entrance: the sphere grows in, the orbit appears, then the nodes settle one by one.
   It animates the buttons and the layers, never the list items, which js/ecosystem.js positions. */
(() => {
  const V = window.VOW;
  if (!V) return;
  V.mm.add(V.MOTION, () => {
    gsap.utils.toArray('[data-eco]').forEach((eco) => {
      // Opacity only, so the node buttons stay focusable before the entrance plays
      const tl = gsap.timeline({ scrollTrigger: { trigger: eco, start: 'top 75%', once: true } })
        .from(eco.querySelector('.eco-hub'), { scale: 0.5, opacity: 0, duration: 1, ease: 'power3.out' })
        .from(eco.querySelectorAll('.eco-space, .eco-floor'), { opacity: 0, duration: 0.7 }, '-=0.5')
        .from(eco.querySelectorAll('.eco-node'), { scale: 0.7, opacity: 0, duration: 0.5, stagger: 0.09, ease: 'power3.out', clearProps: 'transform' }, '-=0.5');
      eco.addEventListener('focusin', () => tl.progress(1), { once: true });
    });
  });
})();
