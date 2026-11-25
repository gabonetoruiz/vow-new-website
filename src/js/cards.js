/* Spotlight cards: feed each card the cursor position relative to itself (fine pointers only).
   Pairs with the .prod/.tile/.case spotlight styles. Loaded on any page that has cards. */
(() => {
  if(matchMedia('(hover: hover) and (pointer: fine)').matches){
    const root=document.documentElement;
    const glowCards=[...document.querySelectorAll('.prod, .tile, .case, .glow')];
    let px=-9999,py=-9999,queued=false;
    const update=()=>{
      queued=false;
      root.style.setProperty('--xp',(px/innerWidth).toFixed(3));
      const rects=glowCards.map(c=>c.getBoundingClientRect()); // read everything first, then write
      glowCards.forEach((c,i)=>{
        const r=rects[i];
        if(r.bottom<-300||r.top>innerHeight+300||r.right<-300||r.left>innerWidth+300)return; // skip far-off cards
        c.style.setProperty('--mx',(px-r.left).toFixed(1)+'px');
        c.style.setProperty('--my',(py-r.top).toFixed(1)+'px');
      });
    };
    const queue=()=>{if(!queued){queued=true;requestAnimationFrame(update);}};
    addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;root.classList.add('glow-on');queue();},{passive:true});
    addEventListener('scroll',queue,{passive:true});
    document.getElementById('reel')?.addEventListener('scroll',queue,{passive:true});
    root.addEventListener('pointerleave',()=>root.classList.remove('glow-on'));
  }
})();
