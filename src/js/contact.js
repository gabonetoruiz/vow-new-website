/* Demo request form: validates, then sends to the same HubSpot form the old contact page used (Forms API, no key needed).
   Field names, their HubSpot object (data-object) and the values must match that form. */
(() => {
  const form = document.getElementById('demoForm');
  if (!form) return;
  const thanks = document.getElementById('formThanks');
  const status = document.getElementById('formStatus');
  const button = form.querySelector('[type="submit"]');
  const industries = document.getElementById('industries');
  const fields = [...form.querySelectorAll('.field input')];
  const boxes = [...industries.querySelectorAll('input')];

  // Demo dates cannot be in the past (today in the visitor's own time zone)
  const now = new Date();
  const today = new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  form.querySelectorAll('[data-future]').forEach((i) => { i.min = today; });

  const setError = (input, message) => {
    const field = input.closest('.field');
    let note = field.querySelector('.error');
    if (!note) {
      note = document.createElement('p'); note.className = 'error'; note.id = `${input.id}-error`; field.append(note);
      input.setAttribute('aria-describedby', note.id);
    }
    note.textContent = message;
    field.classList.toggle('invalid', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
  };
  const check = (input) => {
    const v = input.validity;
    let message = '';
    if (!input.value.trim()) message = input.type === 'date' ? 'Choose a date.' : 'Fill in this field.';
    else if (v.typeMismatch || (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()))) message = 'Enter a valid email address.';
    else if (v.rangeUnderflow) message = 'Choose today or a later date.';
    setError(input, message);
    return !message;
  };
  const checkIndustries = () => {
    const ok = boxes.some((b) => b.checked);
    industries.classList.toggle('invalid', !ok);
    document.getElementById('industries-error').textContent = ok ? '' : 'Choose at least one.';
    return ok;
  };
  fields.forEach((i) => i.addEventListener('input', () => { if (i.closest('.invalid')) check(i); }));
  industries.addEventListener('change', () => { if (industries.classList.contains('invalid')) checkIndustries(); });

  const showThanks = () => {
    form.hidden = true;
    thanks.hidden = false;
    thanks.focus();
    window.ScrollTrigger?.refresh();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    const bad = fields.filter((i) => !check(i));
    const industriesOk = checkIndustries();
    if (bad.length || !industriesOk) {
      const order = [...form.querySelectorAll('input')];
      const first = [...bad, ...(industriesOk ? [] : [boxes[0]])].sort((a, b) => order.indexOf(a) - order.indexOf(b))[0];
      first.focus();
      return;
    }
    if (form.elements.website.value) { showThanks(); return; } // bot

    // HubSpot takes dates as midnight UTC in milliseconds, and several checkbox values joined by ";"
    const data = fields.map((i) => ({
      objectTypeId: i.dataset.object, name: i.name,
      value: i.type === 'date' ? String(Date.parse(`${i.value}T00:00:00Z`)) : i.value.trim()
    }));
    data.push({ objectTypeId: boxes[0].dataset.object, name: boxes[0].name,
      value: boxes.filter((b) => b.checked).map((b) => b.value).join(';') });

    // With cookie consent, HubSpot's visitor ID connects the earlier visits to this request
    const context = { pageUri: location.href, pageName: document.title };
    const visitor = window.vowConsent?.visitorId();
    if (visitor) context.hutk = visitor;

    button.disabled = true;
    try {
      const response = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${form.dataset.portal}/${form.dataset.form}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: data, context })
      });
      if (response.ok) { showThanks(); return; }
      const result = await response.json().catch(() => ({}));
      const types = (result.errors || []).map((x) => x.errorType);
      const email = form.elements.email;
      if (types.includes('BLOCKED_EMAIL')) { setError(email, 'Use your work email address.'); email.focus(); }
      else if (types.includes('INVALID_EMAIL')) { setError(email, 'Enter a valid email address.'); email.focus(); }
      else throw new Error(result.message || response.status);
    } catch (error) {
      console.error('Demo form:', error);
      status.textContent = 'We couldn’t send your request. Please try again, or email us at the address above.';
    } finally {
      button.disabled = false;
    }
  });
})();
