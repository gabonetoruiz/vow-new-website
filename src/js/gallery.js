/* Gallery: filter by sector, plus a keyboard- and swipe-friendly lightbox. */
(() => {
  const grid = document.getElementById('gGrid');
  const dlg = document.getElementById('lightbox');
  if (!grid || !dlg) return;

  const items = [...grid.querySelectorAll('.g-item')];
  const chips = [...document.querySelectorAll('.g-filters [data-filter]')];
  const status = document.getElementById('gStatus');
  const img = document.getElementById('lbImg');
  const cap = document.getElementById('lbCap');
  const count = document.getElementById('lbCount');

  let visible = items;
  let index = 0;
  let opener = null;

  // ---- filter
  const applyFilter = (key) => {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === key)));
    items.forEach((i) => { i.hidden = key !== 'all' && i.dataset.sector !== key; });
    visible = items.filter((i) => !i.hidden);
    if (status) status.textContent = `Showing ${visible.length} photo${visible.length === 1 ? '' : 's'}`;
    if (window.ScrollTrigger) ScrollTrigger.refresh(); // newly shown items may already be in view
  };
  chips.forEach((c) => c.addEventListener('click', () => {
    applyFilter(c.dataset.filter);
    history.replaceState(null, '', c.dataset.filter === 'all' ? location.pathname : `#${c.dataset.filter}`);
  }));
  // Deep links such as /gallery/#sports (from a sector page), plus Back/Forward and manual hash edits
  const syncFromHash = () => {
    const key = location.hash.slice(1);
    applyFilter(chips.some((c) => c.dataset.filter === key) ? key : 'all');
  };
  addEventListener('hashchange', syncFromHash);
  if (chips.some((c) => c.dataset.filter === location.hash.slice(1))) syncFromHash();

  // ---- lightbox
  const show = (i) => {
    index = (i + visible.length) % visible.length;
    const el = visible[index];
    const thumb = el.querySelector('img');
    img.src = thumb.currentSrc || thumb.src;
    img.alt = thumb.alt;
    cap.textContent = el.dataset.caption || '';
    count.textContent = `${index + 1} / ${visible.length}`;
    // warm the neighbours so next/prev feel instant
    [index + 1, index - 1].forEach((n) => { const t = visible[(n + visible.length) % visible.length].querySelector('img'); new Image().src = t.currentSrc || t.src; });
  };
  const open = (el) => {
    opener = el;
    show(visible.indexOf(el));
    dlg.showModal();
  };
  items.forEach((el) => el.addEventListener('click', () => open(el)));
  dlg.querySelector('.lb-close').addEventListener('click', () => dlg.close());
  dlg.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
  dlg.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
  dlg.addEventListener('close', () => { if (opener) opener.focus(); });

  // Click on the dark area closes; keys navigate (Esc is handled natively by <dialog>)
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.classList.contains('lb-stage')) dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
  });

  // Swipe on touch screens
  let startX = null;
  dlg.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') startX = e.clientX; });
  dlg.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
})();
