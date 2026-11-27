/* Home sectors: swap the preview image as a row is hovered or focused, and open the description behind each eye.
   The eye opens on mouse hover, and toggles on click, tap or keyboard. Escape or a click elsewhere closes it. */
(() => {
  const frameImgs = document.querySelectorAll('#sectorFrame img');
  const rows = [...document.querySelectorAll('.sector')];
  const set = (row, open) => {
    row.classList.toggle('open', open);
    row.querySelector('.eye').setAttribute('aria-expanded', String(open));
    if (!open) delete row.dataset.pinned;
  };
  const closeAll = (except) => rows.forEach((r) => { if (r !== except) set(r, false); });
  const show = (row) => {
    rows.forEach((r) => r.classList.toggle('on', r === row));
    frameImgs.forEach((img) => img.classList.toggle('on', img.dataset.key === row.dataset.key));
  };
  rows.forEach((row) => {
    ['mouseenter', 'focusin'].forEach((type) => row.addEventListener(type, () => show(row)));
    const peek = row.querySelector('.peek');
    peek.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { closeAll(row); set(row, true); } });
    peek.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !row.dataset.pinned) set(row, false); });
    peek.addEventListener('focusout', (e) => { if (!peek.contains(e.relatedTarget)) set(row, false); });
    row.querySelector('.eye').addEventListener('click', () => {
      const open = !row.dataset.pinned;
      closeAll(row);
      set(row, open);
      if (open) row.dataset.pinned = '1';
    });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.peek')) closeAll(); });
})();
