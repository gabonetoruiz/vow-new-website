/* Scroll reveals: one batched fade-and-slide for every content block, plus light scrubbed effects on desktop.
   To reveal an element on any page, add data-reveal to it; the REVEAL list below covers the home page sections. */
(() => {
  const V = window.VOW;
  if (!V) return; // GSAP did not load (motion-core.js bails out): the page stays fully visible
  const { mm, MOTION } = V;

  /* 2 — Scroll reveals: one batched fade-and-slide for every content block, staggered as they enter together.
     Desktop gets longer travel plus two light scrubbed effects; mobile keeps it short and cheap. */
  const REVEAL = [
    '.segments li',
    '.persp h2', '.persp .lede', '.outcomes li',
    '.products .head > *', '.prod',
    '.services .head > *', '.tile',
    '.sectors .intro > *', '.sector',
    '.quote blockquote', '.quote figcaption', // logos have their own entrance (see 4)
    '.cases .head > *', '.case',
    '.cta .wrap > *',
    '[data-reveal]'
  ].join(',');

  mm.add({
    isDesktop: `(min-width: 768px) and ${MOTION}`,
    isMobile: `(max-width: 767px) and ${MOTION}`
  }, (ctx) => {
    const { isDesktop } = ctx.conditions;
    const items = gsap.utils.toArray(REVEAL);
    // Opacity only, never visibility: hidden elements cannot receive focus, so Tab would skip everything not yet revealed
    gsap.set(items, { opacity: 0, y: isDesktop ? 40 : 20 });

    // Keyboard focus can land on a block before the scroll has revealed it: reveal it right then
    const revealFocused = (e) => {
      for (let el = e.target; el && el !== document.body; el = el.parentElement) {
        if (items.includes(el) && Number(gsap.getProperty(el, 'opacity')) < 1) {
          gsap.to(el, { opacity: 1, y: 0, duration: isDesktop ? 0.9 : 0.6, ease: 'power3.out', overwrite: true });
        }
      }
    };
    document.addEventListener('focusin', revealFocused);

    ScrollTrigger.batch(items, {
      start: 'top 88%',
      once: true,
      interval: 0.1,
      batchMax: isDesktop ? 6 : 3,
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1, y: 0,
        duration: isDesktop ? 0.9 : 0.6,
        stagger: isDesktop ? 0.08 : 0.05,
        ease: 'power3.out',
        overwrite: true
      })
    });

    if (isDesktop) {
      // Hero content drifts up and dims as you scroll away
      if (document.querySelector('.hero-body')) gsap.to('.hero-body', {
        y: -70, opacity: 0.25, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
      // Product UI mockups float gently against their photos
      gsap.utils.toArray('.prod').forEach((card) => {
        const ui = card.querySelector('.ui');
        if (!ui) return;
        gsap.fromTo(ui, { yPercent: 8 }, {
          yPercent: -6, ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
        });
      });
    }

    return () => document.removeEventListener('focusin', revealFocused);
  });
})();
