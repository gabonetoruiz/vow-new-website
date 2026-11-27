/* Demo and Custom Sales Deck forms: validate, then send to HubSpot (Forms API, no key needed). The demo form posts to the
   same HubSpot form the old contact page used. Field names, their HubSpot object (data-object) and the values must match
   the HubSpot form. A form without a form ID offers to send the details by email instead. */
(() => {
  const setup = (formId, thanksId, statusId) => {
  const form = document.getElementById(formId);
  if (!form) return;
  const thanks = document.getElementById(thanksId);
  const status = document.getElementById(statusId);
  const button = form.querySelector('[type="submit"]');
  const industries = form.querySelector('#industries');   // demo form only
  const fields = [...form.querySelectorAll('.field input, .field select')];
  const boxes = industries ? [...industries.querySelectorAll('input')] : [];

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
    if (!input.value.trim()) message = input.type === 'date' ? 'Choose a date.' : input.tagName === 'SELECT' ? 'Choose an option.' : 'Fill in this field.';
    else if (v.typeMismatch || (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()))) message = 'Enter a valid email address.';
    else if (v.rangeUnderflow) message = 'Choose today or a later date.';
    setError(input, message);
    return !message;
  };
  const checkIndustries = () => {
    if (!industries) return true;
    const ok = boxes.some((b) => b.checked);
    industries.classList.toggle('invalid', !ok);
    document.getElementById('industries-error').textContent = ok ? '' : 'Choose at least one.';
    return ok;
  };
  fields.forEach((i) => i.addEventListener('input', () => { if (i.closest('.invalid')) check(i); }));
  industries?.addEventListener('change', () => { if (industries.classList.contains('invalid')) checkIndustries(); });

  // Warn before leaving with details typed but not sent
  let dirty = false;
  form.addEventListener('input', () => { dirty = true; });
  addEventListener('beforeunload', (e) => { if (dirty) e.preventDefault(); });

  const label = button.querySelector('.ct-label');
  const idle = label.textContent;
  const setSending = (sending) => {
    button.disabled = sending;
    button.classList.toggle('is-sending', sending);
    button.setAttribute('aria-busy', String(sending));
    label.textContent = sending ? 'Sending…' : idle;
  };

  const showThanks = () => {
    dirty = false;
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
      const order = [...form.querySelectorAll('input, select')];
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
    if (industries) data.push({ objectTypeId: boxes[0].dataset.object, name: boxes[0].name,
      value: boxes.filter((b) => b.checked).map((b) => b.value).join(';') });

    if (!form.dataset.form) {   // not connected to HubSpot yet: nothing is sent, so say so and hand over to email
      const body = fields.map((i) => `${i.labels[0].textContent}: ${i.value.trim()}`).join('\n');
      const link = document.createElement('a');
      link.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent('Custom Sales Deck request')}&body=${encodeURIComponent(body)}`;
      link.textContent = 'send these details by email';
      status.replaceChildren('Online requests aren’t available yet. Please ', link, '.');
      return;
    }

    // With cookie consent, HubSpot's visitor ID connects the earlier visits to this request
    const context = { pageUri: location.href, pageName: document.title };
    const visitor = window.vowConsent?.visitorId();
    if (visitor) context.hutk = visitor;

    setSending(true);
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
      console.error(`${formId}:`, error);
      status.textContent = 'Your request couldn’t be sent. Please try again, or email the address above.';
    } finally {
      setSending(false);
    }
  });
  };
  setup('demoForm', 'formThanks', 'formStatus');
  setup('deckForm', 'deckThanks', 'deckStatus');
})();
