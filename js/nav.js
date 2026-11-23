/* Navbar: add a frosted background once the page is scrolled. Loaded on every page. */
(() => {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const onScroll=()=>nav.classList.toggle('scrolled',scrollY>24);
  addEventListener('scroll',onScroll,{passive:true});onScroll();
})();
