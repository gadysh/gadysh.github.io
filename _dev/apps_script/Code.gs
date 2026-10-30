/**
 * PowOrg website lead receiver (Google Apps Script, bound to the leads sheet).
 *
 * The contact form POSTs one JSON lead (form_version "2", spec §6.6) as text/plain.
 * Each valid lead becomes a row in the "Leads" tab and a notification to NOTIFY_TO.
 * Script properties (Project Settings > Script properties):
 *   NOTIFY_TO      address that gets a notification per lead, e.g. contact@poworg.com
 *
 * Scopes are pinned in appsscript.json to this spreadsheet and to sending mail only.
 */

const SHEET_NAME = 'Leads';
const RETENTION_MONTHS = 24;
const GLOBAL_LIMIT_PER_MINUTE = 20;
const EMAIL_LIMIT_PER_HOUR = 3;

const INTENTS = ['defined_process', 'explore', 'other'];
const CONTEXT_TYPES = ['scenario', 'domain', 'page', 'none'];
const STATUSES = ['new', 'reviewed_fit', 'reviewed_not_now', 'call_scheduled', 'call_held',
  'in_progress', 'won', 'lost', 'paused'];
// Leads in these statuses never reached a call or work, so they expire after RETENTION_MONTHS
const PURGEABLE = ['new', 'reviewed_fit', 'reviewed_not_now'];

// Field name -> max length. Order is the column order after received_at and status.
const FIELDS = [
  ['name', 200], ['email', 254], ['organization', 200], ['intent', 20],
  ['message', 1500], ['role', 200], ['phone', 40],
  ['context_type', 20], ['context_slug', 100], ['lang', 5],
  ['landing_page', 300], ['referrer_host', 253],
  ['utm_source', 200], ['utm_medium', 200], ['utm_campaign', 200], ['utm_content', 200], ['utm_term', 200],
  ['submitted_at', 40], ['form_version', 5]
];
const HEADER = ['received_at', 'status'].concat(FIELDS.map(f => f[0])).concat(['notes']);

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;

function doPost(e) {
  try {
    const lead = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Honeypot filled: answer like a success and keep nothing
    if (lead.hp) return reply_(true);

    const clean = validate_(lead);
    if (!clean) return reply_(false, 'invalid');
    if (!withinRateLimit_(clean.email)) return reply_(false, 'rate_limited');

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet_().appendRow([new Date(), 'new'].concat(FIELDS.map(f => clean[f[0]])).concat(['']));
    } finally {
      lock.releaseLock();
    }

    notify_(clean);
    return reply_(true);
  } catch (err) {
    console.error(err);
    return reply_(false, 'server_error');
  }
}

// A GET answers with a short message, so the deployment URL can be checked in a browser
function doGet() {
  return reply_(true, 'receiver_up');
}

function validate_(lead) {
  if (String(lead.form_version) !== '2') return null;
  const out = {};
  for (const [key, max] of FIELDS) {
    const raw = lead[key] == null ? '' : String(lead[key]);
    // Drop control characters except newlines in the message, then cap the length
    let v = raw.replace(key === 'message' ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, '').trim();
    if (v.length > max) return null;
    out[key] = neutralize_(v);
  }
  if (!out.name || !out.organization || !EMAIL_RE.test(out.email)) return null;
  if (INTENTS.indexOf(out.intent) < 0) return null;
  if (CONTEXT_TYPES.indexOf(out.context_type || 'none') < 0) return null;
  return out;
}

// Keep sheet cells as plain text: a leading = + - @ would otherwise run as a formula
function neutralize_(v) {
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

function withinRateLimit_(email) {
  const cache = CacheService.getScriptCache();
  const minuteKey = 'g:' + Math.floor(Date.now() / 60000);
  const emailKey = 'e:' + email.toLowerCase();
  const global = Number(cache.get(minuteKey) || 0);
  const perEmail = Number(cache.get(emailKey) || 0);
  if (global >= GLOBAL_LIMIT_PER_MINUTE || perEmail >= EMAIL_LIMIT_PER_HOUR) return false;
  cache.put(minuteKey, String(global + 1), 120);
  cache.put(emailKey, String(perEmail + 1), 3600);
  return true;
}

function notify_(lead) {
  const to = PropertiesService.getScriptProperties().getProperty('NOTIFY_TO');
  if (!to) return;
  const topic = lead.context_slug ? ' · ' + lead.context_slug : '';
  const lines = [
    'שם: ' + lead.name,
    'אימייל: ' + lead.email,
    'ארגון: ' + lead.organization,
    'מה לבדוק: ' + lead.intent + topic,
    lead.role ? 'תפקיד: ' + lead.role : '',
    lead.phone ? 'טלפון: ' + lead.phone : '',
    lead.message ? '\n' + lead.message : '',
    '\nמקור: ' + [lead.landing_page, lead.referrer_host, lead.utm_source, lead.utm_campaign].filter(String).join(' · '),
    'הגיליון: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ].filter(String);
  MailApp.sendEmail({
    to: to,
    replyTo: lead.email,
    subject: 'פנייה חדשה מהאתר: ' + lead.organization.replace(/^'/, ''),
    body: lines.join('\n')
  });
}

function reply_(ok, code) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok, code: code || '' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || setupSheet();
}

/** Run once from the editor: creates the Leads tab, the header and the status dropdown. */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER]).setFontWeight('bold');
  sh.setFrozenRows(1);
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build();
  sh.getRange(2, 2, sh.getMaxRows() - 1, 1).setDataValidation(rule);
  return sh;
}

/** Monthly time trigger: deletes leads older than RETENTION_MONTHS that never reached a call. */
function purgeOldLeads() {
  const sh = sheet_();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);
  const rows = sh.getDataRange().getValues();
  for (let i = rows.length - 1; i >= 1; i--) {
    const received = rows[i][0], status = rows[i][1];
    if (received instanceof Date && received < cutoff && PURGEABLE.indexOf(status) >= 0) {
      sh.deleteRow(i + 1);
    }
  }
}
