/**
 * PowOrg Website v2 — Core Interactive Behaviors & Contact Form
 * Spec: claude_website_spec_v2.md (§2.4, §4.2, §4.3, §4.4, §6.4, §6.6, §7.2 WP4)
 */

const $ = (id) => document.getElementById(id);

export function initSolutionsMenu() {
  const btn = $('solutions-menu-btn'), menu = $('solutions-menu');
  if (!btn || !menu) return;
  const toggle = (open) => {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('is-open', open);
  };
  btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(btn.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('click', (e) => { if (menu.classList.contains('is-open') && !menu.contains(e.target) && e.target !== btn) toggle(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { toggle(false); btn.focus(); } });
}

function focusWhenVisible(el, tries = 20) {
  if (!el) return;
  el.focus();
  if (document.activeElement !== el && tries > 0) requestAnimationFrame(() => focusWhenVisible(el, tries - 1));
}

export function initMobileDrawer() {
  const toggleBtn = $('drawer-toggle-btn'), closeBtn = $('drawer-close-btn'), drawer = $('mobile-drawer'), overlay = $('drawer-overlay');
  if (!drawer) return;

  const getFocusable = () => Array.from(drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
    .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);

  const setDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (overlay) overlay.classList.toggle('is-open', open);
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('drawer-open', open);
    if (open) {
      const target = closeBtn || getFocusable()[0];
      if (target) focusWhenVisible(target);
    } else if (toggleBtn) {
      toggleBtn.focus();
    }
  };

  if (toggleBtn) toggleBtn.addEventListener('click', () => setDrawer(true));
  if (closeBtn) closeBtn.addEventListener('click', () => setDrawer(false));
  if (overlay) {
    overlay.addEventListener('click', () => setDrawer(false));
    overlay.addEventListener('touchend', (e) => { e.preventDefault(); setDrawer(false); });
  }

  document.addEventListener('keydown', (e) => {
    if (!drawer.classList.contains('is-open')) return;
    if (e.key === 'Escape') { setDrawer(false); return; }
    if (e.key === 'Tab') {
      const items = getFocusable();
      if (!items.length) return;
      if (e.shiftKey && document.activeElement === items[0]) {
        e.preventDefault(); items[items.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
        e.preventDefault(); items[0].focus();
      }
    }
  });
}

export function track(eventName, params = {}) {}

const STORAGE_KEY = 'poworg_attribution';

export function initSessionAttribution() {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      const p = new URLSearchParams(window.location.search);
      let refHost = '';
      if (document.referrer) {
        try {
          const r = new URL(document.referrer);
          if (r.hostname && r.hostname !== window.location.hostname) refHost = r.hostname;
        } catch (e) {}
      }
      const o = { landing_page: window.location.pathname || '/', referrer_host: refHost };
      ['source', 'medium', 'campaign', 'content', 'term'].forEach(k => { o['utm_' + k] = p.get('utm_' + k) || ''; });
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(o));
    }
  } catch (e) {}
}

export function getSessionAttribution() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {}
  return { landing_page: (typeof window !== 'undefined' && window.location.pathname) || '/', referrer_host: '' };
}

export function initContactForm() {
  const form = $('contact-form');
  if (!form) return;

  const stateSuccess = $('state-success'), stateFailed = $('state-failed'), errorSummary = $('form-error-summary');
  const contextBar = $('contact-context-bar'), contextTopic = $('context-topic-name'), removeCtxBtn = $('remove-context-btn');
  const submitBtn = $('submit-btn'), mailtoNote = $('mailto-mode-note');
  const btnRetry = $('btn-retry'), btnMailtoFallback = $('btn-mailto-fallback');

  const hidType = $('hidden-context-type'), hidSlug = $('hidden-context-slug');
  const nameInp = $('contact-name'), emailInp = $('contact-email'), orgInp = $('contact-org');
  const msgInp = $('contact-message'), roleInp = $('contact-role'), phoneInp = $('contact-phone'), hpInp = $('form-hp');
  const nameErr = $('name-error'), emailErr = $('email-error'), orgErr = $('org-error');

  const lang = document.documentElement.lang || 'he';

  let catalog = { scenario: {}, domain: {} };
  const catEl = $('poworg-context-catalog');
  if (catEl) {
    try { catalog = JSON.parse(catEl.textContent); } catch (e) {}
  }

  const attr = getSessionAttribution();
  ['landing-page', 'referrer-host', 'utm-source', 'utm-medium', 'utm-campaign', 'utm-content', 'utm-term'].forEach(k => {
    const el = $('hidden-' + k);
    if (el) el.value = attr[k.replace('-', '_')] || '';
  });

  const urlParams = new URLSearchParams(window.location.search);
  const fromParam = urlParams.get('from'), intentParam = urlParams.get('intent');
  let activeTopic = '';

  if (fromParam) {
    const idx = fromParam.indexOf(':');
    if (idx > 0) {
      const type = fromParam.substring(0, idx), slug = fromParam.substring(idx + 1);
      if (catalog[type] && catalog[type][slug]) {
        activeTopic = catalog[type][slug][lang] || catalog[type][slug]['he'] || slug;
        if (hidType) hidType.value = type;
        if (hidSlug) hidSlug.value = slug;
        if (contextBar && contextTopic) {
          contextTopic.innerHTML = activeTopic.replace(/AI/g, '<bdi>AI</bdi>');
          contextBar.classList.remove('is-hidden');
        }
      }
    }
  }

  if (intentParam && ['defined_process', 'explore', 'other'].includes(intentParam)) {
    const r = form.querySelector(`input[name="intent"][value="${intentParam}"]`);
    if (r) r.checked = true;
  }

  if (removeCtxBtn) {
    removeCtxBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (contextBar) contextBar.classList.add('is-hidden');
      if (contextTopic) contextTopic.textContent = '';
      if (hidType) hidType.value = 'none';
      if (hidSlug) hidSlug.value = '';
      activeTopic = '';
      if (window.history && window.history.replaceState) window.history.replaceState({}, document.title, window.location.pathname);
    });
  }

  const endpoint = (form.getAttribute('data-lead-endpoint') || '').trim();
  const contactEmail = (form.getAttribute('data-contact-email') || 'contact@poworg.com').trim();
  const isMailto = !endpoint;

  if (mailtoNote) mailtoNote.classList.toggle('is-hidden', !isMailto);

  const getIntentText = (val) => {
    const isEn = lang === 'en';
    if (val === 'explore') return isEn ? 'Want to understand where AI can help us' : 'רוצים להבין איפה AI יכול לעזור אצלנו';
    if (val === 'other') return isEn ? 'Something else' : 'משהו אחר';
    return isEn ? 'We have a specific process in mind to improve' : 'יש לנו תהליך מסוים שנרצה לשפר';
  };

  function buildMailto(data) {
    const topic = activeTopic || (contextTopic ? contextTopic.textContent.trim() : '');
    const isEn = lang === 'en';
    const subj = isEn ? (topic ? `Inquiry regarding: ${topic}` : 'Inquiry from PowOrg website') : (topic ? `פנייה בנושא: ${topic}` : 'פנייה מאתר PowOrg');
    const L = isEn ?
      [`Name: ${data.name || ''}`, `Email: ${data.email || ''}`, `Organization: ${data.organization || ''}`, `What would you like to explore: ${getIntentText(data.intent)}`] :
      [`שם: ${data.name || ''}`, `אימייל: ${data.email || ''}`, `ארגון: ${data.organization || ''}`, `מה תרצו לבדוק: ${getIntentText(data.intent)}`];
    if (data.message) L.push((isEn ? 'Tell us in a few words:\n' : 'ספרו לנו בכמה מילים:\n') + data.message);
    if (data.role) L.push((isEn ? 'Role: ' : 'תפקיד: ') + data.role);
    if (data.phone) L.push((isEn ? 'Phone: ' : 'טלפון: ') + data.phone);
    if (topic) L.push((isEn ? 'Regarding: ' : 'נושא: ') + topic);
    return `mailto:${contactEmail}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(L.join('\r\n\r\n'))}`;
  }

  [nameInp, emailInp, orgInp].forEach(inp => {
    if (!inp) return;
    inp.addEventListener('input', () => {
      if (inp.classList.contains('is-invalid')) {
        inp.classList.remove('is-invalid');
        inp.removeAttribute('aria-invalid');
        inp.removeAttribute('aria-describedby');
        const err = $(inp.id.replace('contact-', '') + '-error');
        if (err) err.classList.add('is-hidden');
      }
    });
  });

  function validate() {
    if (errorSummary) errorSummary.classList.add('is-hidden');
    [nameInp, emailInp, orgInp].forEach(inp => {
      if (inp) {
        inp.classList.remove('is-invalid');
        inp.removeAttribute('aria-invalid');
        inp.removeAttribute('aria-describedby');
      }
    });
    [nameErr, emailErr, orgErr].forEach(sp => { if (sp) sp.classList.add('is-hidden'); });

    let valid = true, first = null;
    const setErr = (inp, sp) => {
      valid = false;
      if (inp) {
        inp.classList.add('is-invalid');
        inp.setAttribute('aria-invalid', 'true');
        inp.setAttribute('aria-describedby', inp.id.replace('contact-', '') + '-error');
        if (!first) first = inp;
      }
      if (sp) sp.classList.remove('is-hidden');
    };

    if (!nameInp || !nameInp.value.trim()) setErr(nameInp, nameErr);
    if (!emailInp || !emailInp.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInp.value.trim())) setErr(emailInp, emailErr);
    if (!orgInp || !orgInp.value.trim()) setErr(orgInp, orgErr);

    if (!valid) {
      if (errorSummary) errorSummary.classList.remove('is-hidden');
      if (first) first.focus();
      return false;
    }
    return true;
  }

  function showSuccess() {
    form.classList.add('is-hidden');
    if (contextBar) contextBar.classList.add('is-hidden');
    if (stateFailed) stateFailed.classList.add('is-hidden');
    if (errorSummary) errorSummary.classList.add('is-hidden');
    if (stateSuccess) {
      stateSuccess.classList.remove('is-hidden');
      focusWhenVisible(stateSuccess);
    }
    track('lead_submit_success', { lang, context_type: (hidType && hidType.value) || 'none', context_slug: (hidSlug && hidSlug.value) || '' });
  }

  function showFailed(errType, payload) {
    if (stateSuccess) stateSuccess.classList.add('is-hidden');
    if (errorSummary) errorSummary.classList.add('is-hidden');
    if (stateFailed) {
      stateFailed.classList.remove('is-hidden');
      focusWhenVisible(stateFailed);
    }
    if (btnMailtoFallback) btnMailtoFallback.href = buildMailto(payload);
    track('lead_submit_error', { error_type: errType });
  }

  let submitting = false;

  async function submit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (submitting) return;
    if (stateFailed) stateFailed.classList.add('is-hidden');
    if (!validate()) return;

    const selIntent = form.querySelector('input[name="intent"]:checked');
    const curAttr = getSessionAttribution();
    const val = (el) => el ? el.value.trim() : '';

    const payload = {
      form_version: "2",
      submitted_at: new Date().toISOString(),
      lang,
      name: val(nameInp),
      email: val(emailInp),
      organization: val(orgInp),
      intent: selIntent ? selIntent.value : 'defined_process',
      message: val(msgInp),
      role: val(roleInp),
      phone: val(phoneInp),
      context_type: (hidType && hidType.value) || 'none',
      context_slug: (hidSlug && hidSlug.value) || '',
      landing_page: curAttr.landing_page || (window.location.pathname || '/'),
      referrer_host: curAttr.referrer_host || '',
      utm_source: curAttr.utm_source || '',
      utm_medium: curAttr.utm_medium || '',
      utm_campaign: curAttr.utm_campaign || '',
      utm_content: curAttr.utm_content || '',
      utm_term: curAttr.utm_term || '',
      hp: hpInp ? hpInp.value : ''
    };

    if (isMailto) {
      if (payload.hp) { showSuccess(); return; }
      window.location.href = buildMailto(payload);
      return;
    }

    submitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
    }
    const origText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) submitBtn.textContent = (lang === 'en') ? 'Sending…' : 'שולחים…';

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal
      });
      clearTimeout(timer);
      if (res.ok) showSuccess();
      else showFailed(`http_${res.status}`, payload);
    } catch (err) {
      clearTimeout(timer);
      showFailed(err.name === 'AbortError' ? 'timeout' : 'network', payload);
    } finally {
      submitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitBtn.textContent = origText;
      }
    }
  }

  form.addEventListener('submit', submit);
  if (btnRetry) btnRetry.addEventListener('click', (e) => { e.preventDefault(); submit(e); });

  // Review-only state switch: works on a local server, ignored on the live site
  const isLocal = ['127.0.0.1', 'localhost'].includes(window.location.hostname);
  const sParam = isLocal ? urlParams.get('state') : null;
  if (sParam === 'error') validate();
  else if (sParam === 'success') showSuccess();
  else if (sParam === 'failed') showFailed('demo_test', { name: val(nameInp), email: val(emailInp), organization: val(orgInp), intent: 'defined_process' });

  document.querySelectorAll('[data-set-state]').forEach(b => {
    b.addEventListener('click', () => {
      const s = b.getAttribute('data-set-state');
      if (s === 'error') validate();
      else if (s === 'success') showSuccess();
      else if (s === 'failed') showFailed('manual', {});
      else {
        form.classList.remove('is-hidden');
        if (stateSuccess) stateSuccess.classList.add('is-hidden');
        if (stateFailed) stateFailed.classList.add('is-hidden');
        if (errorSummary) errorSummary.classList.add('is-hidden');
      }
    });
  });
}

function initSite() {
  initSolutionsMenu();
  initMobileDrawer();
  initSessionAttribution();
  initContactForm();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSite);
  else initSite();
}
