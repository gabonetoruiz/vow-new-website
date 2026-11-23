/* FAQs: open (and scroll to) the question named in the URL hash, e.g. /faq/#existing-tools */
(() => {
  const openFromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (el && el.tagName === 'DETAILS') {
      el.open = true;
      el.scrollIntoView({ block: 'center' });
    }
  };
  openFromHash();
  addEventListener('hashchange', openFromHash);
})();
