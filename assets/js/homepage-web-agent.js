import { WebChatClient } from './web-chat-client.mjs?v=20261105-recovery';
import { ChatTurnstile } from './web-chat-turnstile.mjs';
import { appendMessage } from './web-chat-links.mjs';

const invitations = [...document.querySelectorAll('[data-cube-open]')];
const invitation = document.querySelector('.cube-invitation');
const dialog = document.querySelector('#cube-chat');
const form = dialog.querySelector('form');
const input = form.elements.message;
const send = form.querySelector('button[type="submit"]');
const feed = dialog.querySelector('.cube-chat-feed');
const transcript = dialog.querySelector('.cube-chat-messages');
const suggestions = dialog.querySelector('[data-cube-suggestions]');
const status = dialog.querySelector('.cube-chat-status');
const retry = dialog.querySelector('[data-cube-retry]');
const discard = dialog.querySelector('[data-cube-discard]');
const reset = dialog.querySelector('[data-cube-reset]');
const labels = document.documentElement.lang === 'he' ? {
  visitor: 'אתם',
  pending: 'מנסח תשובה…',
  resetting: 'פותח שיחה חדשה…',
  session_limit: 'שיחת ההדגמה הגיעה למכסת ההודעות שלה.',
  rate_limited: 'נשלחו יותר מדי הודעות. אפשר לנסות שוב בעוד רגע.',
  busy: 'ההודעה הקודמת עדיין בעיבוד. אפשר לנסות שוב בעוד רגע.',
  timeout: 'התשובה מתעכבת. אפשר לנסות שוב בעוד רגע.',
  unavailable: 'השיחה אינה זמינה כרגע. אפשר לנסות שוב מאוחר יותר.',
  error: 'לא התקבלה תשובה להודעה הזו.',
  challenge_required: 'נדרש אימות נוסף. לחצו על ניסיון חוזר כדי להמשיך.',
  challenge_failed: 'האימות לא הושלם. לחצו על ניסיון חוזר ובצעו את האימות מחדש.',
  budget_exhausted: 'הצ׳אט הגיע למכסה היומית שלו. אפשר לחזור מאוחר יותר.',
  agent_error: 'לא הצלחנו להכין תשובה כרגע. ההודעה נשמרה לניסיון חוזר.',
  reset_error: 'לא הצלחנו לפתוח שיחה חדשה. השיחה נשמרה; אפשר לנסות שוב.',
  too_long: 'אפשר לשלוח עד 1,000 תווים בהודעה.',
  queue_full: 'ההודעות הממתינות יחד מוגבלות ל־1,000 תווים. הטקסט שכתבתם נשמר; שלחו אותו אחרי התשובה.',
  queued: count => `מנסח תשובה… ${count} הודעות ממתינות ויישלחו יחד אחריה.`,
  waiting: count => `${count} הודעות נוספות ממתינות. ההודעה שנכשלה נשמרה לניסיון חוזר.`,
  cooldown: seconds => `נשלחו יותר מדי הודעות. אפשר לנסות שוב בעוד ${seconds} שניות.`,
  replace_failed: 'אפשר לנסות שוב את ההודעה הקודמת, או לשלוח ניסוח חדש. שליחה חדשה תבטל את ההודעות שלא נשלחו.',
  delivery: { queued: 'ממתינה לשליחה', sending: 'נשלחת…', failed: 'לא התקבלה תשובה', skipped: 'הניסיון החוזר בוטל' },
} : {
  visitor: 'You',
  pending: 'Thinking…',
  resetting: 'Starting a new conversation…',
  session_limit: 'This demo conversation has reached its message limit.',
  rate_limited: 'Too many messages. Try again in a moment.',
  busy: 'The previous message is still processing. Try again in a moment.',
  timeout: 'The reply is taking longer than expected. Try again in a moment.',
  unavailable: 'Chat is temporarily unavailable. Try again later.',
  error: 'No reply was received for this message.',
  challenge_required: 'Verification is needed. Select Retry to continue.',
  challenge_failed: 'Verification was not completed. Select Retry and verify again.',
  budget_exhausted: 'Chat has reached its daily limit. Please come back later.',
  agent_error: 'We couldn’t prepare a reply. Your message is saved for retry.',
  reset_error: 'We couldn’t start a new conversation. Your conversation is saved; try again.',
  too_long: 'Please use no more than 1,000 characters per message.',
  queue_full: 'Queued messages are limited to 1,000 characters combined. Your draft is saved; send it after the reply.',
  queued: count => `Thinking… ${count} messages will be sent together after the reply.`,
  waiting: count => `${count} more messages are waiting. The failed message is saved for retry.`,
  cooldown: seconds => `Too many messages. You can retry in ${seconds} seconds.`,
  replace_failed: 'Retry the previous message or send different text. A new submission cancels messages that were not sent successfully.',
  delivery: { queued: 'Waiting to send', sending: 'Sending…', failed: 'No reply received', skipped: 'Retry cancelled' },
};

const narrowLayout = window.matchMedia('(max-width: 767px)');
const visualViewport = window.visualViewport;
let revealTimer;
let activeOpener;

function fitChatToViewport() {
  if (!visualViewport || !dialog.matches(':modal')) return;

  const keepLatestVisible = feed.scrollHeight - feed.scrollTop - feed.clientHeight <= 2;
  const visibleBottom = visualViewport.offsetTop + visualViewport.height;
  const bottomInset = Math.max(0, window.innerHeight - visibleBottom);

  dialog.style.setProperty('--cube-visible-height', `${visualViewport.height}px`);
  dialog.style.setProperty('--cube-bottom-inset', `${bottomInset}px`);
  if (keepLatestVisible) feed.scrollTop = feed.scrollHeight;
}

visualViewport?.addEventListener('resize', fitChatToViewport);
visualViewport?.addEventListener('scroll', fitChatToViewport);

function openChat() {
  if (dialog.open) { input.focus({ preventScroll: true }); return; }
  if (narrowLayout.matches) {
    dialog.showModal();
    fitChatToViewport();
  } else {
    dialog.show();
  }
  invitations.forEach(button => button.setAttribute('aria-expanded', 'true'));
  scrollToLatest();
}

invitations.forEach(button => button.addEventListener('click', () => {
  activeOpener = button;
  window.clearTimeout(revealTimer);
  if (button === invitation && !dialog.open) {
    invitation.setAttribute('data-opening', '');
    // Keep the open cube visible for a beat before showing the chat.
    revealTimer = window.setTimeout(openChat, 620);
  } else openChat();
}));

invitation?.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || dialog.open) return;
  window.clearTimeout(revealTimer);
  invitation.removeAttribute('data-opening');
});

dialog.querySelector('[data-cube-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !dialog.matches(':modal')) dialog.close();
});
dialog.addEventListener('close', () => {
  invitation?.removeAttribute('data-opening');
  invitations.forEach(button => button.setAttribute('aria-expanded', 'false'));
  activeOpener?.focus({ preventScroll: true });
});

function scrollToLatest() {
  // Wait for pending status, hidden suggestions and composer sizing to settle.
  requestAnimationFrame(() => { feed.scrollTop = feed.scrollHeight; });
}

function addMessage(speaker, label, message) {
  const item = document.createElement('li');
  const name = document.createElement('strong');
  const body = document.createElement('span');
  item.dataset.speaker = speaker;
  name.textContent = label;
  body.dir = 'auto';
  if (speaker === 'agent') appendMessage(body, message, location.href);
  else body.textContent = message;
  item.append(name, body);
  transcript.append(item);
  scrollToLatest();
  return item;
}

suggestions.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLButtonElement) || send.disabled) return;
  input.value = event.target.textContent.trim();
  form.requestSubmit();
});

input.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' || event.isComposing || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return;
  event.preventDefault();
  if (!event.repeat && !send.disabled && input.value.trim()) form.requestSubmit();
});

const client = new WebChatClient({
  challenge: new ChatTurnstile(dialog.querySelector('[data-cube-challenge]')),
  onReply: reply => addMessage('agent', 'PowOrg AI', reply),
  onChange: renderState,
});
let cooldownTimer;

function renderState(state) {
  clearTimeout(cooldownTimer);
  // Sending stays available during inference; it appends to the next batch.
  send.disabled = state.resetting || state.failure === 'reset_error';
  reset.disabled = state.busy;
  const limited = ['session_limit', 'budget_exhausted'].includes(state.failure);
  retry.hidden = !state.failure || limited || (!state.pending && state.failure !== 'reset_error');
  retry.disabled = state.busy || state.retrySeconds > 0;
  discard.hidden = !state.failure || !state.pending || state.failure === 'reset_error';
  discard.disabled = state.busy;
  status.toggleAttribute('data-error', Boolean(state.failure));
  if (state.failure) {
    status.textContent = state.failure === 'rate_limited' && state.retrySeconds
      ? labels.cooldown(state.retrySeconds) : labels[state.failure] || labels.error;
    if (state.failure !== 'reset_error' && !limited && !state.retrySeconds) status.textContent += ` ${labels.replace_failed}`;
  } else status.textContent = state.resetting ? labels.resetting : state.busy ? state.queued ? labels.queued(state.queued) : labels.pending : '';
  if (state.retrySeconds) cooldownTimer = setTimeout(() => renderState(client.snapshot()), 1000);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message || send.disabled) return;
  let outgoing;
  let receipt;
  const error = client.enqueue(message, delivery => {
    if (!outgoing) {
      outgoing = addMessage('visitor', labels.visitor, message);
      receipt = document.createElement('small');
      receipt.className = 'cube-chat-delivery';
      outgoing.append(receipt);
    }
    outgoing.dataset.delivery = delivery;
    receipt.textContent = labels.delivery[delivery] || '';
    receipt.hidden = !receipt.textContent;
  });
  if (error) {
    status.setAttribute('data-error', '');
    status.textContent = error === 'cooldown' ? labels.cooldown(client.snapshot().retrySeconds) : labels[error] || labels.error;
    return;
  }
  input.value = '';
  suggestions.hidden = true;
  input.focus({ preventScroll: true });
});

retry.addEventListener('click', () => { void client.retry(); });
discard.addEventListener('click', () => {
  client.discardPending();
  input.focus({ preventScroll: true });
});
reset.addEventListener('click', async () => {
  if (await client.reset()) {
    transcript.replaceChildren();
    suggestions.hidden = false;
    // Keep any unsent draft the visitor is editing.
    input.focus({ preventScroll: true });
  }
});

invitations.forEach(button => { button.hidden = false; });
