/* Home sectors: swap the preview image as a sector row is hovered or focused. */
(() => {
  const frameImgs=document.querySelectorAll('#sectorFrame img');
  const sectors=document.querySelectorAll('.sector');
  const show=li=>{
    sectors.forEach(s=>s.classList.toggle('on',s===li));
    frameImgs.forEach(img=>img.classList.toggle('on',img.dataset.key===li.dataset.key));
  };
  sectors.forEach(li=>['mouseenter','focus'].forEach(type=>li.addEventListener(type,()=>show(li))));
})();
