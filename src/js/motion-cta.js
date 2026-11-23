/* Closing call-to-action: the glow along the bottom edge is alive.
   · It rises into place as the section scrolls in, then breathes and drifts slowly.
   · A second, lighter glow drifts the other way, so the light seems to move through the shape.
   · On desktop the glow leans gently toward the cursor.
   · Paused while off-screen. Reduced motion keeps the static glow. */
(() => {
  const V = window.VOW;
  if (!V) return; // GSAP did not load: the glow stays static
  const { mm, MOTION } = V;

  mm.add({ isDesktop: `(min-width: 768px) and ${MOTION}`, isMobile: `(max-width: 767px) and ${MOTION}` }, (ctx) => {
    const { isDesktop } = ctx.conditions;
    const section = document.querySelector('.cta');
    const g1 = section && section.querySelector('.cta-glow.g1');
    const g2 = section && section.querySelector('.cta-glow.g2');
    if (!g1 || !g2) return;

    // Entrance: the light rises from below the edge as the section scrolls into view
    gsap.from([g1, g2], {
      yPercent: 40, duration: 2, ease: 'power3.out', stagger: 0.15,
      scrollTrigger: { trigger: section, start: 'top 85%', once: true }
    });

    // Idle motion: slow breathing and drift, wrapped in one timeline so it can be paused off-screen
    const idle = gsap.timeline({ paused: true, defaults: { ease: 'sine.inOut', repeat: -1, yoyo: true } });
    idle.to(g1, { scale: 1.1, xPercent: 6, duration: 7 }, 0)
        .to(g1, { opacity: 0.8, duration: 5 }, 0)
        .to(g2, { scale: 1.18, xPercent: -14, duration: 6 }, 0)
        .to(g2, { opacity: 0.35, duration: 4.5 }, 0);
    ScrollTrigger.create({
      trigger: section, start: 'top bottom', end: 'bottom top',
      onToggle: (self) => (self.isActive ? idle.play() : idle.pause())
    });

    // Pointer: the glow leans toward the cursor (a separate property, so it never fights the idle drift)
    let move, leave;
    if (isDesktop && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const lean1 = gsap.quickTo(g1, 'x', { duration: 1.4, ease: 'power3.out' });
      const lean2 = gsap.quickTo(g2, 'x', { duration: 1.1, ease: 'power3.out' });
      move = (e) => {
        const r = section.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        lean1(nx * 140); lean2(nx * 260);
      };
      leave = () => { lean1(0); lean2(0); };
      section.addEventListener('mousemove', move);
      section.addEventListener('mouseleave', leave);
    }

    return () => {
      if (move) { section.removeEventListener('mousemove', move); section.removeEventListener('mouseleave', leave); }
      idle.kill();
      gsap.set([g1, g2], { clearProps: 'all' });
    };
  });
})();
