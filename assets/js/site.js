/**
 * PowOrg Website v2 — Core Behaviors & Tracking (§6.7, §7.2 WP5)
 */

const $ = (id) => document.getElementById(id);

export function initSolutionsMenu() {
  const btn = $('solutions-menu-btn'), menu = $('solutions-menu');
  if (!btn || !menu) return;
  const toggle = (o) => { btn.setAttribute('aria-expanded', o); menu.classList.toggle('is-open', o); };
  btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(!menu.classList.contains('is-open')); });
  document.addEventListener('click', (e) => { !menu.contains(e.target) && e.target !== btn && toggle(false); });
  document.addEventListener('keydown', (e) => { e.key === 'Escape' && menu.classList.contains('is-open') && (toggle(false), btn.focus()); });
}

// Header "On this page" disclosure: anchor jump list to the homepage's main sections (2026-11-01)
export function initPageMenu() {
  const wrap = $('page-menu-wrap'), btn = $('page-menu-btn'), menu = $('page-menu');
  if (!wrap || !btn || !menu) return;
  const isOpen = () => menu.classList.contains('is-open');
  const toggle = (o) => { btn.setAttribute('aria-expanded', o); menu.classList.toggle('is-open', o); };
  btn.addEventListener('click', () => toggle(!isOpen()));
  // the solutions button stops propagation, so close this flyout explicitly when it opens
  const sBtn = $('solutions-menu-btn');
  sBtn && sBtn.addEventListener('click', () => toggle(false));
  document.addEventListener('click', (e) => { isOpen() && !wrap.contains(e.target) && toggle(false); });
  document.addEventListener('keydown', (e) => { e.key === 'Escape' && isOpen() && (toggle(false), btn.focus()); });
  menu.addEventListener('click', (e) => { e.target.closest('a') && toggle(false); });
  wrap.addEventListener('focusout', (e) => { isOpen() && !wrap.contains(e.relatedTarget) && e.relatedTarget && toggle(false); });
}

// Subtle current-section marker (aria-current="location") on the homepage only
export function initSectionMarker() {
  const links = Array.from(document.querySelectorAll('[data-section-link]'));
  const ids = [...new Set(links.map(a => a.dataset.sectionLink))];
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  if (sections.length !== ids.length || !('IntersectionObserver' in window)) return;
  const mark = (id) => links.forEach(a => a.dataset.sectionLink === id ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'));
  const visible = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => en.isIntersecting ? visible.set(en.target.id, en.target) : visible.delete(en.target.id));
    const cur = sections.filter(s => visible.has(s.id)).pop();
    cur && mark(cur.id);
  }, { rootMargin: '-35% 0px -60% 0px' });
  sections.forEach(s => io.observe(s));
}

function focusWhenVisible(el, tries = 20) {
  if (!el) return;
  el.focus();
  document.activeElement !== el && tries > 0 && requestAnimationFrame(() => focusWhenVisible(el, tries - 1));
}

const FOCUSABLE = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';

export function initMobileDrawer() {
  const toggleBtn = $('drawer-toggle-btn'), closeBtn = $('drawer-close-btn'), drawer = $('mobile-drawer'), overlay = $('drawer-overlay');
  if (!drawer) return;
  const getFocusable = () => Array.from(drawer.querySelectorAll(FOCUSABLE)).filter(el => !el.disabled && el.offsetParent !== null);
  const setDrawer = (open, restoreFocus = true) => {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', !open);
    overlay && overlay.classList.toggle('is-open', open);
    toggleBtn && toggleBtn.setAttribute('aria-expanded', !!open);
    document.body.classList.toggle('drawer-open', open);
    if (open) focusWhenVisible(closeBtn || getFocusable()[0]);
    else restoreFocus && toggleBtn && toggleBtn.focus();
  };
  // in-page section jumps: close the drawer and let the anchor navigation move the reader
  drawer.querySelectorAll('[data-section-link]').forEach(a => a.addEventListener('click', () => setDrawer(false, false)));
  [toggleBtn, closeBtn, overlay].forEach((el, i) => el && el.addEventListener('click', () => setDrawer(!i)));
  overlay && overlay.addEventListener('touchend', (e) => { e.preventDefault(); setDrawer(false); });
  document.addEventListener('keydown', (e) => {
    if (!drawer.classList.contains('is-open')) return;
    if (e.key === 'Escape') return setDrawer(false);
    if (e.key === 'Tab') {
      const items = getFocusable();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

// Allowed events and parameter whitelist (§6.7, WP5)
const ALLOWED_EVENTS = new Set(['cta_click','entry_choice','scenario_view','domain_view','contact_view','form_start','form_submit','lead_submit_success','lead_submit_error','email_fallback_click','lang_switch']);
const ALLOWED_PARAMS = new Set(['location','target','intent','slug','from','error_type']);

function isDebug() {
  try {
    const p = new URLSearchParams(location.search);
    return p.get('debug') === 'track' || (localStorage && localStorage.getItem('poworg_debug') === 'track');
  } catch (e) {}
  return false;
}

function dispatch(name, params) {
  // Connect future analytics tools (e.g. PostHog, Plausible, GA4) here.
}

export function track(name, params = {}) {
  if (!ALLOWED_EVENTS.has(name)) return;
  const clean = { page: (typeof location !== 'undefined' && location.pathname) || '/', lang: (typeof document !== 'undefined' && document.documentElement.lang) || 'he' };
  for (const [k, v] of Object.entries(params)) {
    if (ALLOWED_PARAMS.has(k) && v != null) clean[k] = String(v);
  }
  if (isDebug()) console.log('[track] ' + name, JSON.stringify(clean));
  dispatch(name, clean);
}

const STORAGE_KEY = 'poworg_attribution';
const UTM_KEYS = ['source', 'medium', 'campaign', 'content', 'term'];

export function initSessionAttribution() {
  try {
    if (!sessionStorage || sessionStorage.getItem(STORAGE_KEY)) return;
    const p = new URLSearchParams(location.search);
    let ref = '';
    try { if (document.referrer && new URL(document.referrer).hostname !== location.hostname) ref = new URL(document.referrer).hostname; } catch (e) {}
    const o = { landing_page: location.pathname || '/', referrer_host: ref };
    UTM_KEYS.forEach(k => { o['utm_' + k] = p.get('utm_' + k) || ''; });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(o));
  } catch (e) {}
}

export function getSessionAttribution() {
  try {
    if (typeof window !== 'undefined' && sessionStorage) {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {}
  return { landing_page: (typeof location !== 'undefined' && location.pathname) || '/', referrer_host: '' };
}

export function initGlobalTracking() {
  document.addEventListener('click', (e) => {
    const t = e.target, l = t.closest('a[hreflang]'), m = t.closest('#btn-mailto-fallback, .direct-mail-link'), en = t.closest('[data-track-intent]'), c = t.closest('[data-track-location]');
    if (l) return track('lang_switch');
    if (m) return track('email_fallback_click');
    if (en) return track('entry_choice', { intent: en.getAttribute('data-track-intent') });
    if (c) track('cta_click', { location: c.getAttribute('data-track-location'), target: c.getAttribute('href') || '' });
  });
}

export function initPageViews() {
  const sc = document.querySelector('[data-scenario-slug]'), dm = document.querySelector('[data-domain-slug]');
  if (sc) return track('scenario_view', { slug: sc.dataset.scenarioSlug });
  if (dm) track('domain_view', { slug: dm.dataset.domainSlug });
}

export function initContactForm() {
  const form = $('contact-form');
  if (!form) return;

  const [stateSuccess, stateFailed, errorSummary, contextBar, contextTopic, removeCtxBtn, submitBtn, mailtoNote, btnRetry, btnMailtoFallback] =
    ['state-success', 'state-failed', 'form-error-summary', 'contact-context-bar', 'context-topic-name', 'remove-context-btn', 'submit-btn', 'mailto-mode-note', 'btn-retry', 'btn-mailto-fallback'].map($);
  const [hidType, hidSlug] = ['type', 'slug'].map(k => $('hidden-context-' + k)), [nameInp, emailInp, orgInp, msgInp, roleInp, phoneInp] = ['name', 'email', 'org', 'message', 'role', 'phone'].map(k => $('contact-' + k)), [nameErr, emailErr, orgErr] = ['name', 'email', 'org'].map(k => $(k + '-error'));
  const hpInp = $('form-hp'), lang = document.documentElement.lang || 'he';

  let catalog = { scenario: {}, domain: {} };
  try { catalog = JSON.parse($('poworg-context-catalog').textContent); } catch (e) {}

  const attr = getSessionAttribution();
  ['landing-page', 'referrer-host', ...UTM_KEYS.map(k => 'utm-' + k)].forEach(k => {
    const el = $('hidden-' + k);
    if (el) el.value = attr[k.replace(/-/g, '_')] || '';
  });

  const urlParams = new URLSearchParams(location.search);
  const fromParam = urlParams.get('from'), intentParam = urlParams.get('intent');
  let activeTopic = '';
  let fromOk = fromParam === 'menu:all_solutions' ? fromParam : '';

  let formStarted = false;
  const onStart = () => { if (!formStarted) { formStarted = true; track('form_start'); } };
  form.addEventListener('focusin', onStart, { passive: true });
  form.addEventListener('input', onStart, { passive: true });

  if (fromParam && fromParam.includes(':')) {
    const [type, slug] = fromParam.split(':');
    if (catalog[type] && catalog[type][slug]) {
      fromOk = type + ':' + slug;
      activeTopic = catalog[type][slug][lang] || catalog[type][slug]['he'] || slug;
      hidType && (hidType.value = type);
      hidSlug && (hidSlug.value = slug);
      if (contextBar && contextTopic) {
        contextTopic.innerHTML = activeTopic.replace(/AI/g, '<bdi>AI</bdi>');
        contextBar.classList.remove('is-hidden');
      }
    }
  }

  track('contact_view', { from: fromOk || (fromParam ? 'other' : '') });

  if (intentParam && ['defined_process', 'explore', 'other'].includes(intentParam)) {
    const r = form.querySelector(`input[name="intent"][value="${intentParam}"]`);
    if (r) r.checked = true;
  }

  removeCtxBtn && removeCtxBtn.addEventListener('click', (e) => {
    e.preventDefault();
    contextBar && contextBar.classList.add('is-hidden');
    contextTopic && (contextTopic.textContent = '');
    hidType && (hidType.value = 'none');
    hidSlug && (hidSlug.value = '');
    activeTopic = '';
    history.replaceState && history.replaceState({}, document.title, location.pathname);
  });

  const endpoint = (form.getAttribute('data-lead-endpoint') || '').trim(), contactEmail = (form.getAttribute('data-contact-email') || 'contact@poworg.com').trim(), isMailto = !endpoint;
  mailtoNote && mailtoNote.classList.toggle('is-hidden', !isMailto);

  function buildMailto(d) {
    const topic = activeTopic || (contextTopic ? contextTopic.textContent.trim() : '');
    const isEn = lang === 'en';
    const subj = isEn ? (topic ? `Inquiry regarding: ${topic}` : 'Inquiry from PowOrg website') : (topic ? `פנייה בנושא: ${topic}` : 'פנייה מאתר PowOrg');
    const itx = d.intent === 'explore' ? (isEn ? 'Want to understand where AI can help us' : 'רוצים להבין איפה AI יכול לעזור אצלנו') :
      d.intent === 'other' ? (isEn ? 'Something else' : 'משהו אחר') :
      (isEn ? 'We have a specific process in mind to improve' : 'יש לנו תהליך מסוים שנרצה לשפר');
    const L = [
      `${isEn ? 'Name' : 'שם'}: ${d.name || ''}`,
      `${isEn ? 'Email' : 'אימייל'}: ${d.email || ''}`,
      `${isEn ? 'Organization' : 'ארגון'}: ${d.organization || ''}`,
      `${isEn ? 'What would you like to explore' : 'מה תרצו לבדוק'}: ${itx}`
    ];
    [['Tell us in a few words:\n', 'ספרו לנו בכמה מילים:\n', d.message], ['Role: ', 'תפקיד: ', d.role], ['Phone: ', 'טלפון: ', d.phone], ['Regarding: ', 'נושא: ', topic]].forEach(([e, h, v]) => v && L.push((isEn ? e : h) + v));
    return `mailto:${contactEmail}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(L.join('\r\n\r\n'))}`;
  }

  const reqFields = [[nameInp, nameErr], [emailInp, emailErr], [orgInp, orgErr]];
  const clearErr = (inp, err) => {
    if (inp) { inp.classList.remove('is-invalid'); inp.removeAttribute('aria-invalid'); inp.removeAttribute('aria-describedby'); }
    if (err) err.classList.add('is-hidden');
  };
  reqFields.forEach(([inp, err]) => inp && inp.addEventListener('input', () => inp.classList.contains('is-invalid') && clearErr(inp, err)));

  function validate() {
    if (errorSummary) errorSummary.classList.add('is-hidden');
    reqFields.forEach(([inp, err]) => clearErr(inp, err));
    let valid = true, first = null;
    const check = (inp, err, ok) => {
      if (!ok) {
        valid = false;
        if (inp) {
          inp.classList.add('is-invalid');
          inp.setAttribute('aria-invalid', 'true');
          inp.setAttribute('aria-describedby', err.id);
          if (!first) first = inp;
        }
        if (err) err.classList.remove('is-hidden');
      }
    };
    check(nameInp, nameErr, nameInp && nameInp.value.trim());
    check(emailInp, emailErr, emailInp && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInp.value.trim()));
    check(orgInp, orgErr, orgInp && orgInp.value.trim());
    if (!valid) {
      if (errorSummary) errorSummary.classList.remove('is-hidden');
      if (first) first.focus();
      return false;
    }
    return true;
  }

  const hideAllStates = () => [stateSuccess, stateFailed, errorSummary].forEach(el => el && el.classList.add('is-hidden'));

  function showSuccess() {
    form.classList.add('is-hidden');
    contextBar && contextBar.classList.add('is-hidden');
    hideAllStates();
    if (stateSuccess) { stateSuccess.classList.remove('is-hidden'); focusWhenVisible(stateSuccess); }
    track('lead_submit_success');
  }

  function showFailed(errType, payload) {
    hideAllStates();
    if (stateFailed) { stateFailed.classList.remove('is-hidden'); focusWhenVisible(stateFailed); }
    if (btnMailtoFallback) btnMailtoFallback.href = buildMailto(payload);
    track('lead_submit_error', { error_type: errType });
  }

  let submitting = false;

  async function submit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (submitting) return;
    stateFailed && stateFailed.classList.add('is-hidden');
    if (!validate()) return;

    track('form_submit');

    const selIntent = form.querySelector('input[name="intent"]:checked');
    const curAttr = getSessionAttribution();
    const val = (el) => el ? el.value.trim() : '';

    const payload = {
      form_version: '2',
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
      landing_page: curAttr.landing_page || (location.pathname || '/'),
      referrer_host: curAttr.referrer_host || '',
      hp: hpInp ? hpInp.value : ''
    };
    UTM_KEYS.forEach(k => { payload['utm_' + k] = curAttr['utm_' + k] || ''; });

    if (isMailto) {
      if (payload.hp) return showSuccess();
      location.href = buildMailto(payload);
      return;
    }

    submitting = true;
    const origText = submitBtn ? submitBtn.textContent : '';
    submitBtn && (submitBtn.disabled = true, submitBtn.setAttribute('aria-busy', 'true'), submitBtn.textContent = lang === 'en' ? 'Sending…' : 'שולחים…');

    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 15000);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: ctrl.signal
      });
      clearTimeout(timer);
      const body = res.ok ? await res.json().catch(() => ({})) : {};
      if (res.ok && body.ok !== false) showSuccess();
      else showFailed(res.ok ? 'rejected' : `http_${res.status}`, payload);
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

  if (['127.0.0.1', 'localhost'].includes(location.hostname)) {
    const s = urlParams.get('state');
    if (s === 'error') validate();
    else if (s === 'success') showSuccess();
    else if (s === 'failed') showFailed('demo_test', { name: val(nameInp), email: val(emailInp), organization: val(orgInp), intent: 'defined_process' });
  }
}

function initSite() {
  initSolutionsMenu();
  initMobileDrawer();
  initPageMenu();
  initSectionMarker();
  initSessionAttribution();
  initGlobalTracking();
  initPageViews();
  initContactForm();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSite);
  else initSite();
}
