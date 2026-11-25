/* Home case studies: previous/next arrows for the horizontal reel, disabled at either end. */
(() => {
  const reel = document.getElementById("reel");
  if (!reel) return;
  const [prev,next]=document.querySelectorAll('.arrows button');
  const syncArrows=()=>{prev.disabled=reel.scrollLeft<=4;next.disabled=reel.scrollLeft+reel.clientWidth>=reel.scrollWidth-4};
  [prev,next].forEach(b=>b.addEventListener('click',()=>reel.scrollBy({left:+b.dataset.dir*Math.min(reel.clientWidth*.7,640),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})));
  reel.addEventListener('scroll',syncArrows,{passive:true});addEventListener('resize',syncArrows);syncArrows();
})();
