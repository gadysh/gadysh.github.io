import { WebChatClient } from './web-chat-client.mjs';
import { ChatTurnstile } from './web-chat-turnstile.mjs';

const invitation = document.querySelector('[data-cube-open]');
const dialog = document.querySelector('#cube-chat');
const form = dialog.querySelector('form');
const input = form.elements.message;
const send = form.querySelector('button[type="submit"]');
const feed = dialog.querySelector('.cube-chat-feed');
const transcript = dialog.querySelector('.cube-chat-messages');
const suggestions = dialog.querySelector('[data-cube-suggestions]');
const status = dialog.querySelector('.cube-chat-status');
const retry = dialog.querySelector('[data-cube-retry]');
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
  error: 'לא הצלחנו לקבל תשובה. אפשר לנסות שוב.',
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
} : {
  visitor: 'You',
  pending: 'Thinking…',
  resetting: 'Starting a new conversation…',
  session_limit: 'This demo conversation has reached its message limit.',
  rate_limited: 'Too many messages. Try again in a moment.',
  busy: 'The previous message is still processing. Try again in a moment.',
  timeout: 'The reply is taking longer than expected. Try again in a moment.',
  unavailable: 'Chat is temporarily unavailable. Try again later.',
  error: 'We couldn’t get a reply. You can try again.',
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
};

const narrowLayout = window.matchMedia('(max-width: 767px)');
const visualViewport = window.visualViewport;
let revealTimer;

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
  if (narrowLayout.matches) {
    dialog.showModal();
    fitChatToViewport();
  } else {
    dialog.show();
    dialog.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  invitation.setAttribute('aria-expanded', 'true');
}

invitation.addEventListener('click', () => {
  if (dialog.open || invitation.hasAttribute('data-opening')) return;
  invitation.setAttribute('data-opening', '');
  // Keep the open cube visible for a beat before showing the chat.
  revealTimer = window.setTimeout(openChat, 620);
});

invitation.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || dialog.open) return;
  window.clearTimeout(revealTimer);
  invitation.removeAttribute('data-opening');
});

dialog.querySelector('[data-cube-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !dialog.matches(':modal')) dialog.close();
});
dialog.addEventListener('close', () => {
  invitation.removeAttribute('data-opening');
  invitation.setAttribute('aria-expanded', 'false');
  invitation.focus({ preventScroll: true });
});

function addMessage(speaker, label, message) {
  const item = document.createElement('li');
  const name = document.createElement('strong');
  const body = document.createElement('span');
  item.dataset.speaker = speaker;
  name.textContent = label;
  body.dir = 'auto';
  body.textContent = message;
  item.append(name, body);
  transcript.append(item);
  feed.scrollTop = feed.scrollHeight;
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
  retry.hidden = !state.failure;
  retry.disabled = state.busy || state.retrySeconds > 0;
  status.toggleAttribute('data-error', Boolean(state.failure));
  if (state.failure) {
    status.textContent = state.failure === 'rate_limited' && state.retrySeconds
      ? labels.cooldown(state.retrySeconds) : labels[state.failure] || labels.error;
    if (state.queued) status.textContent += ` ${labels.waiting(state.queued)}`;
  } else status.textContent = state.resetting ? labels.resetting : state.busy ? state.queued ? labels.queued(state.queued) : labels.pending : '';
  if (state.retrySeconds) cooldownTimer = setTimeout(() => renderState(client.snapshot()), 1000);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message || send.disabled) return;
  let outgoing;
  const error = client.enqueue(message, delivery => {
    if (!outgoing) outgoing = addMessage('visitor', labels.visitor, message);
    outgoing.dataset.delivery = delivery;
  });
  if (error) {
    status.setAttribute('data-error', '');
    status.textContent = labels[error] || labels.error;
    return;
  }
  input.value = '';
  suggestions.hidden = true;
  input.focus({ preventScroll: true });
});

retry.addEventListener('click', () => { void client.retry(); });
reset.addEventListener('click', async () => {
  if (await client.reset()) {
    transcript.replaceChildren();
    suggestions.hidden = false;
    // Keep any unsent draft the visitor is editing.
    input.focus({ preventScroll: true });
  }
});

invitation.hidden = false;
