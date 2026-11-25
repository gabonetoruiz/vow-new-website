/* Motion core: registers GSAP + ScrollTrigger, creates the shared matchMedia context, and handles
   refresh and teardown. Must load right after the GSAP scripts and BEFORE the other motion-*.js files. */
(() => {
  const root = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('js'); return; } // CDN failed: show everything
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('gsap-ready');

  const MOTION = '(prefers-reduced-motion: no-preference)';
  const mm = gsap.matchMedia();
  window.VOW = { mm, MOTION }; // shared with motion-hero / reveal / hover / marquee

  // Keep trigger positions accurate once fonts and images settle
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  // Refreshing can cancel the browser's own (smooth) jump to a link such as /contact/#demo, so make it again afterwards
  addEventListener('load', () => {
    ScrollTrigger.refresh();
    const arrived = performance.getEntriesByType('navigation')[0]?.type === 'navigate';
    const target = arrived && location.hash && document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant' }));
  });

  // Clean teardown: revert every tween, ScrollTrigger and listener
  window.vowMotion = { destroy: () => mm.revert() };
  addEventListener('pagehide', (e) => { if (!e.persisted) mm.revert(); });
})();
