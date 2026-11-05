import { WebChatClient } from './web-chat-client.mjs?v=20261105-content-refusal';
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
const labels = document.documentElement.lang === 'he' ? {
  visitor: 'אתם',
  pending: 'מנסח תשובה…',
  session_limit: 'שיחת ההדגמה הגיעה למכסת ההודעות שלה.',
  rate_limited: 'נשלחו יותר מדי הודעות. אפשר לנסות שוב בעוד רגע.',
  busy: 'ההודעה הקודמת עדיין בעיבוד. אפשר לנסות שוב בעוד רגע.',
  timeout: 'התשובה מתעכבת. אפשר לנסות שוב בעוד רגע.',
  unavailable: 'השיחה אינה זמינה כרגע. אפשר לנסות שוב מאוחר יותר.',
  error: 'לא התקבלה תשובה להודעה הזו.',
  challenge_required: 'לא הצלחנו להשלים את האימות כרגע.',
  challenge_failed: 'לא הצלחנו להשלים את האימות כרגע.',
  budget_exhausted: 'הצ׳אט הגיע למכסה היומית שלו. אפשר לחזור מאוחר יותר.',
  agent_error: 'לא הצלחנו להשיב כרגע.',
  too_long: 'אפשר לשלוח עד 1,000 תווים בהודעה.',
  queue_full: 'אפשר לשלוח הודעה נוספת בעוד רגע. הטקסט שכתבתם נשמר.',
  cooldown: 'אפשר לשלוח הודעה נוספת בעוד רגע.',
} : {
  visitor: 'You',
  pending: 'Thinking…',
  session_limit: 'This demo conversation has reached its message limit.',
  rate_limited: 'Too many messages. Try again in a moment.',
  busy: 'The previous message is still processing. Try again in a moment.',
  timeout: 'The reply is taking longer than expected. Try again in a moment.',
  unavailable: 'Chat is temporarily unavailable. Try again later.',
  error: 'No reply was received for this message.',
  challenge_required: 'We couldn’t complete verification right now.',
  challenge_failed: 'We couldn’t complete verification right now.',
  budget_exhausted: 'Chat has reached its daily limit. Please come back later.',
  agent_error: 'We couldn’t reply right now.',
  too_long: 'Please use no more than 1,000 characters per message.',
  queue_full: 'Please wait a moment before sending another message. Your draft is preserved.',
  cooldown: 'Please wait a moment before sending another message.',
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
  onError: code => addMessage('agent', 'PowOrg AI', labels[code] || labels.error),
  onChange: renderState,
});

function renderState(state) {
  // Sending stays available during inference; later submissions retain their order.
  status.removeAttribute('data-error');
  status.textContent = state.busy ? labels.pending : '';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message || send.disabled) return;
  let outgoing;
  const error = client.enqueue(message, () => {
    if (!outgoing) outgoing = addMessage('visitor', labels.visitor, message);
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

invitations.forEach(button => { button.hidden = false; });
