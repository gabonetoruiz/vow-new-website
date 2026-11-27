/* Home markets row: its loop follows "Pause motion". */
(() => {
  const row = document.querySelector('.segments');
  if (!row || !window.vowAmbient) return;
  const sync = (paused) => row.classList.toggle('is-paused', paused);
  sync(window.vowAmbient.paused);
  window.vowAmbient.onChange(sync);
})();
