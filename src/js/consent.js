/* Cookie consent and HubSpot lead tracking. Loaded on every page.
   - Nothing from HubSpot's tracking code loads until the visitor presses "Accept".
   - The choice is kept for six months; "Cookie settings" in the footer changes it.
   - A browser sending Global Privacy Control counts as "Decline" unless the visitor accepts here.
   - Withdrawing consent removes HubSpot's cookies and reloads the page without the tracking code. */
(() => {
  const banner = document.getElementById('consent');
  if (!banner) return;
  const KEY = 'vow-consent';
  const SIX_MONTHS = 1000 * 60 * 60 * 24 * 182;
  const portal = banner.dataset.portal;
  const gpc = navigator.globalPrivacyControl === true;
  const note = document.getElementById('consentNote');
  let choice = null; // 'granted' | 'denied' | null (not asked yet)
  let opener = null; // the "Cookie settings" button, when the notice was opened from it

  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && Date.now() - saved.at < SIX_MONTHS) choice = saved.choice;
  } catch { /* storage blocked: ask again on each page */ }

  const readCookie = (name) => document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1);

  const removeTracking = () => {
    const parts = location.hostname.split('.');
    // HubSpot sets its cookies on the widest domain the browser allows, so expire them at every level
    const domains = ['', ...parts.map((_, i) => `.${parts.slice(i).join('.')}`)];
    ['__hstc', 'hubspotutk', '__hssc', '__hssrc', 'messagesUtk'].forEach((name) => domains.forEach((d) => {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`;
    }));
    [localStorage, sessionStorage].forEach((store) => {
      try { Object.keys(store).filter((k) => /^(__hmpl|hublytics)/.test(k)).forEach((k) => store.removeItem(k)); } catch { /* storage blocked */ }
    });
  };

  const loadTracking = () => {
    if (document.getElementById('hs-script-loader')) return;
    window.disableHubSpotCookieBanner = true;                 // this banner replaces HubSpot's own
    window.hsConversationsSettings = { loadImmediately: false }; // no chat widget
    const script = document.createElement('script');
    script.id = 'hs-script-loader';
    script.async = true;
    script.src = `https://js-na1.hs-scripts.com/${portal}.js`;
    document.body.append(script);
  };

  const show = () => {
    note.hidden = !(choice || gpc);
    note.textContent = choice ? `Your current choice: ${choice === 'granted' ? 'accepted' : 'declined'}.`
      : 'Your browser asks sites not to track you, so tracking is off.';
    banner.hidden = false;
  };

  const choose = (next) => {
    const withdrawing = choice === 'granted' && next === 'denied';
    choice = next;
    try { localStorage.setItem(KEY, JSON.stringify({ choice, at: Date.now() })); } catch { /* storage blocked */ }
    banner.hidden = true;
    opener?.focus({ preventScroll: true });
    if (choice === 'granted') { loadTracking(); return; }
    removeTracking();
    if (withdrawing) location.reload();
  };

  banner.addEventListener('click', (e) => {
    const button = e.target.closest('[data-consent]');
    if (button) choose(button.dataset.consent);
  });
  document.querySelectorAll('[data-cookie-settings]').forEach((b) => {
    b.hidden = false;
    b.addEventListener('click', () => { opener = b; show(); banner.focus(); });
  });

  // The demo form passes HubSpot's visitor ID along, only with consent
  window.vowConsent = { visitorId: () => (choice === 'granted' ? readCookie('hubspotutk') : undefined) };

  if (choice === 'granted') loadTracking();
  else { removeTracking(); if (!choice && !gpc) show(); }
})();
