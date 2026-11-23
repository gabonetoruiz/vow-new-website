/* Client logo marquee: an endless one-line loop that reacts to scroll speed, scroll direction and hover. */
(() => {
  const V = window.VOW;
  if (!V) return; // GSAP did not load (motion-core.js bails out): the page stays fully visible
  const { mm, MOTION } = V;

  /* 4 — Client logo marquee: an endless one-line loop that reacts to the reader.
     · Scroll speed boosts the loop and briefly skews it; on desktop it also follows scroll direction.
     · Hover eases it almost to a stop so a logo can be read.
     · Paused while off-screen. Reduced motion keeps the static centred row. */
  mm.add({
    isDesktop: `(min-width: 768px) and ${MOTION}`,
    isMobile: `(max-width: 767px) and ${MOTION}`
  }, (ctx) => {
    const { isDesktop } = ctx.conditions;
    const wrap = document.getElementById('logoMarquee');
    if (!wrap) return; // page has no logo row
    const list = wrap.querySelector('.logos');

    // Build the track: original list + an aria-hidden copy, so the loop is seamless
    const track = document.createElement('div');
    track.className = 'logo-track';
    list.before(track);
    track.append(list);
    const copy = list.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.removeAttribute('aria-label');
    copy.querySelectorAll('img').forEach((img) => { img.alt = ''; });
    track.append(copy);
    wrap.classList.add('is-marquee');

    // The loop: move one full copy-width, forever. Start deep into the timeline so it can also run backwards.
    const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: isDesktop ? 40 : 28, repeat: -1, paused: true });
    loop.totalTime(loop.duration() * 200);

    // Entrance: logos rise and settle one after another the first time the row appears
    // (inside the hero the row is already in view on load, so it waits for the headline reveal to get going)
    gsap.from(track.querySelectorAll('li'), {
      autoAlpha: 0, y: 28, scale: 0.92, duration: 1.1, ease: 'power3.out',
      delay: wrap.closest('.hero') ? 1.3 : 0,
      stagger: { each: 0.045, from: 'start' },
      scrollTrigger: { trigger: wrap, start: 'top 92%', once: true }
    });

    // Speed + skew driven by scroll velocity
    let dir = 1, hover = 1, settle;
    const speedTo = (ts, d) => gsap.to(loop, { timeScale: ts, duration: d, ease: 'power2.out', overwrite: true });
    const skewTo = gsap.quickTo(track, 'skewX', { duration: 0.6, ease: 'power3.out' });
    const clampBoost = gsap.utils.clamp(1, 6);
    const clampSkew = gsap.utils.clamp(-7, 7);

    ScrollTrigger.create({
      trigger: wrap, start: 'top bottom', end: 'bottom top',
      onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
      onUpdate: (self) => {
        const v = self.getVelocity();
        if (isDesktop && Math.abs(v) > 40) dir = v < 0 ? -1 : 1;
        speedTo(dir * hover * clampBoost(1 + Math.abs(v) / 350), 0.25);
        if (isDesktop) skewTo(clampSkew(-v / 260));
        clearTimeout(settle);
        settle = setTimeout(() => { speedTo(dir * hover, 1.6); skewTo(0); }, 140);
      }
    });

    // Hover: glide almost to a stop, then pick back up
    const enter = () => { hover = 0.12; speedTo(dir * hover, 0.8); };
    const leave = () => { hover = 1; speedTo(dir, 1.2); };
    const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (canHover) { wrap.addEventListener('mouseenter', enter); wrap.addEventListener('mouseleave', leave); }

    // Teardown: restore the original markup when this media query stops matching
    return () => {
      clearTimeout(settle);
      wrap.removeEventListener('mouseenter', enter);
      wrap.removeEventListener('mouseleave', leave);
      wrap.classList.remove('is-marquee');
      track.before(list);
      track.remove();
    };
  });
})();
