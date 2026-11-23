/* Home sectors: swap the preview image as a sector row is hovered. */
(() => {
  const frameImgs=document.querySelectorAll('#sectorFrame img');
  const sectors=document.querySelectorAll('.sector');
  sectors.forEach(li=>li.addEventListener('mouseenter',()=>{
    sectors.forEach(s=>s.classList.toggle('on',s===li));
    frameImgs.forEach(img=>img.classList.toggle('on',img.dataset.key===li.dataset.key));
  }));
})();
