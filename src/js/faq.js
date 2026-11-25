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

  // Opening a question puts it in the address, so the page can be shared or reloaded on that answer
  document.querySelectorAll('details.faq-item > summary').forEach((summary) => summary.addEventListener('click', () => {
    const item = summary.parentElement;
    const opening = !item.open;
    if (opening) history.replaceState(null, '', `#${item.id}`);
    else if (location.hash === `#${item.id}`) history.replaceState(null, '', location.pathname + location.search);
  }));
})();
