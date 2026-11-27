/* "Pause motion": one control for the animations that loop on their own (hero background, logo row, closing glow,
   case study light, live indicator). Scroll and hover effects are not affected. The choice is remembered.
   Loaded before the animation scripts, which read window.vowAmbient. Reduced motion already stops these loops. */
(() => {
  const KEY = 'vow-motion';
  const listeners = [];
  let paused = false;
  try { paused = localStorage.getItem(KEY) === 'paused'; } catch { /* storage blocked: choice lasts for this page */ }

  window.vowAmbient = {
    get paused() { return paused; },
    onChange(fn) { listeners.push(fn); }
  };

  const buttons = document.querySelectorAll('[data-motion-toggle]');
  const hasLoops = document.querySelector('#heroCanvas, .logo-marquee, .cta, .cs-glows, .live-dot, [data-eco], [data-eco-iso]');
  if (!hasLoops || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sync = () => buttons.forEach((b) => {
    const label = paused ? 'Play Motion' : 'Pause Motion';
    b.classList.toggle('is-paused', paused);
    if (b.dataset.motionToggle === 'icon') b.setAttribute('aria-label', label);
    else b.textContent = label;
  });
  buttons.forEach((b) => {
    b.hidden = false;
    b.addEventListener('click', () => {
      paused = !paused;
      try { localStorage.setItem(KEY, paused ? 'paused' : 'playing'); } catch { /* storage blocked */ }
      sync();
      listeners.forEach((fn) => fn(paused));
    });
  });
  sync();
})();
