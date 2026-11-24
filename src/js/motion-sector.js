/* Sector pages: one load timeline for the hero, a slow photo drift, and a count on the figures.
   Runs only when motion is allowed. matchMedia reverts every tween when that changes. */
(() => {
  const V = window.VOW;
  if (!V || !document.querySelector('.sector-hero')) return;
  const { mm, MOTION } = V;

  mm.add(MOTION, () => {
    const small = innerWidth < 768;

    /* fromTo, not from(): CSS hides these until GSAP runs, so the end state must be explicit. */
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo('.sector-copy .eyebrow', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.05)
      .fromTo('.sector-copy .display', { autoAlpha: 0, y: small ? 22 : 36 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.15)
      .fromTo('.sector-copy .lede', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.35)
      .fromTo('.sector-copy .ctas', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.5)
      .fromTo('.sector-frame', { autoAlpha: 0, scale: 1.05 }, { autoAlpha: 1, scale: 1, duration: 1.15, ease: 'power2.out' }, 0.1)
      .fromTo('.live-card', { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.75 }, 0.65)
      .from('.live-bar i', {
        scaleX: 0,
        duration: 0.85,
        stagger: 0.08,
        ease: 'power2.out',
        transformOrigin: 'left center'
      }, 0.85);

    gsap.to('.live-dot', {
      autoAlpha: 0.35,
      duration: 0.9,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.utils.toArray('[data-count]').forEach((el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const proxy = { n: 0 };
      if (!Number.isFinite(target)) return;
      gsap.to(proxy, {
        n: target,
        duration: 1.25,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => {
          el.textContent = Math.round(proxy.n).toLocaleString('en-US') + suffix;
        }
      });
    });
  });

  /* Photo drifts inside its frame. The frame itself is what the entrance scales, so the two don't fight. */
  mm.add(`(min-width: 768px) and ${MOTION}`, () => {
    const img = document.querySelector('.sector-frame img');
    if (!img) return;
    gsap.fromTo(img, { yPercent: -5, scale: 1.08 }, {
      yPercent: 5,
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.sector-visual',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6
      }
    });
  });
})();
