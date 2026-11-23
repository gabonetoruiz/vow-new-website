/* Navbar behaviour. Loaded on every page.
   - frosted background once the page is scrolled
   - Sectors dropdown: opens on hover (mouse) or click/Enter/Space (anyone), closes on Esc, outside click, or focus leaving
   - mobile menu: hamburger toggle, focus trap, Esc to close, page scroll locked while open */
(() => {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const root = document.documentElement;

  // ---- frosted bar
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = document.getElementById('navToggle');
  const panel = document.getElementById('navPanel');
  const mobile = matchMedia('(max-width: 960px)');
  const canHover = matchMedia('(hover: hover) and (pointer: fine)');
  const items = [...nav.querySelectorAll('.has-sub')];

  // ---- dropdowns
  const setSub = (item, open) => {
    item.classList.toggle('is-open', open);
    item.querySelector('.sub-trigger').setAttribute('aria-expanded', String(open));
  };
  const closeSubs = (except) => items.forEach((i) => { if (i !== except) setSub(i, false); });

  items.forEach((item) => {
    const trigger = item.querySelector('.sub-trigger');
    let timer;
    trigger.addEventListener('click', (e) => {
      // With a mouse on desktop, hovering has already opened the menu: a click must keep it open, not close it.
      // Keyboard presses (detail 0), touch and the mobile accordion toggle as usual.
      const mouseOnDesktop = canHover.matches && !mobile.matches && e.detail > 0;
      const open = mouseOnDesktop ? true : !item.classList.contains('is-open');
      closeSubs(item);
      setSub(item, open);
    });
    item.addEventListener('mouseenter', () => {
      if (mobile.matches || !canHover.matches) return;
      clearTimeout(timer);
      closeSubs(item);
      setSub(item, true);
    });
    item.addEventListener('mouseleave', () => {
      if (mobile.matches || !canHover.matches) return;
      timer = setTimeout(() => setSub(item, false), 140); // small grace period so the pointer can cross the gap
    });
    item.addEventListener('focusout', (e) => {
      if (mobile.matches) return;
      if (!item.contains(e.relatedTarget)) setSub(item, false);
    });
  });
  document.addEventListener('click', (e) => {
    if (!mobile.matches && !e.target.closest('.has-sub')) closeSubs();
  });

  // ---- mobile menu
  if (!toggle || !panel) return;
  const isOpen = () => root.classList.contains('nav-open');
  const setMenu = (open) => {
    root.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (!open) closeSubs();
  };
  toggle.addEventListener('click', () => setMenu(!isOpen()));

  // Close when a link inside the menu is used (including same-page anchors such as #contact)
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  // Leaving the mobile layout (rotate, resize): reset everything
  mobile.addEventListener('change', () => { setMenu(false); closeSubs(); });

  // ---- keyboard: Esc and Tab trap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isOpen()) { setMenu(false); toggle.focus(); return; }
      const open = items.find((i) => i.classList.contains('is-open'));
      if (open) { setSub(open, false); open.querySelector('.sub-trigger').focus(); }
      return;
    }
    if (e.key !== 'Tab' || !isOpen()) return;
    const focusable = [toggle, ...panel.querySelectorAll('a[href], button')].filter((el) => el.offsetParent !== null || el === toggle);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
